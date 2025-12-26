import React, { useState } from 'react';
import './ContactUs.css';
import { toast } from 'react-toastify';
import send from '../../assets/Icons/send-arrow.svg'

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber || !formData.message) {
      toast.error('Please fill all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email');
      return;
    }

    if (formData.phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      setTimeout(() => {
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          message: ''
        });
        setLoading(false);
      }, 1500);
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    if (emailInput.value) {
      toast.success('Thank you for subscribing!');
      emailInput.value = '';
    }
  };

  const faqItems = [
    {
      id: 1,
      question: 'Where can I get complete information?',
      answer: 'You can find complete information about our products and services on our website. Visit our Help Center or contact our customer support team for detailed information.'
    },
    {
      id: 2,
      question: 'Where can I track my order?',
      answer: 'You can track your order in real-time by logging into your account and navigating to "My Orders". You will receive email updates about your order status.'
    },
    {
      id: 3,
      question: 'How can I get promotions?',
      answer: 'Subscribe to our newsletter to get exclusive promotions and offers. You can also check our "Hot Deals" section for current discounts.'
    },
    {
      id: 4,
      question: 'What is your return policy?',
      answer: 'We offer a 7-day return policy on most products. Items must be in original condition with packaging. Contact our support team to initiate a return.'
    }
  ];

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="contact-us-page">
      
      <div className="contact-us-container">
        {/* Get in Touch Section */}
        <section className="get-in-touch-section">
          <div className="section-header">
            <h2>Get in Touch</h2>
            <p>We'd love to hear from you</p>
          </div>

          <div className="contact-content">
            {/* Form */}
            <div className="contact-form-wrapper">
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <div className="phone-input-wrapper">
                    <span className="country-code">+91</span>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="Enter your number"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="How can we help?"
                    rows="5"
                    value={formData.message}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Submit'}
                </button>

                <p className="form-disclaimer">
                  By contacting us, you agree to our <a href="#terms">Terms and Conditions</a>. Learn how we use your data in our <a href="#privacy">Privacy Policy</a>
                </p>
              </form>
            </div>

            {/* Contact Info */}
            <div className="contact-info-wrapper">
              <div className="contact-info-card">
                <h3>Contact Us</h3>
                <p className="contact-description">
                  Email, call, or complete the form to reach how Belagin Aje can solve your messaging problem.
                </p>

                <div className="contact-details">
                 
                    <p>admin.help@example.com</p>

                
                    <p>(888) 555-0120</p>
               

              
                    <a href="#support" className="support-link">Customer Support</a>
               
                </div>

                <div className="contact-map">
                  <iframe
                    title="Location Map"
                   src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d250645.0553273796!2d76.80241745539686!3d11.013924444734531!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859af2f971cb5%3A0x2fc1c81e183ed282!2sCoimbatore%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1765870635679!5m2!1sen!2sin"
                    width="100%"
                    height="250"
                    style={{ border: 0, borderRadius: '8px' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <div className="section-header">
            <p style={{fontSize:'22px'}}>FAQ</p>
            <p style={{fontSize:'24px',color:'black',lineHeight:'4rem',fontWeight:'500'}}>Do you have any questions for us?</p>
            <p className="faq-subtitle">If there are question you want to ask. We will answer all your question.</p>
          </div>

          <div className="faq-newsletter">
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <input 
                type="email" 
                placeholder="Your email address" 
                required
              />
              <button type="submit" className="newsletter-btn">
                <span style={{marginTop:'5px'}}><img src={send}/></span>
              </button>
            </form>
          </div>

          <div className="faq-questions-section">
            <h3>Questions About FreshyGo</h3>
            <p className="faq-intro">Questions About FreshyGo We Answer Here:</p>

            <div className="faq-list">
              {faqItems.map((item) => (
                <div key={item.id} className="faq-item">
                  <button
                    className={`faq-question ${expandedFAQ === item.id ? 'active' : ''}`}
                    onClick={() => toggleFAQ(item.id)}
                  >
                    <span className="question-text">{item.question}</span>
                    <span className="faq-icon">
                      {expandedFAQ === item.id ? '−' : '+'}
                    </span>
                  </button>
                  {expandedFAQ === item.id && (
                    <div className="faq-answer">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactUs;
