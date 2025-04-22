import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";
import ForgotPassword from "./ForgotPassword";
import VerifyOTP from "./VerifyOTP";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-password" element={<VerifyOTP />} />
      </Routes>
    </Router>
  );
}

export default App;
