<template>
  <div>
    <NavBar />
    <FileList />
    <PopUpChat />
  </div>
</template>

<script lang="ts">
import NavBar from "./../components/NavBar.vue";
import FileList from "./../components/FileList.vue";
import PopUpChat from "./../components/PopUpChat.vue";

export default {
  name: "FileShareView",
  components: {
    NavBar,
    FileList,
    PopUpChat,
  },
};
</script>
