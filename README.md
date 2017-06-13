# vuetify-audio
## Vue.js + Vuetify audio player

Vue.js sound audio player base on Vuetify UI framework. Covers audio-tag API and adds more.

### Demo

Update soon

### Installation

Use npm: ```npm install vuetify-audio```

### Usage
At first make sure your project is Vue project, and has ```Vuetify``` as UI framework:
```
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);
```

Add below code into your ```<script>```:
```
    import VuetifyAudio from 'vuetify-audio';

    data() {
        return {
            file: 'http://www.noiseaddicts.com/samples_1w72b820/290.mp3',
        };
    },
    components: {
        'vuetify-audio': VuetifyAudio
    },
```

And below code in the ```<template>```:
```
    <vuetify-audio :file="file"></vuetify-audio>
```

### Attributes

 - **file** (String) is required; 
  
### ToDo

 - Create online demo
 - Create npm install
 - Add customize styles for component
 - Add event for start audio
 - Add event for end audio

### License

MIT
