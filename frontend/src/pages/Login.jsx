import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../api/auth";
import Spinner from "../components/ui/Spinner";

export default function Login() {
  const [userType, setUserType] = useState("customer");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Backend sets both httpOnly cookies in the response automatically.
      // We only need the user payload from the response body to update state.
      const data = await login({ user_type: userType, email, password });
      authLogin(data.user);
      navigate(data.user.user_type === "seller" ? "/seller/dashboard" : "/customer/dashboard");
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.detail || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="brand-logo">🏪</div>
            <h1>Welcome Back</h1>
            <p className="subtitle">Sign in to your account</p>
          </div>

          <div className="role-toggle">
            {["customer", "seller"].map((role) => (
              <label className="role-option" key={role}>
                <input
                  type="radio" name="user_type" value={role}
                  checked={userType === role}
                  onChange={() => setUserType(role)}
                />
                <span className="role-btn">
                  <span className="role-icon">{role === "customer" ? "🛒" : "🏪"}</span>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </span>
              </label>
            ))}
          </div>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field-group">
              <label>Password</label>
              <input type="password" placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Spinner /> : "Sign In"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}