import React from "react";

const quickItems = ["Jeans", "Smartphone", "Laptop", "T-Shirt"];

const QuickSuggestions = ({ onSelect }) => {
  return (
    <div className="quick-suggestions-container">
      <p className="quick-title">Quick Suggestions:</p>
      <div className="quick-buttons">
        {quickItems.map((item) => (
          <button
            key={item}
            type="button"
            className="suggestion-chip"
            onClick={() => onSelect(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickSuggestions;