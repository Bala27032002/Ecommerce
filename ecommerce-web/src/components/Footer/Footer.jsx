import React from 'react'
import './Footer.css'
import address from '../../assets/Footer/address.svg'
import call from '../../assets/Footer/call.svg'
import email from '../../assets/Footer/email.svg'
import clock from '../../assets/Footer/clock.svg'
import facebook from '../../assets/Footer/facebook.svg'
import twitter from '../../assets/Footer/twitter.svg'
import instagram from '../../assets/Footer/instagram.svg'
import linkedin from '../../assets/Footer/linkedin.svg'

const Footer = () => {
  return (
    <div>
    <div className='Footer-container'>

      <div className='web-name-1'>
        <h4>Freshly go</h4>
        <p style={{ display: 'flex', gap: '10px' }}> <span><img src={address} alt='f'/></span>Addres:dhfghdegf</p>
        <p style={{ display: 'flex', gap: '10px' }}> <span><img src={call} alt='f'/></span>call us:1233-4777</p>
        <p style={{ display: 'flex', gap: '10px' }}><span><img src={email} alt='f'/></span>Email:freshlygo@contact.com</p>
        <p style={{ display: 'flex', gap: '10px' }}><span><img src={clock} alt='f'/></span>work hours:8.00-20.00,monday-sunday</p>
      </div>
      <div className='web-name'>
        <h4>Account</h4>
        <p>Wishlist</p>
        <p>Cart</p>
        <p>Track order</p>
        <p>Shipping Details</p>
      </div>
      <div className='web-name'>
        <h4>Useful links</h4>
        <p>About US</p>
        <p>Contact</p>
        <p>Hot deals</p>
        <p>Promotion</p>
        <p>New Products</p>
      </div>
      <div className='web-name'>
        <h4>Help Center</h4>
        <p>Payments</p>
        <p>Refund</p>
        <p>Checkout</p>
        <p>shipping</p>
        <p>Q&A</p>
        <p>Privacy Policy</p>
      </div>
     
 
    </div>
    <div className="line-wrapper">
  <div className="horizontal-line">
    <div className='rights-reserved'>
    <p>© 2022, All rights reserved</p>
    <div className='social-media-icons'>
<img src={facebook} alt='fff'/>
 <img src={linkedin} alt='fff'/>
  <img src={instagram} alt='fff'/>
  <img src={twitter} alt='fff'/>
    </div>
    </div>
  </div >


</div>
    </div>
    
    
  )
}

export default Footer