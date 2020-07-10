# vuetify-audio
<a href="https://www.npmjs.com/package/vuetify-audio"><img src="https://img.shields.io/npm/dt/vuetify-audio.svg" alt="Downloads"></a>
<a href="https://www.npmjs.com/package/vuetify-audio"><img src="https://img.shields.io/npm/v/vuetify-audio.svg" alt="Version"></a>
<a href="https://www.npmjs.com/package/vuetify-audio"><img src="https://img.shields.io/npm/l/vuetify-audio.svg" alt="License"></a>

Vue.js sound audio player base on Vuetify UI framework. Covers audio-tag API and adds more.

## Features
- Support most of audio play in this component.
- You can set the color you want for all component buttons.
- Support download the audio file.
- After audio playing finished or before start the playing, you can do something.
- Support Dark mode of Vuetify.
- Support auto play, but if user didn't interact with the document first, the audio can't be played.
- Support turn on and off audio download button.

### Demo

https://wilsonwu.github.io/dist/index.html#/vuetifyaudio

### Installation

Use npm: ```npm install vuetify-audio --save```

### Prepare
At first make sure your project is Vue project, and has ```Vuetify``` as UI framework:
1. Install Vuetify:
```
npm install vuetify --save-dev
```
2. Add Vuetify to ```app.js``` or ```main.js```:
```js
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);
```

You also can use Vue plugin to install ```Vuetify``` by only one line command:
```
vue add vuetify
```

Node: Make sure you are using the default Vuetify iconfont (mdi).

### Usage
Add below code into your ```<script>```:
```js
export default {
    components: {
        VuetifyAudio: () => import('vuetify-audio'),
    },
    data: () => ({
        file: 'http://www.hochmuth.com/mp3/Boccherini_Concerto_478-1.mp3',
    }),
}

```

And below code in the ```<template>```:
```html
<vuetify-audio :file="file" color="success" :ended="audioFinish" downloadable></vuetify-audio>
```


### Attributes

 - **file** (String) (Required): Set audio file for the audio player
 - **ended** (Function) (Optional): Set callback function name after audio finish
 - **canPlay** (Function) (Optional): Set callback function name when audio ready for playing
 - **color** (String) (Optional): Set all component buttons color
 - **autoPlay** (Boolean) (Optional, default is false): Add it to make the audio auto play, but in some web browsers maybe failed, because some browsers need user active in the page first then allow sound auto play.
 - **downloadable** (Boolean) (Optional, default is false): Add it to let the audio file can be downloaded.
 - **flat** (Boolean) (Optional, default is false): When set to true, make the Vuetify Card style to flat, that you can combine other information/image/data with this control in your page.

### Known Issues
1. Audio play pregress bar can't support drag, only support click.

### ToDo

 - ~~Create online demo~~
 - ~~Create npm install~~
 - ~~Add customize collor for component~~
 - ~~Add event for end audio~~
 - ~~Add auto play audio~~
 - ~~Add downloadable property for audio file~~
 - ~~Fully support dark mode~~
 - ~~Add prop for Card flat~~
 - Add increase or decrease volume of audio
 
### License

MIT
