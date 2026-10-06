import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ChatPage from "./pages/ChatPage";
import HistoryPage from "./pages/HistoryPage";
import { ThemeProvider } from "./context/ThemeContext";
import "./styles/App.css";

function App() {
  const [chatKey, setChatKey] = useState(0);

  const handleNewSuggestion = () => {
    setChatKey((prev) => prev + 1);
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="app-wrapper">
          <Header onNewSuggestion={handleNewSuggestion} />
          <main>
            <Routes>
              <Route path="/" element={<ChatPage key={chatKey} />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;