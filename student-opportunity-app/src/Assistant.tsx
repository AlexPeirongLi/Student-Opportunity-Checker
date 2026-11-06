import {useState} from "react";
import {SERVER_URL} from "./types";

type ChatMessage = {
  role: string;
  content: string;
};

const SUGGESTIONS = [
  "What's due this week?",
  "Which opportunities are still open?",
  "How many have I applied to?",
];

const Assistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const ask = async (text: string) => {
    if (text.trim() === "" || loading) {
      return;
    }
    const newMessages: ChatMessage[] = [...messages, {role: "user", content: text}];
    setMessages(newMessages);
    setQuestion("");
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${SERVER_URL}/assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({messages: newMessages}),
      });
      const result = await response.json();
      if (response.ok) {
        setMessages([...newMessages, {role: "assistant", content: result.answer}]);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Could not reach the server");
    }
    setLoading(false);
  };
  if (!open) {
    return (
      <button className="chat-bubble" onClick={() => setOpen(true)}>
        Ask AI
      </button>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <strong>Assistant</strong>
        <button className="close-button" onClick={() => setOpen(false)}>
          ×
        </button>
      </div>
      <div className="chat">
        {messages.length === 0 && (
          <div className="suggestions">
            <p className="small">Ask about your saved opportunities.</p>
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} onClick={() => ask(suggestion)} disabled={loading}>
                {suggestion}
              </button>
            ))}
          </div>
        )}
        {messages.map((message, index) => (
          <div key={index} className={`chat-message ${message.role}`}>
            {message.content}
          </div>
        ))}
        {loading && <div className="chat-message assistant">Thinking...</div>}
        {error !== "" && <p className="error small">{error}</p>}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask a question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              ask(question);
            }
          }}
        />
        <button onClick={() => ask(question)} disabled={question.trim() === "" || loading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Assistant;
