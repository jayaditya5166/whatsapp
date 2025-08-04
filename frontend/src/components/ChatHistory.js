import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

const ChatHistory = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socket.on("incoming-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <h2>Chat History</h2>
      <div
        className="border rounded p-3 bg-light"
        style={{ height: "400px", overflowY: "auto" }}
      >
        {messages.length === 0 && <div>No messages yet.</div>}
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;
