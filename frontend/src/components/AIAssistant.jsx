import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AIAssistant() {
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatRef = useRef(null);

    // Fetch chat history on mount
    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await axios.get(`${API_URL}/api/ai/history`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessages(res.data.reverse()); // oldest first
            } catch (err) {
                console.error("Failed to fetch AI chat history:", err);
            }
        };
        fetchHistory();
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const handleAsk = async () => {
        if (!query.trim()) return;
        const newUserMsg = { query, reply: null };
        setMessages((prev) => [...prev, newUserMsg]);
        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            const res = await axios.post(
                `${API_URL}/api/ai/chat`,
                { query },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessages((prev) => [
                ...prev.slice(0, -1),
                { ...newUserMsg, reply: res.data.reply },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev.slice(0, -1),
                { ...newUserMsg, reply: "Sorry, I couldn’t process that right now." },
            ]);
        } finally {
            setQuery("");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-xl shadow border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">💬 AI Expense Assistant</h3>
            <p className="text-sm text-gray-500 mb-4">
                Ask things like: “How much did I spend on food last month?” or “What’s my top category this year?”
            </p>

            {/* Chat Box */}
            <div
                ref={chatRef}
                className="h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"
            >
                {messages.length === 0 && (
                    <p className="text-gray-400 text-sm text-center mt-20">
                        Start chatting with your AI assistant 👇
                    </p>
                )}

                {messages.map((msg, index) => (
                    <div key={index} className="mb-4">
                        <div className="text-sm text-gray-800 font-medium mb-1">You:</div>
                        <div className="bg-indigo-100 text-gray-800 p-3 rounded-lg w-fit max-w-[80%] mb-2">
                            {msg.query}
                        </div>
                        {msg.reply && (
                            <>
                                <div className="text-sm text-gray-600 font-medium mb-1">AI:</div>
                                <div className="bg-white border border-gray-200 p-3 rounded-lg w-fit max-w-[80%] shadow-sm">
                                    {msg.reply}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                    placeholder="Type your question..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button
                    onClick={handleAsk}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1 text-sm disabled:opacity-50"
                >
                    <Send size={16} />
                    {loading ? "Thinking..." : "Ask"}
                </button>
            </div>
        </div>
    );
}
