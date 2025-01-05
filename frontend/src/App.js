// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DocumentEditorPage from "./pages/DocumentEditorPage";
import CreateDocumentPage from "./pages/CreateDocumentPage"; // Import CreateDocumentPage
import RegisterPage from "./pages/RegisterPage"; // Import the RegisterPage

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/document/:id" element={<DocumentEditorPage />} />
        <Route path="/document/create" element={<CreateDocumentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
