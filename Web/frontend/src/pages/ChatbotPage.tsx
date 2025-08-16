import React, { useState } from "react";
import { app } from "../services/auth/firebase";
import { getAuth } from "firebase/auth";
import Button from "../components/Button";

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
    <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '70%',
        margin: '10px 20px',
    }}>
        <div className="glassmorphism" style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            height: '100%',
            padding: '20px 20px',
            boxSizing: 'content-box',
            overflow: 'scroll',
            scrollBehavior: 'smooth'
        }}>
        {/* Khung hiển thị tin nhắn */}
            {history.map((item, idx) => {
                if (item.role === 'user') {
                    return (
                        <div
                        key={idx}
                        dangerouslySetInnerHTML={{ __html: item.parts?.[0]?.text}}
                        style={{
                            alignSelf: "flex-end",
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            padding: '5px 10px',
                            borderRadius: '20px',
                            maxWidth: '70%',
                        }}
                        />
                    );
                }
                
                return (
                    <div
                    key={idx}
                    dangerouslySetInnerHTML={{ __html: item.parts?.[0]?.text}}
                    style={{
                        alignSelf: "flex-start",
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        maxWidth: '70%',
                    }}
                    />
                );
            })}
            {loading && (
                <div className="text-gray-400 italic">AI is typing...</div>
            )}
        </div>

        {/* Ô nhập liệu */}
        <div style={{
            position: 'absolute',
            display: 'flex',
            bottom: '15px',
            left: 0,
            right: 0,
            width: '100%',
            gap: '5px',
            padding: '0px 15px',
            boxSizing: 'border-box',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <input
                type="text"
                className="glassmorphism"
                placeholder="Type your question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                style={{
                    width: '100%'
                }}
                />
            <Button
                onClick={sendMessage}
                disabled={loading}
                style={{
                    padding: '0px 20px',
                    lineHeight: 0,
                    height: '35px',
                    width: 'fit-content'
                }}
                >
                Send
            </Button>
        </div>
    </div>
);
}
