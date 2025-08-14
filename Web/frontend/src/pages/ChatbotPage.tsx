import React, { useState } from "react";
import { app } from "../services/auth/firebase";
import { getAuth } from "firebase/auth";

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export default function ChatBotPage() {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to use the chatbot.");
        setLoading(false);
        return;
      }

      // Lấy Firebase ID Token
      const idToken = await user.getIdToken();

      // Gọi API backend với token
      const res = await fetch("http://localhost:3000/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ message, history }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      setHistory(data.history);
      console.log(data.history);
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen p-4">
      {/* Khung hiển thị tin nhắn */}
      <div className="flex-1 overflow-y-auto border rounded p-3 space-y-2 bg-gray-50">
        {history.map((item, idx) => (
          <div
            key={idx}
            className={`p-2 rounded max-w-[75%] break-words ${
              item.role === "user"
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-gray-200 text-black self-start"
            }`}
          >
            {item.parts?.[0]?.text}
          </div>
        ))}
        {loading && (
          <div className="text-gray-400 italic">AI is typing...</div>
        )}
      </div>

      {/* Ô nhập liệu */}
      <div className="mt-3 flex">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2 mr-2"
          placeholder="Type your question..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
