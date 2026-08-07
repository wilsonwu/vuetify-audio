<template>
    <v-card :variant="flat ? 'flat' : 'elevated'">
        <v-img
            v-if="displayImage"
            :alt="displayTitle || ''"
            cover
            height="200"
            :src="displayImage"
        />
        <v-card-title v-if="displayTitle">{{ displayTitle }}</v-card-title>
        <v-card-text class="text-center">
            <div class="d-flex flex-wrap justify-center">
                <v-btn
                    :aria-label="playing ? 'Pause' : 'Play'"
                    class="ma-2"
                    :color="color"
                    :disabled="!loaded"
                    icon
                    variant="outlined"
                    @click="togglePlayback"
                >
                    <v-icon>{{ playing ? pauseIcon : playIcon }}</v-icon>
                </v-btn>
                <v-btn
                    aria-label="Stop"
                    class="ma-2"
                    :color="color"
                    :disabled="!loaded"
                    icon
                    variant="outlined"
                    @click="stop"
                >
                    <v-icon>{{ stopIcon }}</v-icon>
                </v-btn>
                <v-btn
                    :aria-label="isMuted ? 'Unmute' : 'Mute'"
                    class="ma-2"
                    :color="color"
                    :disabled="!loaded"
                    icon
                    variant="outlined"
                    @click="mute"
                >
                    <v-icon>{{ isMuted ? volumeMuteIcon : volumeHighIcon }}</v-icon>
                </v-btn>
                <v-btn
                    v-if="!loaded"
                    aria-label="Reload"
                    class="ma-2"
                    :color="color"
                    :disabled="!file"
                    icon
                    variant="outlined"
                    @click="reload"
                >
                    <v-icon>{{ refreshIcon }}</v-icon>
                </v-btn>
                <v-btn
                    v-else-if="downloadable"
                    aria-label="Download"
                    class="ma-2"
                    :color="color"
                    icon
                    variant="outlined"
                    @click="download"
                >
                    <v-icon>{{ downloadIcon }}</v-icon>
                </v-btn>
            </div>

            <v-slider
                v-if="showVolumeControl"
                v-model="playerVolume"
                aria-label="Volume"
                hide-details
                :max="1"
                :min="0"
                :prepend-icon="isMuted || playerVolume === 0 ? volumeMuteIcon : volumeHighIcon"
                :step="0.01"
            />
            <div
                v-if="waveform && file"
                v-show="!waveformFailed"
                ref="waveformContainer"
                aria-label="Playback position"
                :aria-valuemax="totalDuration"
                aria-valuemin="0"
                :aria-valuenow="currentTimeSeconds"
                :aria-valuetext="`${currentTime} of ${duration}`"
                class="vuetify-audio__waveform mt-3"
                role="slider"
                style="min-height: 64px; width: 100%;"
                :tabindex="loaded ? 0 : -1"
                @keydown.end.prevent="seek(totalDuration)"
                @keydown.home.prevent="seek(0)"
                @keydown.down.prevent="seekBy(-5)"
                @keydown.left.prevent="seekBy(-5)"
                @keydown.right.prevent="seekBy(5)"
                @keydown.up.prevent="seekBy(5)"
            />
            <v-slider
                v-if="!waveform || !file || waveformFailed"
                aria-label="Playback position"
                class="mt-3"
                :disabled="!loaded || totalDuration <= 0"
                hide-details
                :max="100"
                :min="0"
                :model-value="percentage"
                :step="0.1"
                :thumb-size="12"
                :track-size="5"
                @update:model-value="seekPercentage"
            />
            <p class="mb-0 mt-2">{{ currentTime }} / {{ duration }}</p>
        </v-card-text>

        <audio
            ref="player"
            :controls="nativeControls"
            :id="audioId || undefined"
            :loop="loop"
            :src="file || undefined"
            preload="metadata"
            @canplay="handleCanPlay"
            @durationchange="syncDuration"
            @ended="handleEnded"
            @error="handleError"
            @loadedmetadata="syncDuration"
            @pause="handlePause"
            @play="handlePlay"
            @timeupdate="handleTimeUpdate"
        />
    </v-card>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { VBtn } from 'vuetify/components/VBtn'
import { VCard, VCardText, VCardTitle } from 'vuetify/components/VCard'
import { VIcon } from 'vuetify/components/VIcon'
import { VImg } from 'vuetify/components/VImg'
import { VSlider } from 'vuetify/components/VSlider'

defineOptions({ name: 'VuetifyAudio' })

const props = defineProps({
    flat: {
        type: Boolean,
        default: false
    },
    file: {
        type: String,
        default: null
    },
    autoPlay: {
        type: Boolean,
        default: false
    },
    audioId: {
        type: String,
        default: null
    },
    ended: {
        type: Function,
        default: () => {}
    },
    canPlay: {
        type: Function,
        default: () => {}
    },
    color: {
        type: String,
        default: null
    },
    downloadable: {
        type: Boolean,
        default: false
    },
    extractMetadata: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: null
    },
    loop: {
        type: Boolean,
        default: false
    },
    nativeControls: {
        type: Boolean,
        default: false
    },
    showVolumeControl: {
        type: Boolean,
        default: true
    },
    title: {
        type: String,
        default: null
    },
    playIcon: {
        type: String,
        default: 'mdi-play'
    },
    pauseIcon: {
        type: String,
        default: 'mdi-pause'
    },
    stopIcon: {
        type: String,
        default: 'mdi-stop'
    },
    refreshIcon: {
        type: String,
        default: 'mdi-refresh'
    },
    downloadIcon: {
        type: String,
        default: 'mdi-download'
    },
    volumeHighIcon: {
        type: String,
        default: 'mdi-volume-high'
    },
    volumeMuteIcon: {
        type: String,
        default: 'mdi-volume-mute'
    },
    waveform: {
        type: Boolean,
        default: false
    },
    waveformOptions: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits([
    'can-play',
    'ended',
    'error',
    'metadata',
    'metadata-error',
    'waveform-error',
    'waveform-ready'
])

const player = ref(null)
const waveformContainer = ref(null)
const loaded = ref(false)
const playing = ref(false)
const isMuted = ref(false)
const currentTimeSeconds = ref(0)
const totalDuration = ref(0)
const playerVolume = ref(0.5)
const autoPlayAttempted = ref(false)
const extractedTitle = ref(null)
const extractedImage = ref(null)
const waveformFailed = ref(false)
let durationProbe = null
let segmentEndTime = null
let metadataController = null
let metadataImageUrl = null
let metadataRequestId = 0
let waveformInstance = null
let waveformRequestId = 0

const currentTime = computed(() => formatTime(currentTimeSeconds.value))
const duration = computed(() => formatTime(totalDuration.value))
const displayTitle = computed(() => props.title ?? extractedTitle.value)
const displayImage = computed(() => props.image ?? extractedImage.value)
const percentage = computed(() => {
    if (totalDuration.value <= 0) return 0

    return Math.min(100, currentTimeSeconds.value / totalDuration.value * 100)
})

function formatTime (seconds) {
    const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
    const hours = Math.floor(value / 3600).toString().padStart(2, '0')
    const minutes = Math.floor(value % 3600 / 60).toString().padStart(2, '0')
    const remainingSeconds = (value % 60).toString().padStart(2, '0')

    return `${hours}:${minutes}:${remainingSeconds}`
}

function resetPlaybackState () {
    cancelDurationProbe()
    segmentEndTime = null
    loaded.value = false
    playing.value = false
    currentTimeSeconds.value = 0
    totalDuration.value = 0
    autoPlayAttempted.value = false
}

function cancelDurationProbe () {
    if (!durationProbe) return

    durationProbe.audio.removeEventListener('timeupdate', durationProbe.handler)
    durationProbe = null
}

function probeInfiniteDuration (audio) {
    if (durationProbe) return

    const previousTime = audio.currentTime
    const handler = () => {
        durationProbe = null
        syncDuration()
        const restoredTime = Number.isFinite(audio.duration)
            ? Math.min(previousTime, audio.duration)
            : 0
        audio.currentTime = restoredTime
        currentTimeSeconds.value = restoredTime
    }

    durationProbe = { audio, handler }
    audio.addEventListener('timeupdate', handler, { once: true })

    try {
        audio.currentTime = Number.MAX_SAFE_INTEGER
    } catch {
        cancelDurationProbe()
    }
}

function syncDuration () {
    const audio = player.value
    const value = audio?.duration

    if (Number.isFinite(value) && value >= 0) {
        totalDuration.value = value
    } else if (value === Infinity) {
        probeInfiniteDuration(audio)
    }
}

function handleTimeUpdate () {
    const value = player.value?.currentTime

    if (Number.isFinite(value)) {
        currentTimeSeconds.value = value

        if (segmentEndTime !== null && value >= segmentEndTime) {
            player.value.pause()
            player.value.currentTime = segmentEndTime
            currentTimeSeconds.value = segmentEndTime
            segmentEndTime = null
        }
    }

    if (totalDuration.value === 0) syncDuration()
}

function handleCanPlay (event) {
    loaded.value = true
    syncDuration()
    props.canPlay(event)
    emit('can-play', event)

    if (props.autoPlay && !autoPlayAttempted.value) {
        autoPlayAttempted.value = true
        void play().catch(() => {})
    }
}

function handlePlay () {
    playing.value = true
}

function handlePause () {
    playing.value = false
}

function handleEnded (event) {
    segmentEndTime = null
    playing.value = false
    currentTimeSeconds.value = totalDuration.value
    props.ended(event)
    emit('ended', event)
}

function handleError (event) {
    loaded.value = false
    playing.value = false
    emit('error', player.value?.error || event)
}

function clearExtractedMetadata () {
    metadataRequestId += 1
    metadataController?.abort()
    metadataController = null
    extractedTitle.value = null
    extractedImage.value = null

    if (metadataImageUrl) {
        URL.revokeObjectURL(metadataImageUrl)
        metadataImageUrl = null
    }
}

async function loadMetadata () {
    clearExtractedMetadata()
    if (!props.extractMetadata || !props.file) return

    const requestId = metadataRequestId
    const controller = new AbortController()
    metadataController = controller

    try {
        const [{ parseWebStream, selectCover }, response] = await Promise.all([
            import('music-metadata'),
            fetch(props.file, { signal: controller.signal })
        ])

        if (!response.ok || !response.body) {
            throw new Error(`Unable to load audio metadata (${response.status})`)
        }

        const fileInfo = { path: props.file }
        const mimeType = response.headers.get('content-type')
        const size = Number(response.headers.get('content-length'))

        if (mimeType) fileInfo.mimeType = mimeType
        if (Number.isFinite(size) && size > 0) fileInfo.size = size

        const metadata = await parseWebStream(response.body, fileInfo)

        if (controller.signal.aborted || requestId !== metadataRequestId) return

        extractedTitle.value = metadata.common.title || null
        const cover = selectCover(metadata.common.picture)

        if (cover) {
            metadataImageUrl = URL.createObjectURL(new Blob([cover.data], { type: cover.format }))
            extractedImage.value = metadataImageUrl
        }

        emit('metadata', metadata)
    } catch (error) {
        if (error.name !== 'AbortError' && requestId === metadataRequestId) {
            emit('metadata-error', error)
        }
    } finally {
        if (requestId === metadataRequestId) metadataController = null
    }
}

function destroyWaveform () {
    waveformRequestId += 1
    waveformInstance?.destroy()
    waveformInstance = null
}

async function initializeWaveform () {
    destroyWaveform()
    const requestId = waveformRequestId
    waveformFailed.value = false
    await nextTick()

    if (requestId !== waveformRequestId) return
    if (!props.waveform || !props.file || !player.value || !waveformContainer.value) return

    try {
        const { default: WaveSurfer } = await import('wavesurfer.js')

        if (requestId !== waveformRequestId) return

        const instance = WaveSurfer.create({
            height: 64,
            normalize: true,
            progressColor: '#424242',
            waveColor: '#9e9e9e',
            ...props.waveformOptions,
            container: waveformContainer.value,
            media: player.value,
            url: props.file
        })

        waveformInstance = instance
        instance.on('ready', value => {
            if (waveformInstance === instance) emit('waveform-ready', value)
        })
        instance.on('error', error => {
            if (waveformInstance !== instance) return

            waveformFailed.value = true
            emit('waveform-error', error)
        })
    } catch (error) {
        if (requestId !== waveformRequestId) return

        waveformFailed.value = true
        emit('waveform-error', error)
    }
}

function seekPercentage (value) {
    const audio = player.value

    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return

    const nextPercentage = Math.min(100, Math.max(0, Number(value)))
    seek(audio.duration * nextPercentage / 100)
}

function seek (seconds) {
    const audio = player.value
    const value = Number(seconds)

    if (!audio || !Number.isFinite(value)) return false

    const maximum = Number.isFinite(audio.duration) ? audio.duration : Number.POSITIVE_INFINITY
    const nextTime = Math.min(maximum, Math.max(0, value))
    audio.currentTime = nextTime
    currentTimeSeconds.value = nextTime
    return true
}

function seekBy (seconds) {
    seek(currentTimeSeconds.value + seconds)
}

async function play () {
    await startPlayback()
}

async function startPlayback () {
    const audio = player.value

    if (!audio || playing.value) return
    if (audio.ended) audio.currentTime = 0

    try {
        await audio.play()
    } catch (error) {
        emit('error', error)
        throw error
    }
}

async function playSegment (startTime, duration) {
    const segmentDuration = Number(duration)

    if (!Number.isFinite(segmentDuration) || segmentDuration <= 0) {
        throw new TypeError('duration must be a positive number')
    }

    if (!seek(startTime)) {
        throw new TypeError('startTime must be a finite number')
    }

    const audio = player.value
    const requestedEndTime = audio.currentTime + segmentDuration
    segmentEndTime = Number.isFinite(audio.duration)
        ? Math.min(requestedEndTime, audio.duration)
        : requestedEndTime

    try {
        await startPlayback()
    } catch (error) {
        segmentEndTime = null
        throw error
    }
}

function pause () {
    player.value?.pause()
}

function togglePlayback () {
    if (playing.value) {
        pause()
    } else {
        void play().catch(() => {})
    }
}

function stop () {
    const audio = player.value

    if (!audio) return
    segmentEndTime = null
    audio.pause()
    audio.currentTime = 0
    currentTimeSeconds.value = 0
    playing.value = false
}

function mute () {
    const audio = player.value

    if (!audio) return
    isMuted.value = !isMuted.value
    audio.muted = isMuted.value
}

function reload () {
    const audio = player.value

    if (!audio) return
    resetPlaybackState()
    audio.load()
    void loadMetadata()
    void initializeWaveform()
}

function download () {
    if (!props.file) return

    pause()
    const link = document.createElement('a')
    link.href = props.file
    link.download = ''
    link.rel = 'noopener'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    link.remove()
}

watch(playerVolume, value => {
    if (player.value) player.value.volume = value
})

watch(() => props.file, async () => {
    resetPlaybackState()
    void loadMetadata()
    await nextTick()
    player.value?.load()
    void initializeWaveform()
})

watch(() => props.extractMetadata, () => {
    void loadMetadata()
})

watch(() => props.waveform, () => {
    void initializeWaveform()
})

watch(() => props.waveformOptions, () => {
    void initializeWaveform()
}, { deep: true })

watch(() => props.autoPlay, value => {
    if (value && loaded.value && !autoPlayAttempted.value) {
        autoPlayAttempted.value = true
        void play().catch(() => {})
    }
})

onMounted(() => {
    if (!player.value) return

    player.value.volume = playerVolume.value
    if (player.value.readyState >= 2) {
        loaded.value = true
        syncDuration()
    }

    void loadMetadata()
    void initializeWaveform()
})

onBeforeUnmount(() => {
    cancelDurationProbe()
    clearExtractedMetadata()
    destroyWaveform()
})

defineExpose({ download, mute, pause, play, playSegment, reload, seek, stop })
</script>
