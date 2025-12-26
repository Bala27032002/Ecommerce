import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MAINURL } from '../../../config/Api';
import { toast } from 'react-toastify';
import './DeliveryLogin.css';
import logo from '../../assets/Home-icons/Logo.svg';
import phone from '../../assets/phone.svg';
import password from '../../assets/password.svg';
import eye from '../../assets/eye.png';
import google from '../../assets/google.svg';
import apple from '../../assets/apple.svg';
import loginwith from '../../assets/loginwith.svg';

const DeliveryLogin = () => {
  const navigate = useNavigate();
  const [phoneNum, setPhoneNum] = useState('');
  const [passwordVal, setPasswordVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('deliveryBoyToken');
    const boy = localStorage.getItem('deliveryBoy');
    if (token && boy) {
      navigate('/delivery-dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    const phone = String(phoneNum || '').trim();
    const password = String(passwordVal || '').trim();

    if (!phone || !password) {
      toast.error('Phone and password are required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${MAINURL}delivery-boy/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('deliveryBoyToken', data.token);
        localStorage.setItem('deliveryBoy', JSON.stringify(data.deliveryBoy));
        toast.success('Login successful');
        navigate('/delivery-dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div className="delivery-login-wrapper">
      <div className="delivery-login-container">
        <div className="delivery-login-logo-section">
          <img src={logo} alt="FreshyGo" className="delivery-login-logo" />
          <h2 className="delivery-welcome-text">Welcome to FreshyGo</h2>
        </div>

        <div className="delivery-login-content">
          <h1 className="delivery-login-title">Login as delivery partner</h1>

          <form onSubmit={handleLogin} className="delivery-login-form">
            <div className="delivery-form-group">
              <label className="delivery-form-label">Phone number</label>
              <div className="delivery-input-wrapper">
                <span className="delivery-input-icon">
                  <img src={phone} alt="phone" />
                </span>
                <input
                  type="tel"
                  placeholder="8519103993"
                  className="delivery-form-input"
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="delivery-form-group">
              <label className="delivery-form-label">Password</label>
              <div className="delivery-input-wrapper">
                <span className="delivery-input-icon">
                  <img src={password} alt="password" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="delivery-form-input"
                  value={passwordVal}
                  onChange={(e) => setPasswordVal(e.target.value)}
                  disabled={loading}
                />
                <span className="delivery-input-right-icon" onClick={togglePassword}>
                  <img className="delivery-img-eye" src={eye} alt="toggle" />
                </span>
              </div>
            </div>

            <div className="delivery-form-footer">
              <label className="delivery-remember-me">
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#" className="delivery-forgot-password">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="delivery-login-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="delivery-login-with">
              <img style={{ width: '100%' }} src={loginwith} alt="or login with" />
            </div>

            <div className="delivery-g-icons">
              <h4 className="delivery-button-g">
                <img className="delivery-social-img" src={google} alt="google" />
                Google
              </h4>
              <h4 className="delivery-button-g">
                <img className="delivery-social-img" src={apple} alt="apple" />
                Apple
              </h4>
            </div>

            <div className="delivery-terms-services">
              <p className="delivery-terms-condition">
                By signing up, you agree to the <b>Terms of Service</b> and <b>Data</b>
              </p>
              <p className="delivery-terms-condition">
                <b>Processing Agreement</b>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeliveryLogin;
