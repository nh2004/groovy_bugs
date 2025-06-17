import React from "react";
import "../styles/Footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="footer-main">
      <div className="footer-col about">
        <h3>ABOUT US</h3>
        <p>We're working on creating the sexiest aestheticism store. All about New-age and Vintage room-decor.</p>
      </div>
      <div className="footer-col more">
        <h3>MORE</h3>
        <ul>
          <li><a href="#">TRACK MY ORDER</a></li>
          <li><a href="#">SUPPORT</a></li>
          <li><a href="#">SHIPPING POLICY</a></li>
          <li><a href="#">B2B ENQUIRIES</a></li>
          <li><a href="#">RETURNS AND REFUNDS</a></li>
          <li><a href="#">TERMS AND CONDITIONS</a></li>
          <li><a href="#">PRIVACY POLICY</a></li>
        </ul>
        <div className="footer-socials">
          <a href="#" aria-label="Facebook">
            <img src="/images/facebook-logo.jpg" alt="Facebook" className="footer-social-icon" />
          </a>
          <a href="https://www.instagram.com/groovy.bugz/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <img src="/images/instagram-logo.jpg" alt="Instagram" className="footer-social-icon" />
          </a>
          <a href="#" aria-label="Pinterest">
            <img src="/images/pinterest-logo.jpg" alt="Pinterest" className="footer-social-icon" />
          </a>
        </div>
      </div>
      <div className="footer-col logo-col">
        <img src="/images/logo.jpg" alt="Groovy Bugs Logo" className="footer-logo-img" />
      </div>
    </div>
    <div className="footer-bottom">
      <span>© 2025, Groovy Bugs</span>
    </div>
  </footer>
);

export default Footer; 