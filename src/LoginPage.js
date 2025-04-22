import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  const [role, setRole] = useState("USER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (!token || !storedRole) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      return;
    }

    if (storedRole === "USER") {
      navigate("/user-dashboard");
    } else if (storedRole === "ADMIN") {
      navigate("/admin-dashboard");
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const loginDTO = {
      email: email,
      password: password,
      userType: role,
    };

    try {
      const response = await fetch("http://localhost:8080/lmsa/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginDTO),
      });

      let data;
      const text = await response.text(); // Always get text first
      try {
        data = JSON.parse(text); // Try to parse as JSON
      } catch {
        data = { message: text }; // Fallback to plain text
      }

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", role);
        navigate(role === "USER" ? "/user-dashboard" : "/admin-dashboard");
        setError("");
      } else if (response.status === 401) {
        setError(
          data.message || "Unauthorized. Please check your credentials."
        );
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Authorization failed. Please try again.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div
        className="text-center border p-5 rounded shadow bg-white"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className="mb-1 fw-bold">LO-GO</h2>
        <h4 className="mb-4">Login</h4>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="📧 Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="🔒 Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-dark w-100 mb-2"
            disabled={!email || !password}
          >
            Log in
          </button>

          <p className="mb-3">
            <Link to="/forgot-password" className="text-decoration-none">
              Forgot password?
            </Link>
          </p>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              type="button"
              style={{
                flex: 1,
                marginRight: "10px",
                padding: "10px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                backgroundColor: role === "ADMIN" ? "#000" : "#f8f9fa",
                color: role === "ADMIN" ? "#fff" : "#000",
                cursor: "pointer",
              }}
              onClick={() => setRole("ADMIN")}
            >
              Admin
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: "10px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                backgroundColor: role === "USER" ? "#000" : "#f8f9fa",
                color: role === "USER" ? "#fff" : "#000",
                cursor: "pointer",
              }}
              onClick={() => setRole("USER")}
            >
              User
            </button>
          </div>

          {/* {error && <div className="alert alert-danger mt-3">{error}</div>} */}
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

export default LoginPage;
