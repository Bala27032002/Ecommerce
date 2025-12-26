import React, { useState, useEffect } from "react";
import { showToast } from "../../utils/Toast";
import image from "../../assets/background-image.svg";
import phone from "../../assets/phone.svg";
import password from "../../assets/password.svg";
import "./login.css";
import eye from "../../assets/eye.png";
import email from "../../assets/email.svg";
import username from "../../assets/username.png";
import { MAINURL } from "../../../config/Api";
import axios from "axios";
import footer from "../../assets/footer.svg";
import login_top_img from "../../assets/Login-icons/login-top-img.svg";
import { useNavigate } from "react-router-dom";
import topLogo from "../../assets/logos.svg";
import logo from "../../assets/Home-icons/Logo.svg";
import loginwith from "../../assets/loginwith.svg";
import google from "../../assets/google.svg";
import apple from "../../assets/apple.svg";
import { useGoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const [active, setActive] = useState("login");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loginData, setLoginData] = useState({
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const naviagte = useNavigate();

  // Google Client ID - Replace with your actual Google Client ID
  const GOOGLE_CLIENT_ID = "163344043528-ltnh3cen4c6vt58jpotbupl5gdf30rk8.apps.googleusercontent.com";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const togglePassword = () => setShowPassword(!showPassword);
  const togglePasswords = () => setShowPasswords(!showPasswords);
  const toggleLoginPassword = () => setShowLoginPassword(!showLoginPassword);

  // Decode JWT without library
  const decodeJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return {};
    }
  };

  // Handle Google Sign-In Success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = decodeJwt(credentialResponse.credential);
      
      const res = await axios.post(`${MAINURL}auth/google`, {
        token: credentialResponse.credential,
        email: decoded.email,
        fullName: decoded.name,
        picture: decoded.picture,
      });

      console.log("GOOGLE LOGIN RESPONSE:", res.data);

      showToast.success("Google login successful!");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("authProvider", "google");
      dispatch(setUser({ 
        user: res.data.user, 
        token: res.data.token,
        provider: "google"
      }));
      naviagte("/home");
    } catch (error) {
      console.error("Google Login Error:", error);
      const message = error.response?.data?.message || "Google login failed";
      showToast.error(message);
    }
  };

  // Handle Google Sign-In Error
  const handleGoogleError = () => {
    showToast.error("Google login failed");
  };

  const handleGoogleAccessTokenSuccess = async (tokenResponse) => {
    try {
      const accessToken = tokenResponse?.access_token;
      if (!accessToken) {
        showToast.error("Google login failed");
        return;
      }

      const googleUserRes = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const googleUser = googleUserRes.data;
      const res = await axios.post(`${MAINURL}auth/google`, {
        token: accessToken,
        email: googleUser.email,
        fullName: googleUser.name,
        picture: googleUser.picture,
      });

      showToast.success("Google login successful!");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("authProvider", "google");
      dispatch(
        setUser({
          user: res.data.user,
          token: res.data.token,
          provider: "google",
        })
      );
      naviagte("/home");
    } catch (error) {
      console.error("Google Login Error:", error);
      const message = error.response?.data?.message || "Google login failed";
      showToast.error(message);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleAccessTokenSuccess,
    onError: handleGoogleError,
    scope: "openid email profile",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast.error("Passwords do not match!");
      return;
    }
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPasswordRegex.test(formData.password)) {
      showToast.error(
        "Password must be at least 8 characters and include uppercase, lowercase, and a number!"
      );
      return;
    }

    try {
      const res = await axios.post(`${MAINURL}auth/register`, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      console.log("REGISTER RESPONSE:", res.data);

      showToast.success("Registration successful! Please login.");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      setActive("login");
    } catch (error) {
      console.error("Registration Error:", error);
      const message = error.response?.data?.message || "Registration failed";
      showToast.error(message);
    }
  };
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${MAINURL}auth/login`, {
        phone: loginData.phone,
        password: loginData.password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      showToast.success("Login successful!");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      console.log("Stored User:", res.data.user);
      localStorage.setItem("phone", loginData.phone);
      localStorage.setItem("authProvider", "mobile");
      console.log("Stored Token:", res.data.token);
      dispatch(setUser({ 
        user: res.data.user, 
        token: res.data.token,
        provider: "mobile"
      }));
      naviagte("/home");

      setLoginData({ phone: "", password: "" });
    } catch (error) {
      console.error("Login Error:", error);
      const message =
        error.response?.data?.message || "Invalid phone or password";
      showToast.error(message);
    }
  };

  return (
    <div style={{minHeight:'100vh'}}>
      <img
        src={footer}
        alt="footer"
        className="footer-login-img"
        style={{ width: "100%" }}
      />

      <img src={topLogo} className="top-logo-img" alt='fff'/>
      <img
        src={login_top_img}
        alt="footer"
        className="nav-login-img"
        style={{ width: "100%" }}
      />
      <div>
        <img className="img-logo" src={logo}></img>
      </div>
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',marginTop:'5rem'}}>
      <div className="main-login-container">
        <h1
          className="main-gradient"
          style={{ fontSize: "32px", fontWeight: "600" }}
        >
          Login to your account
        </h1>
        <div className="main-gradient">
          <div className="tab-container">
            <div
              className={`tab-item ${active === "login" ? "active" : ""}`}
              onClick={() => setActive("login")}
            >
              Login
            </div>

            <div
              className={`tab-item ${active === "Register" ? "active" : ""}`}
              onClick={() => setActive("Register")}
            >
              Register
            </div>
          </div>
        </div>
        {active === "login" && (
          <form className="form-container" onSubmit={handleLoginSubmit}>
            <div className="form-container">
              <label className="form-label">Phone number</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <img src={phone} alt='fff'></img>
                </span>
                <input
                  value={loginData.phone}
                  type="text"
                  placeholder="Enter phone number"
                  className="form-input"
                  onChange={(e) =>
                    setLoginData({ ...loginData, phone: e.target.value })
                  }
                />
              </div>

              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <img src={password} alt="" />
                </span>
                <input
                  value={loginData.password}
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="form-input"
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                />
                <span className="input-right-icon">
                  <img
                    className="img-eye"
                    src={eye}
                    alt=""
                    onClick={toggleLoginPassword}
                  />
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
                <div className="login-with">
                  <img style={{ width: "100%" }} src={loginwith}></img>
                </div>
                <div className="g-icons">
                  <div className="button-g google-btn" onClick={() => googleLogin()}>
                    <img className="social-img" src={google} alt="google" />
                    <span>Google</span>
                  </div>

                  <div
                    className="button-g apple-btn"
                    onClick={() => showToast.error("Apple Sign-In coming soon")}
                  >
                    <img className="social-img" src={apple} alt="apple" />
                    <span>Apple</span>
                  </div>
                </div>
                <div className="terms-services" >
                  <p className="terms-condition">By signing up, you agree to the <b>Terms of Service</b> and <b>Data </b></p>
                  <p className="terms-condition"><b>Processing Agreement</b></p>
                </div>
              </div>
            </div>
          </form>
        )}
        {active === "Register" && (
          <form className="form-container" onSubmit={handleSubmit}>
            <label className="form-label">Full name</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <img src={username} alt="username" />
              </span>
              <input
                type="text"
                name="fullName"
                placeholder="Enter full name"
                className="form-input"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <label className="form-label">Email address</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <img src={email} alt="email" />
              </span>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <label className="form-label">Phone number</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <img src={phone} alt="phone" />
              </span>
              <input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <label className="form-label">Set Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <img src={password} alt="password" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span className="input-right-icon" onClick={togglePassword}>
                <img className="img-eye" src={eye} alt="toggle password" />
              </span>
            </div>

            <label className="form-label">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <img src={password} alt="password" />
              </span>
              <input
                type={showPasswords ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <span className="input-right-icon" onClick={togglePasswords}>
                <img className="img-eye" src={eye} alt="toggle password" />
              </span>
            </div>

            <div className="button-submit">
              <button type="submit" className="submit-button">
                Register
              </button>
            </div>
          </form>
        )}
      </div>
      </div>

      {/* <Footer /> */}
    </div>
  );
}
