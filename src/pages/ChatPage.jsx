import React, { useState, useEffect, useRef } from "react";
import QuickSuggestions from "../components/QuickSuggestions";
import ChatMessage from "../components/ChatMessage";
import FeedbackModal from "../components/FeedbackModal";
import EndConversationFeedback from "../components/EndConversationFeedback";
import productData from "../data/products.json";

const FALLBACK_MSG = "Sorry, I did not understand your query!";

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: "initial-ai",
      sender: "ai",
      text: "Hello! I am your Product Recommendation Assistant.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stage, setStage] = useState("SELECT_PRODUCT");

  const [overallRating, setOverallRating] = useState(0);
  const [overallFeedback, setOverallFeedback] = useState("");
  const [activeModalMessageId, setActiveModalMessageId] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Match product by query
  const matchProduct = (query) => {
    const clean = query.trim().toLowerCase();
    return productData.products.find(
      (p) =>
        p.name.toLowerCase() === clean ||
        p.aliases.some((alias) => clean.includes(alias))
    );
  };

  const parseBudgetRange = (text) => {
    const nums = text.match(/\d+/g);
    if (!nums || nums.length === 0) return null;
    if (nums.length === 1) return { min: 0, max: parseInt(nums[0], 10) };
    const val1 = parseInt(nums[0], 10);
    const val2 = parseInt(nums[1], 10);
    return { min: Math.min(val1, val2), max: Math.max(val1, val2) };
  };

  const persistMessages = (msgs) => {
    const saved = JSON.parse(localStorage.getItem("conversations_history") || "[]");
    const record = {
      id: `conv-${Date.now()}`,
      timestamp: new Date().toISOString(),
      messages: msgs,
      rating: overallRating || 0,
      feedback: overallFeedback || "",
    };
    saved.push(record);
    localStorage.setItem("conversations_history", JSON.stringify(saved));
  };

  const handleSend = (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text,
    };

    const newMessages = [...messages, userMsg];

    if (stage === "SELECT_PRODUCT" || stage === "COMPLETED") {
      const foundProduct = matchProduct(text);
      if (foundProduct) {
        setSelectedProduct(foundProduct);
        setStage("AWAITING_BUDGET");
        newMessages.push({
          id: `ai-${Date.now() + 1}`,
          sender: "ai",
          text: foundProduct.askBudgetMsg,
        });
      } else {
        newMessages.push({
          id: `ai-${Date.now() + 1}`,
          sender: "ai",
          text: FALLBACK_MSG,
        });
      }
    } else if (stage === "AWAITING_BUDGET") {
      const range = parseBudgetRange(text);
      if (!range) {
        newMessages.push({
          id: `ai-${Date.now() + 1}`,
          sender: "ai",
          text: FALLBACK_MSG,
        });
      } else {
        const matched = selectedProduct.ranges.find(
          (r) =>
            (range.min >= r.min && range.min <= r.max) ||
            (range.max >= r.min && range.max <= r.max) ||
            (range.min <= r.min && range.max >= r.max)
        );

        if (matched) {
          newMessages.push({
            id: `ai-${Date.now() + 1}`,
            sender: "ai",
            text: matched.recommendation,
          });
          setStage("COMPLETED");
        } else {
          newMessages.push({
            id: `ai-${Date.now() + 1}`,
            sender: "ai",
            text: `No products found in that specific range for ${selectedProduct.name}.`,
          });
        }
      }
    }

    setMessages(newMessages);
    setInputValue("");
    persistMessages(newMessages);
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const handleThumbsUp = (msgId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, feedbackType: "up", feedbackRating: m.feedbackRating || 5 } : m
      )
    );
  };

  const handleRateStar = (msgId, star) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedbackRating: star } : m))
    );
  };

  const handleThumbsDown = (msgId) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedbackType: "down" } : m))
    );
    setActiveModalMessageId(msgId);
  };

  const handleSaveModalFeedback = (msgId, text) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedbackText: text } : m))
    );
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    persistMessages(messages);
  };

  return (
    <div className="chat-page-container">
      <QuickSuggestions onSelect={(item) => handleSend(item)} />

      <div className="chat-box">
        <div className="messages-list">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              msg={msg}
              onThumbsUp={handleThumbsUp}
              onThumbsDown={handleThumbsDown}
              onRateStar={handleRateStar}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {stage === "COMPLETED" && (
          <EndConversationFeedback
            rating={overallRating}
            feedback={overallFeedback}
            onRatingChange={setOverallRating}
            onFeedbackChange={setOverallFeedback}
          />
        )}

        <form onSubmit={onFormSubmit} className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="Please tell me about your query!"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          {/* ONLY ONE button with type="submit" in the form */}
          <button type="submit" className="btn btn-primary">
            Ask
          </button>
          {/* Save button MUST be type="button" */}
          <button
            type="button"
            onClick={handleSaveClick}
            className="btn btn-secondary"
          >
            Save
          </button>
        </form>
      </div>

      <FeedbackModal
        isOpen={Boolean(activeModalMessageId)}
        onClose={() => setActiveModalMessageId(null)}
        onSubmitFeedback={handleSaveModalFeedback}
        messageId={activeModalMessageId}
      />
    </div>
  );
};

export default ChatPage;