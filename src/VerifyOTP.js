import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./LoginPage.css";

const VerifyOTP = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setnewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleOtpVerification = async (e) => {
    e.preventDefault();

    const otpDTO = { email, newPassword, otp };

    try {
      const response = await fetch(
        "http://localhost:8080/lmsa/user/verify-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(otpDTO),
        }
      );

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        setMessage("OTP verified successfully. Redirecting...");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError(data || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div
        className="text-center border p-5 rounded shadow bg-white"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className="page-logo mb-1 fw-bold">LO-GO</h2>
        <h4 className="mb-4">Verify OTP</h4>

        <form onSubmit={handleOtpVerification}>
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

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="🔒 Enter new password"
              value={newPassword}
              onChange={(e) => setnewPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="🔑 Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-dark w-100 mb-2">
            Verify OTP
          </button>

          {message && <div className="alert alert-success mt-3">{message}</div>}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
