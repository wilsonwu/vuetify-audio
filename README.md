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
| `downloadable` | `Boolean` | `false` | Shows the download button. |
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

Use kebab-case for multi-word props in templates, for example `auto-play`, `play-icon`, and `can-play`.

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `can-play` | Native `Event` | The audio source can start playing. |
| `ended` | Native `Event` | Playback finished. |
| `error` | `MediaError` or `Error` | Loading or playback failed, including blocked autoplay. |

## Component methods

A component template ref exposes `play()`, `pause()`, `stop()`, `mute()`, `reload()`, and `download()`.

## License

MIT
