import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

const Header = ({ onNewSuggestion }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="header-left">
        <h1>Product Recommendation AI</h1>
      </div>
      <nav className="header-nav">
        <Link
          to="/"
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          onClick={onNewSuggestion}
        >
          Want new suggestion?
        </Link>
        <Link
          to="/history"
          className={`nav-link ${location.pathname === "/history" ? "active" : ""}`}
        >
          Previous Suggestions
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle-btn"
          aria-label="Toggle theme"
        >
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </nav>
    </header>
  );
};

export default Header;