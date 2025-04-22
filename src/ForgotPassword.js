import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./LoginPage.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [isVerifyOTPEnabled, setVerifyOTPEnabled] = useState(false);
  const [isResetPasswordEnabled, setResetPasswordEnabled] = useState(true);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const resetDTO = { email };
    try {
      setResetPasswordEnabled(false);
      const response = await fetch(
        "http://localhost:8080/lmsa/user/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resetDTO),
        }
      );

      const data = await response.text();

      if (!response.ok) {
        setError(data || "Failed to send OTP");
        setVerifyOTPEnabled(false);
        setResetPasswordEnabled(true);
      } else {
        setMessage(data || "OTP sent to email.");
        setVerifyOTPEnabled(true);
        setResetPasswordEnabled(false);
      }

      setTimeout(() => {
        setMessage("");
        setError("");
      }, 5000);
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
      setVerifyOTPEnabled(false);
      setResetPasswordEnabled(true);

      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div
        className="text-center border p-5 rounded shadow bg-white"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className="page-logo mb-1 fw-bold">LO-GO</h2>
        <h4 className="mb-4">Forgot Password</h4>

        <form onSubmit={handlePasswordReset}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="📧 Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-dark w-100 mb-2"
            disabled={!isResetPasswordEnabled}
          >
            Send OTP
          </button>

          {isVerifyOTPEnabled && (
            <button
              type="button"
              className="btn btn-dark w-100 mb-2"
              onClick={() => navigate("/verify-password")}
            >
              Verify OTP
            </button>
          )}
          {message && (
            <div className="modern-alert success-alert mt-3">
              <span>✅</span> {message}
            </div>
          )}
          {error && (
            <div className="modern-alert error-alert mt-3">
              <span>⚠️</span> {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
