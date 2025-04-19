import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginPage = () => {
  const [role, setRole] = useState('USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const loginDTO = {
      email: email,
      password: password,
      userType: role
    };

    try {
      const response = await fetch('http://localhost:8080/lmsa/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginDTO)
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', role);

        if (role === 'USER') {
          navigate('/userdashboard');
        } else {
          navigate('/admindashboard');
        }

        setError('');
      } else {
        setError(data.message || 'Login failed. Please check your credentials and try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="text-center border p-5 rounded shadow bg-white" style={{ maxWidth: '400px', width: '100%' }}>
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

          <button type="submit" className="btn btn-dark w-100 mb-2">
            Log in
          </button>

          <p className="mb-3"><a href="#" className="text-decoration-none">Forgot password?</a></p>

          <div className="d-flex justify-content-between">
            <button
              type="button"
              className={`btn w-50 me-2 ${role === 'ADMIN' ? 'btn-dark text-white' : 'btn-light border'}`}
              onClick={() => setRole('ADMIN')}
            >
              Admin
            </button>
            <button
              type="button"
              className={`btn w-50 ${role === 'USER' ? 'btn-dark text-white' : 'btn-light border'}`}
              onClick={() => setRole('USER')}
            >
              User
            </button>
          </div>

          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
