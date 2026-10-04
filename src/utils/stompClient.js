import { Client } from "@stomp/stompjs";

const WS_URL = "ws://localhost:8080/ws";

let stompClient = null;

export const connectChatSocket = ({
  token,
  onConnect,
  onError,
}) => {
  stompClient = new Client({
    brokerURL: WS_URL,

    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    reconnectDelay: 5000,

    debug: (message) => {
      console.log("[STOMP]", message);
    },

    onConnect: () => {
      console.log("WebSocket connected");

      if (onConnect) {
        onConnect(stompClient);
      }
    },

    onStompError: (frame) => {
      console.error(
        "STOMP error:",
        frame.headers["message"]
      );

      if (onError) {
        onError(frame);
      }
    },

    onWebSocketError: (error) => {
      console.error(
        "WebSocket error:",
        error
      );

      if (onError) {
        onError(error);
      }
    },
  });

  stompClient.activate();

  return stompClient;
};

export const disconnectChatSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};

export const getStompClient = () => {
  return stompClient;
};