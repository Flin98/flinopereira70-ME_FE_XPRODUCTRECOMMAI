import React, { useState } from "react";

const ChatMessage = ({ msg, onThumbsUp, onThumbsDown, onRateStar }) => {
  const isAI = msg.sender === "ai";
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`chat-message-row ${isAI ? "ai-row" : "user-row"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`message-bubble ${isAI ? "ai-bubble" : "user-bubble"}`}>
        <p className="message-text">{msg.text}</p>

        {isAI && (
          <div className={`feedback-controls ${hovered || msg.feedbackRating || msg.feedbackText ? "show" : ""}`}>
            <button
              type="button"
              className={`icon-btn ${msg.feedbackType === "up" ? "active" : ""}`}
              onClick={() => onThumbsUp(msg.id)}
              title="Thumbs Up"
            >
              👍
            </button>
            <button
              type="button"
              className={`icon-btn ${msg.feedbackType === "down" ? "active" : ""}`}
              onClick={() => onThumbsDown(msg.id)}
              title="Thumbs Down"
            >
              👎
            </button>

            {/* If thumbs up clicked, show 5-star rating */}
            {msg.feedbackType === "up" && (
              <div className="star-rating-mini">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${msg.feedbackRating >= star ? "filled" : ""}`}
                    onClick={() => onRateStar(msg.id, star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}

            {/* Display recorded subjective feedback if given */}
            {msg.feedbackText && (
              <div className="msg-recorded-feedback">
                <small>Feedback: {msg.feedbackText}</small>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;