<template>
    <v-card style="text-align: center">
        <v-card-text>
            <v-btn outline icon class="teal--text" @click.native="playing ? pause() : play()" :disabled="loaded === false">
                <v-icon v-if="playing === false || paused === true">play_arrow</v-icon>
                <v-icon v-else>pause</v-icon>
            </v-btn>
            <v-btn outline icon class="teal--text" @click.native="stop()" :disabled="loaded === false">
                <v-icon>stop</v-icon>
            </v-btn>
            <v-btn outline icon class="teal--text" @click.native="mute()" :disabled="loaded === false">
                <v-icon v-if="isMuted === false">volume_up</v-icon>
                <v-icon v-else>volume_off</v-icon>
            </v-btn>
            <v-btn outline icon class="teal--text" @click.native="loaded ? download() : reload()">
                <v-icon v-if="loaded === false">refresh</v-icon>
                <v-icon v-else>get_app</v-icon>
            </v-btn>
            <v-slider @click.native="setPosition()" v-model="percentage" dark></v-slider>
            <p>{{ currentTime }} / {{ duration }}</p>
        </v-card-text>
        <audio id="player" ref="player" v-on:ended="ended" v-on:canplay="canPlay" :src="file"></audio>
    </v-card>
</template>
<script>
    const formatTime = (secend) => {
        let time = new Date(secend * 1000).toISOString().substr(11, 8)
        return time
    }
    export default {
        name: 'vuetify-audio',
        props: {
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
                default: () => {},
            },
            canPlay: {
                type: Function,
                default: () => {},
            },
        },
        computed: {
            duration: function () {
                return this.audio ? formatTime(this.totalDuration) : ''
            },
        },
        data () {
            return {
                isMuted: false,
                loaded: false,
                playing: false,
                paused: false,
                percentage: 0,
                currentTime: '00:00:00',
                audio: undefined,
                totalDuration: 0,
            }
        },

        methods: {
            setPosition () {
                this.audio.currentTime = parseInt(this.audio.duration / 100 * this.percentage);
            },
            stop () {
                this.paused = this.playing = false
                this.audio.pause()
                this.audio.currentTime = 0
            },
            play () {
                if (this.playing) return
                this.paused = false
                this.audio.play()
                this.playing = true
            },
            pause () {
                this.paused = !this.paused;
                (this.paused) ? this.audio.pause() : this.audio.play()
            },
            download () {
                this.audio.pause()
                window.open(this.file, 'download')
            },
            mute () {
                this.isMuted = !this.isMuted
                this.audio.muted = this.isMuted
                this.volumeValue = this.isMuted ? 0 : 75
            },
            reload () {
                this.audio.load();
            },
            _handleLoaded: function () {
                if (this.audio.readyState >= 2) {
                    if (this.autoPlay) this.audio.play()
                    this.loaded = true
                    this.totalDuration = parseInt(this.audio.duration)
                } else {
                    throw new Error('Failed to load sound file')
                }
            },
            _handlePlayingUI: function (e) {
                this.percentage = this.audio.currentTime / this.audio.duration * 100
                this.currentTime = formatTime(this.audio.currentTime)
            },
            _handlePlayPause: function (e) {
                if (e.type === 'pause' && this.paused === false && this.playing === false) {
                    this.currentTime = '00:00:00'
                }
            },
            _handleEnded () {
                this.paused = this.playing = false;
            },
            init: function () {
                this.audio.addEventListener('timeupdate', this._handlePlayingUI);
                this.audio.addEventListener('loadeddata', this._handleLoaded);
                this.audio.addEventListener('pause', this._handlePlayPause);
                this.audio.addEventListener('play', this._handlePlayPause);
                this.audio.addEventListener('ended', this._handleEnded);
            },
        },
        mounted () {
            this.audio = this.$refs.player;
            this.init();
        },
        beforeDestroy () {
            this.audio.removeEventListener('timeupdate', this._handlePlayingUI)
            this.audio.removeEventListener('loadeddata', this._handleLoaded)
            this.audio.removeEventListener('pause', this._handlePlayPause)
            this.audio.removeEventListener('play', this._handlePlayPause)
            this.audio.removeEventListener('ended', this._handleEnded);
        }

    }
</script>
