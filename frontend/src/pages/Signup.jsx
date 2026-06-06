import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signup } from "../api/auth";
import Spinner from "../components/ui/Spinner";

export default function Signup() {
  const [userType, setUserType]   = useState("customer");
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [address, setAddress]     = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Backend sets both httpOnly cookies in the response automatically.
      // We only need the user payload from the response body to update state.
      const data = await signup({ user_type: userType, name, email, phone_number: phone, address, password });
      authLogin(data.user);
      navigate(data.user.user_type === "seller" ? "/seller/dashboard" : "/customer/dashboard");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="brand-logo">🛍</div>
            <h1>Join Us</h1>
            <p className="subtitle">Join our marketplace today</p>
          </div>

          <div className="role-toggle">
            {["customer", "seller"].map((role) => (
              <label className="role-option" key={role}>
                <input type="radio" name="user_type" value={role}
                  checked={userType === role} onChange={() => setUserType(role)} />
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
              <label>Full Name</label>
              <input type="text" placeholder="Enter your full name" value={name}
                onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field-group">
              <label>Phone Number</label>
              <input type="text" placeholder="01XXXXXXXXX" value={phone}
                onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="field-group">
              <label>{userType === "seller" ? "Business Address" : "Delivery Address"}</label>
              <input type="text" placeholder="Enter your address" value={address}
                onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="field-group">
              <label>Password</label>
              <input type="password" placeholder="Create a password" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Spinner /> : "Create Account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}