import React from "react";
import iconCycle from "../../assets/image2.png";
import {
  FaGithub,
  FaPhoneAlt,
  FaLinkedin,
  FaEnvelope,
  FaCar,
  FaLeaf,
  FaUsers,
  FaShieldAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="bg-footer">
      <div className="footer-container">
        {/* Features Section */}
        <div className="footer-features">
          <div className="footer-feature">
            <div className="footer-feature-icon">
              <FaCar />
            </div>
            <div>
              <h5>Easy Ride Sharing</h5>
              <p>Find or offer rides with just a few clicks</p>
            </div>
          </div>
          <div className="footer-feature">
            <div className="footer-feature-icon">
              <FaLeaf />
            </div>
            <div>
              <h5>Eco-Friendly</h5>
              <p>Reduce your carbon footprint by sharing rides</p>
            </div>
          </div>
          <div className="footer-feature">
            <div className="footer-feature-icon">
              <FaUsers />
            </div>
            <div>
              <h5>Community Driven</h5>
              <p>Connect with travelers going your way</p>
            </div>
          </div>
          <div className="footer-feature">
            <div className="footer-feature-icon">
              <FaShieldAlt />
            </div>
            <div>
              <h5>Safe & Secure</h5>
              <p>Verified users and secure ride requests</p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <a
              href="#"
              className="footer-logo"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <img src={iconCycle} alt="Ride Share Logo" />
              <span>Ride Share</span>
            </a>
            <p className="footer-description">
              Share rides, save money, reduce pollution. Join our community of
              smart travelers today.
            </p>
            <div className="social-icons">
              <a
                href="https://github.com/rnihesh"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>
              <a
                href="https://www.linkedin.com/in/rachakonda-nihesh/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a href="tel:+918328094810" aria-label="Phone">
                <FaPhoneAlt />
              </a>
              <a href="mailto:niheshr03@gmail.com" aria-label="Email">
                <FaEnvelope />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/signin">Sign In</Link>
              </li>
              <li>
                <Link to="/signup">Get Started</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-links">
            <h4>Support</h4>
            <ul>
              <li>
                <a href="mailto:niheshr03@gmail.com">Contact Us</a>
              </li>
              <li>
                <a
                  href="https://github.com/rnihesh/car_pooling"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Report an Issue
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/rnihesh/car_pooling"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contribute
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <small>
            &copy; {new Date().getFullYear()} Ride Share. All rights reserved.
          </small>
          <div className="footer-credits">
            Made with <span className="heart">❤️</span> by{" "}
            <a
              href="https://github.com/rnihesh"
              target="_blank"
              rel="noopener noreferrer"
            >
              Nihesh
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
