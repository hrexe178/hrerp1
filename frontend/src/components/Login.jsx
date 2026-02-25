import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/login', formData);

      if (data?.success && data?.token) {
        login(data.token, data.user);
        const redirectTo = location.state?.from?.pathname || '/';
        navigate(redirectTo);
      } else {
        setError('Invalid login response from server.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Login failed. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-split-container">

        {/* Branding Panel */}
        <div className="login-branding-panel">
          <div className="branding-content">
            <img
              src="/katalyx-logo.png"
              alt="Katalyx Solution"
              style={{ maxWidth: '80%', maxHeight: '100px', marginBottom: '20px' }}
            />
            <p className="branding-subtitle">
              Enterprise Human Resource Management
            </p>
            <div className="branding-divider"></div>
            <p className="branding-quote">
              "Empowering our workforce through intelligent, data-driven HR solutions."
            </p>
          </div>
        </div>

        {/* Login Form Panel */}
        <div className="login-form-panel">
          <div className="login-header text-left">
            <h1>Welcome Back</h1>
            <p className="text-muted">
              Sign in to your corporate portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-alert login-error">
                {error}
              </div>
            )}

            <div className="form-group mb-4">
              <label htmlFor="email">Work Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="name@katalyxsolution.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="modern-input"
                autoComplete="email"
              />
            </div>

            <div className="form-group mb-4">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                className="modern-input"
                autoComplete="current-password"
              />
            </div>


            <button
              type="submit"
              disabled={loading}
              className="btn-primary full-width-btn login-submit-btn"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;