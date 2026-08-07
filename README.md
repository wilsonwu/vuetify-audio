# vuetify-audio

[![Downloads](https://img.shields.io/npm/dt/vuetify-audio.svg)](https://www.npmjs.com/package/vuetify-audio)
[![Version](https://img.shields.io/npm/v/vuetify-audio.svg)](https://www.npmjs.com/package/vuetify-audio)
[![License](https://img.shields.io/npm/l/vuetify-audio.svg)](https://www.npmjs.com/package/vuetify-audio)

An audio player component for Vue 3 and Vuetify 4. It supports playback, time-based seeking, bounded segments, volume and mute controls, downloads, autoplay, looping, custom icons, native controls, cover art, metadata extraction, and interactive waveforms.

## Compatibility

| vuetify-audio | Vue | Vuetify |
| --- | --- | --- |
| 1.x | 3.5+ | 4.x |
| 0.x | 2.x | 2.x |

## Installation

```sh
npm install vuetify-audio vue@^3.5 vuetify@^4
```

The default control icons use MDI font icon names. Install `@mdi/font` when using those defaults, or provide custom icon props for another Vuetify icon set.

```sh
npm install @mdi/font
```

Configure Vuetify in your application entry point. Include the `@mdi/font` CSS import only when using that icon set:

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
| `downloadable` | `Boolean` | `false` | Shows Download after audio loads; Reload is shown before loading. |
| `extractMetadata` | `Boolean` | `false` | Automatically extracts embedded title and cover art on mount, source changes, and reload. |
| `image` | `String` | `null` | Cover image URL. Overrides extracted cover art. |
| `loop` | `Boolean` | `false` | Replays the audio automatically after it ends. |
| `nativeControls` | `Boolean` | `false` | Also shows native audio controls alongside the custom controls, useful for platforms such as iOS Safari. |
| `showVolumeControl` | `Boolean` | `true` | Controls only the volume slider; the mute/unmute button remains visible. |
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

Use kebab-case for multi-word props in templates, for example `audio-id`, `auto-play`, `play-icon`, and `show-volume-control`.

## Controls

Play/Pause, Stop, and Mute remain disabled until the audio can play. Reload is shown before loading and is disabled when no `file` is provided. After loading, Reload is replaced by Download when `downloadable` is enabled. Setting `native-controls` adds the browser controls without removing the custom controls.

Hide only the volume slider while keeping the mute/unmute button:

```vue
<VuetifyAudio
    :file="file"
    :show-volume-control="false"
/>
```

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `can-play` | Native `Event` | The audio source can start playing. |
| `ended` | Native `Event` | Playback finished. |
| `error` | `MediaError`, native `Event`, or `Error` | Loading or playback failed, including a `DOMException` from blocked playback. |
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

The waveform supports pointer seeking, `Home`/`End`, and all four arrow keys. Arrow keys seek by five seconds. Keyboard interaction is available after the audio loads and the waveform receives focus.

## Metadata

Metadata extraction is opt-in and lazy-loaded. When enabled, it runs on mount, source changes, and reload. Remote audio must allow cross-origin `fetch` requests. Explicit `title` and `image` props take precedence over extracted values. A metadata failure emits `metadata-error` without preventing normal audio playback.

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

| Method | Returns | Description |
| --- | --- | --- |
| `play()` | `Promise<void>` | Starts or resumes playback. Rejects when the browser refuses playback. |
| `pause()` | `void` | Pauses playback without changing the current position. |
| `stop()` | `void` | Pauses playback and returns to the beginning. |
| `mute()` | `void` | Toggles the native audio element's muted state. |
| `reload()` | `void` | Resets and reloads audio, metadata, and waveform state. |
| `download()` | `void` | Pauses playback and requests a browser download; does nothing without `file`. Cross-origin headers may cause the file to open in a new tab instead. |
| `seek(seconds)` | `Boolean` | Seeks by time and returns whether the player accepted the value. Clamps to zero and to the known duration. |
| `playSegment(startTime, duration)` | `Promise<void>` | Seeks and plays a bounded segment. Both arguments use seconds. Rejects for invalid arguments or playback failure. |

```js
player.value.seek(30)
await player.value.playSegment(30, 5)
```

`playSegment` throws a `TypeError` when `startTime` is not finite or when `duration` is not a positive finite number.

## License

MIT
