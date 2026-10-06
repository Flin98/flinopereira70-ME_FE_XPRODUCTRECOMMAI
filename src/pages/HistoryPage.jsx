import React, { useState, useEffect } from "react";

const HistoryPage = () => {
  const [conversations, setConversations] = useState([]);
  const [filterRating, setFilterRating] = useState("All Ratings");

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("conversations_history") || "[]"
    );
    setConversations(saved);
  }, []);

  const filteredConversations = conversations.filter((conv) => {
    if (filterRating === "All Ratings") return true;
    return conv.rating === Number(filterRating);
  });

  return (
    <div className="history-page-container">
      <div className="history-header">
        <h2>Past Conversations</h2>
        <div className="filter-group">
          <label htmlFor="rating-filter">Filter by rating: </label>
          <select
            id="rating-filter"
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
          >
            <option value="All Ratings">All Ratings</option>
            <option value="1">1 Star</option>
            <option value="2">2 Stars</option>
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>
      </div>

      {filteredConversations.length === 0 ? (
        <p className="no-history-msg">No conversations found.</p>
      ) : (
        <div className="conversations-grid">
          {filteredConversations.map((item) => (
            <div key={item.id} className="conversation-card">
              <div className="card-top">
                <span className="timestamp">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
                <span className="card-rating">
                  Rating: {item.rating > 0 ? `${item.rating} ★` : "Not rated"}
                </span>
              </div>
              <div className="conversation-preview">
                {item.messages.map((m, idx) => (
                  <div key={idx} className={`history-bubble ${m.sender}`}>
                    <strong>{m.sender === "ai" ? "Bot: " : "You: "}</strong>
                    {m.text}
                  </div>
                ))}
              </div>
              {item.feedback && (
                <div className="card-feedback">
                  <strong>User Feedback:</strong> {item.feedback}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;