<template>
  <div id="app">
    <VueRemoteApp />
  </div>
</template>

<script>
import VueRemoteApp from './components/VueRemoteApp.vue';

export default {
  name: 'App',
  components: {
    VueRemoteApp
  }
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  min-height: 100vh;
}
</style>