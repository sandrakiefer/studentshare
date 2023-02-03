<template>
  <div>
    <div
      class="container fixed-bottom text-end me-3 mb-3"
      :class="{ hide: !hide }"
    >
      <button
        type="button"
        class="btn btn-success"
        @click="
          hide = false;
          scrollDown();
        "
      >
        <i class="bi bi-chat-dots text-white" style="font-size: 1.5rem"></i>
      </button>
    </div>
    <div
      class="container me-3 mb-3 fixed-bottom"
      :class="{ hide: hide }"
      style="max-height: 70vh"
    >
      <div class="row justify-content-end">
        <div class="col-10 col-md-6 chatbox">
          <div class="p-2 me-2" style="right: 0; position: absolute">
            <i
              class="bi bi-x-circle"
              style="font-size: 1.5rem"
              @click="hide = true"
            ></i>
          </div>
          <ul id="chat">
            <li
              v-for="message in sortedMessages"
              :key="message.date"
              :class="message.email === testUsername ? 'intern' : 'extern'"
            >
              <div class="entete">
                <h2>{{ message.name }}</h2>
                <h3>{{ new Date(message.date).toLocaleString("en-US") }}</h3>
              </div>
              <div class="message">
                {{ message.message }}
              </div>
            </li>
          </ul>
          <footer class="container">
            <div class="row justify-content-center m-2">
              <div class="col-10" @keyup.enter="keySend()">
                <input
                  v-model="chatMessage"
                  type="text"
                  class="form-control"
                  id="chatMessage"
                  placeholder="Write a message ..."
                  ref="input"
                />
              </div>
              <div class="col-2">
                <i
                  class="bi bi-send"
                  style="font-size: 1.5rem"
                  @click="sendMessage(), scrollToBottom"
                ></i>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed } from "@vue/runtime-core";
import { ref } from "vue";
import type { Chat } from "./../service/chat/Chat";
import { useToken } from "./../service/principal/PrincipalService";
import SocketioService from "./../service/chat/socketio.service";

export default defineComponent({
  name: "PopUpChat",
  setup() {
    const { principal } = useToken();
    const chatMessage = ref("");
    const testMessages = ref<Chat[]>();
    const testUsername = principal.value.email;
    const hide = ref(true);
    onMounted(async () => {
      scrollDown();
      SocketioService.socket.on("login", (data: Chat[]) => {
        //showMessages(data);
        testMessages.value = data;
        setTimeout(scrollDown, 100);
      });
      SocketioService.socket.on("new message", (data: Chat) => {
        showMessages(data);
      });
    });
    function showMessages(data) {
      if (testMessages.value) {
        testMessages.value.push(data);
      } else {
        testMessages.value = [data];
      }
      setTimeout(scrollDown, 100);
    }
    function scrollDown() {
      const scroll = document.querySelector("#chat");
      if (scroll != null) {
        scroll.scrollTop = scroll.scrollHeight;
      }
    }
    const sortedMessages = computed(() => {
      if (testMessages.value) {
        return testMessages.value.sort((a, b) => {
          return Date.parse(a.date) - Date.parse(b.date);
        });
      }
    });
    async function sendMessage() {
      var message = chatMessage.value;

      const chat = {
        name: principal.value.name,
        message: message,
        email: principal.value.email,
        date: new Date().toLocaleString("en-US"),
      };

      if (message != "") {
        SocketioService.sendMessage(chat);
      }
      setTimeout(scrollDown, 100);
      chatMessage.value = "";
    }
    function keySend() {
      if (chatMessage.value != "") {
        sendMessage();
      }
    }
    return {
      testUsername,
      hide,
      chatMessage,
      sendMessage,
      scrollDown,
      sortedMessages,
      keySend,
    };
  },
  created() {
    SocketioService.setupSocketConnection();
  },
  beforeUnmount() {
    SocketioService.disconnect();
  },
  //Funktioniert nicht
  methods: {
    scrollToBottom() {
      const container = this.$el.querySelector("#chat");
      container.scrollTop = container.scrollHeight - container.clientHeight;
    },
  },
});
</script>

<style lang="css">
.chatbox {
  background-color: white;
  border-radius: 1rem;
}

.hide {
  visibility: hidden;
}

.col-2 {
  cursor: pointer;
}

#chat {
  padding-left: 0;
  margin: 0;
  list-style-type: none;
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
  height: 60vh;
}
#chat::-webkit-scrollbar {
  display: none;
}
#chat li {
  padding: 10px 30px;
}
#chat h2,
#chat h3 {
  display: inline-block;
  font-size: 13px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  font-weight: normal;
}
#chat h3 {
  color: #bbb;
}
#chat .message {
  padding: 20px;
  color: #fff;
  line-height: 25px;
  max-width: 90%;
  display: inline-block;
  text-align: left;
  border-radius: 5px;
}
#chat .intern {
  text-align: right;
}
#chat .extern .message {
  background-color: #6c757d;
}
#chat .intern .message {
  background-color: #198754;
}
</style>
