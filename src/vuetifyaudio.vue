<template>
    <v-card :variant="flat ? 'flat' : 'elevated'">
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
                v-model="playerVolume"
                aria-label="Volume"
                hide-details
                :max="1"
                :min="0"
                :prepend-icon="isMuted || playerVolume === 0 ? volumeMuteIcon : volumeHighIcon"
                :step="0.01"
            />
            <v-slider
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
                @update:model-value="setPosition"
            />
            <p class="mb-0 mt-2">{{ currentTime }} / {{ duration }}</p>
        </v-card-text>

        <audio
            ref="player"
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
import { VCard, VCardText } from 'vuetify/components/VCard'
import { VIcon } from 'vuetify/components/VIcon'
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
    }
})

const emit = defineEmits(['can-play', 'ended', 'error'])

const player = ref(null)
const loaded = ref(false)
const playing = ref(false)
const isMuted = ref(false)
const currentTimeSeconds = ref(0)
const totalDuration = ref(0)
const playerVolume = ref(0.5)
const autoPlayAttempted = ref(false)
let durationProbe = null

const currentTime = computed(() => formatTime(currentTimeSeconds.value))
const duration = computed(() => formatTime(totalDuration.value))
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

function setPosition (value) {
    const audio = player.value

    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return

    const nextPercentage = Math.min(100, Math.max(0, Number(value)))
    const nextTime = audio.duration * nextPercentage / 100
    audio.currentTime = nextTime
    currentTimeSeconds.value = nextTime
}

async function play () {
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
    await nextTick()
    player.value?.load()
})

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
})

onBeforeUnmount(cancelDurationProbe)

defineExpose({ download, mute, pause, play, reload, stop })
</script>
