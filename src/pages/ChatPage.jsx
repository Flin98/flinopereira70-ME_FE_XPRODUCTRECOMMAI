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
      text: "Hello! I am your Product Recommendation Assistant. Choose an item below or ask for Jeans, Smartphone, Laptop, or T-Shirt!",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stage, setStage] = useState("SELECT_PRODUCT"); // SELECT_PRODUCT | AWAITING_BUDGET | COMPLETED

  // End of conversation feedback
  const [overallRating, setOverallRating] = useState(0);
  const [overallFeedback, setOverallFeedback] = useState("");

  // Modal for thumbs down
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

  // Parse budget range from strings like "500 - 1000", "500 to 1000", "500 1000"
  const parseBudgetRange = (text) => {
    const nums = text.match(/\d+/g);
    if (!nums || nums.length === 0) return null;
    if (nums.length === 1) {
      return { min: 0, max: parseInt(nums[0], 10) };
    }
    const val1 = parseInt(nums[0], 10);
    const val2 = parseInt(nums[1], 10);
    return {
      min: Math.min(val1, val2),
      max: Math.max(val1, val2),
    };
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
            text: `We could not find products in that specific range for ${selectedProduct.name}. Try a different range!`,
          });
        }
      }
    }

    setMessages(newMessages);
    setInputValue("");
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  // Feedback Handlers
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

  // Persistence to localStorage
  const saveCurrentConversation = () => {
    if (messages.length <= 1) return; // Do not save blank introductory state
    const saved = JSON.parse(localStorage.getItem("conversations_history") || "[]");
    const conversationRecord = {
      id: `conv-${Date.now()}`,
      timestamp: new Date().toISOString(),
      messages,
      rating: overallRating || 0,
      feedback: overallFeedback || "",
    };
    saved.push(conversationRecord);
    localStorage.setItem("conversations_history", JSON.stringify(saved));
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    saveCurrentConversation();
    alert("Conversation saved successfully!");
  };

  const handleWantNewSuggestion = () => {
    saveCurrentConversation();
    // Reset state
    setMessages([
      {
        id: `initial-ai-${Date.now()}`,
        sender: "ai",
        text: "Hello! What new product would you like a recommendation for?",
      },
    ]);
    setSelectedProduct(null);
    setStage("SELECT_PRODUCT");
    setOverallRating(0);
    setOverallFeedback("");
    setInputValue("");
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
          <button type="submit" className="btn btn-primary">
            Ask
          </button>
          <button
            type="submit"
            onClick={handleSaveClick}
            className="btn btn-secondary"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleWantNewSuggestion}
            className="btn btn-action"
          >
            Want new suggestion?
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