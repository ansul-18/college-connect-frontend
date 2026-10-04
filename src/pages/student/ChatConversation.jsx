import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import {
   getConversation,
   getConversationMessages,
   markConversationAsRead
} from "../../api/chatApi";

import {
  connectChatSocket,
  disconnectChatSocket,
} from "../../utils/stompClient";

import { useAuth } from "../../hooks/useAuth";

const ChatConversation = () => {
  const { conversationId } = useParams();
  const { user, token } = useAuth();

  const [conversation, setConversation] =
    useState(null);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const subscriptionRef = useRef(null);
  const stompClientRef = useRef(null);

  useEffect(() => {
    const loadChat = async () => {
      try {
        const [
          conversationData,
          messageData,
        ] = await Promise.all([
          getConversation(conversationId),
          getConversationMessages(conversationId),
        ]);

        setConversation(conversationData);
        setMessages(messageData);
      } catch (error) {
        console.error(
          "Failed to load chat:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [conversationId]);

  useEffect(() => {
    if (!token || !conversationId) {
      return;
    }

    const client = connectChatSocket({
      token,

      onConnect: (connectedClient) => {
        stompClientRef.current =
          connectedClient;

        subscriptionRef.current =
          connectedClient.subscribe(
            `/topic/conversation/${conversationId}`,
            (frame) => {
              const incomingMessage =
                JSON.parse(frame.body);

              setMessages((prev) => [
                ...prev,
                incomingMessage,
              ]);
            }
          );
      },
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }

      disconnectChatSocket();
    };
  }, [token, conversationId]);

  const sendMessage = () => {
    if (
      !message.trim() ||
      !stompClientRef.current?.connected
    ) {
      return;
    }

    const payload = {
      conversationId: Number(
        conversationId
      ),
      senderId: user.userId,
      senderRole: user.role,
      content: message.trim(),
    };

    stompClientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(payload),
    });

    setMessage("");
  };

  if (loading) {
    return <div>Loading conversation...</div>;
  }

  return (
    <div className="chat-page">

      <header className="chat-header">
        <img
          src={
            conversation?.mentorProfileImage ||
            "/default-avatar.png"
          }
          alt={conversation?.mentorName}
        />

        <div>
          <h2>
            {conversation?.mentorName}
          </h2>

          <span>Mentor</span>
        </div>
      </header>

      <main className="messages-area">

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.senderId === user.userId
                ? "message own"
                : "message"
            }
          >
            <p>{msg.content}</p>
          </div>
        ))}

      </main>

      <footer className="chat-input">

        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        <button onClick={sendMessage}>
          Send
        </button>

      </footer>

    </div>
  );
};

export default ChatConversation;