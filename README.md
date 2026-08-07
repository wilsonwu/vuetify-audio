# vuetify-audio

[![Downloads](https://img.shields.io/npm/dt/vuetify-audio.svg)](https://www.npmjs.com/package/vuetify-audio)
[![Version](https://img.shields.io/npm/v/vuetify-audio.svg)](https://www.npmjs.com/package/vuetify-audio)
[![License](https://img.shields.io/npm/l/vuetify-audio.svg)](https://www.npmjs.com/package/vuetify-audio)

An audio player component for Vue 3 and Vuetify 4. It supports playback, seeking, volume control, muting, downloads, autoplay, custom icons, and Vuetify themes.

## Compatibility

| vuetify-audio | Vue | Vuetify |
| --- | --- | --- |
| 1.x | 3.5+ | 4.x |
| 0.x | 2.x | 2.x |

## Installation

```sh
npm install vuetify-audio vue@^3.5 vuetify@^4 @mdi/font
```

Configure Vuetify in your application entry point:

```js
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import App from './App.vue'

const app = createApp(App)
const vuetify = createVuetify()

app.use(vuetify).mount('#app')
```

## Usage

```vue
<script setup>
import VuetifyAudio from 'vuetify-audio'

const file = 'https://example.com/audio.mp3'

function handleEnded () {
    console.log('Playback finished')
}
</script>

<template>
    <VuetifyAudio
        :file="file"
        color="success"
        downloadable
        @ended="handleEnded"
    />
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `file` | `String` | `null` | Audio source URL. |
| `autoPlay` | `Boolean` | `false` | Attempts playback when the source can play. Browser autoplay rules still apply. |
| `audioId` | `String` | `null` | ID applied to the native audio element, useful when rendering multiple players. |
| `downloadable` | `Boolean` | `false` | Shows the download button. |
| `extractMetadata` | `Boolean` | `false` | Extracts embedded title and cover art from `file` on demand. |
| `image` | `String` | `null` | Cover image URL. Overrides extracted cover art. |
| `loop` | `Boolean` | `false` | Replays the audio automatically after it ends. |
| `nativeControls` | `Boolean` | `false` | Shows native audio controls as a browser-specific fallback, including on iOS Safari. |
| `title` | `String` | `null` | Track title. Overrides an extracted title. |
| `flat` | `Boolean` | `false` | Uses the flat Vuetify card variant. |
| `color` | `String` | `null` | Vuetify color for control buttons. |
| `ended` | `Function` | no-op | Legacy callback invoked when playback ends. Prefer the `ended` event. |
| `canPlay` | `Function` | no-op | Legacy callback invoked when audio can play. Prefer the `can-play` event. |
| `playIcon` | `String` | `mdi-play` | Play icon. |
| `pauseIcon` | `String` | `mdi-pause` | Pause icon. |
| `stopIcon` | `String` | `mdi-stop` | Stop icon. |
| `refreshIcon` | `String` | `mdi-refresh` | Reload icon. |
| `downloadIcon` | `String` | `mdi-download` | Download icon. |
| `volumeHighIcon` | `String` | `mdi-volume-high` | Volume icon. |
| `volumeMuteIcon` | `String` | `mdi-volume-mute` | Muted icon. |
| `waveform` | `Boolean` | `false` | Replaces the position slider with an interactive waveform. |
| `waveformOptions` | `Object` | `{}` | Additional WaveSurfer options. The component owns `container`, `media`, and `url`. |

Use kebab-case for multi-word props in templates, for example `audio-id`, `auto-play`, `play-icon`, and `can-play`.

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `can-play` | Native `Event` | The audio source can start playing. |
| `ended` | Native `Event` | Playback finished. |
| `error` | `MediaError` or `Error` | Loading or playback failed, including blocked autoplay. |
| `metadata` | `IAudioMetadata` | Embedded metadata was extracted successfully. |
| `metadata-error` | `Error` | Metadata fetching or parsing failed. Audio playback may still work. |
| `waveform-ready` | `Number` | The waveform is decoded and ready; payload is duration in seconds. |
| `waveform-error` | `Error` | Waveform loading failed and the position slider was restored. |

## Waveform

WaveSurfer is lazy-loaded when `waveform` is enabled. The audio URL must allow cross-origin `fetch` requests unless pre-decoded `peaks` and `duration` are supplied through `waveformOptions`.

```vue
<VuetifyAudio
    :file="file"
    waveform
    :waveform-options="{
        barGap: 2,
        barWidth: 3,
        progressColor: '#00798c',
        waveColor: '#d1495b'
    }"
/>
```

The waveform supports pointer seeking plus `Home`, `End`, and left/right arrow keys. Arrow keys move by five seconds.

## Metadata

Metadata extraction is opt-in and lazy-loaded. Remote audio must allow cross-origin `fetch` requests. Explicit `title` and `image` props take precedence over extracted values.

```vue
<VuetifyAudio
    extract-metadata
    :file="file"
    @metadata="metadata => console.log(metadata.common)"
/>
```

The component can be composed inside Vuetify overlays when a floating player is needed:

```vue
<v-snackbar v-model="showPlayer" :timeout="-1">
    <VuetifyAudio :file="file" flat />
</v-snackbar>
```

## Component methods

A component template ref exposes `play()`, `pause()`, `stop()`, `mute()`, `reload()`, `download()`, `seek(seconds)`, and `playSegment(startTime, duration)`. Both `playSegment` arguments are measured in seconds.

```js
player.value.seek(30)
await player.value.playSegment(30, 5)
```

## License

MIT
