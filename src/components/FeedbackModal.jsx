import React, { useState } from "react";

const FeedbackModal = ({ isOpen, onClose, onSubmitFeedback, messageId }) => {
  const [feedbackText, setFeedbackText] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    onSubmitFeedback(messageId, feedbackText);
    setFeedbackText("");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Provide Additional Feedback</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            rows="5"
            placeholder="Please write your feedback here..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            required
          />
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;