/* eslint-disable @typescript-eslint/no-empty-function */
import { io } from "socket.io-client";
import { Chat } from "./Chat";
import { useToken } from "../principal/PrincipalService";

const { principal } = useToken();

class SocketioService {
  socket;
  constructor() {}

  setupSocketConnection() {
    try {
      this.socket = io(
        "https://chat-websocket-dot-studentshare.ey.r.appspot.com",
        {
          auth: {
            token: principal.value.token.token,
          },
        }
      );
      console.log("Socket connected.");
    } catch (error) {
      console.log(error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  async sendMessage(chat) {
    this.socket.emit("new message", chat);
  }
}

export default new SocketioService();
