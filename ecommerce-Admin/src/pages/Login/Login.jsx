import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'
import { showToast } from '../../utils/Toast'
import { useAuth } from '../../hooks/useAuth'
import email from '../../assets/Login-icons/email.svg'
import eye from '../../assets/Login-icons/eye.png'
import footer from '../../assets/Login-icons/footer.svg'
import login_top_img from '../../assets/Login-icons/login-top-img.svg'
import topLogo from '../../assets/Login-icons/logos.svg'
import password from '../../assets/Login-icons/password.svg'
import logo from '../../assets/Navbar-icons/Logo.svg'
import axios from 'axios'
import { MAINURL } from '../../config/Api'

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${MAINURL}admin/login`, {
        email: loginData.email,
        password: loginData.password
      });

      console.log("LOGIN RESPONSE:", res);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));
      showToast.success("Login successful!");

      // Use AuthContext to store authentication
      login(res.data.token, res.data.user);

      // Clear form
      setLoginData({ email: "", password: "" });

      // Navigate to dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error("Login Error:", error);
      const message = error.response?.data?.message || "Invalid email or password";
      showToast.error(message);
    }
  };
  return (
    <div style={{ minHeight: '100vh' }}>
      <img src={footer} alt="footer" className='footer-login-img' style={{ width: '100%' }} />

      <img src={topLogo} className="top-logo-img" alt='fff'/>
      <img src={login_top_img} alt="footer" className='nav-login-img' style={{ width: '100%' }} />
      <div>
        <img className="img-logo" src={logo} alt="logo" />
      </div>
      <div className="login-page-center">
        <div className='main-login-container'>
          <h1 className="main-gradient" style={{ fontSize: "32px", fontWeight: "600" }}>Login to your account</h1>
          <div className="main-gradient">
            <div className="tab-container">
              <div className='tab-item active'>Login</div>
            </div>
          </div>

          <form className="form-container" onSubmit={handleSubmit}>
            <label className="form-label">Email address</label>
            <div className="input-wrapper">
              <span className="input-icon"><img src={email} alt="email" /></span>
              <input
                type="email"
                placeholder="Enter email"
                className="form-input"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
              />
            </div>

            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon"><img src={password} alt="password" /></span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="form-input"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
              <span className="input-right-icon" onClick={togglePassword}>
                <img className="img-eye" src={eye} alt="toggle password visibility" />
              </span>
            </div>

            <div className="form-footer">
              <label className="remember-me">
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <div className="button-submit">
              <button type="submit" className="submit-button">
                Login
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}
