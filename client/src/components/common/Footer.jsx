import React from "react";
import iconCycle from "../../assets/image2.png";
import { FaGithub, FaPhoneAlt, FaLinkedin, FaEnvelope } from "react-icons/fa";
import "./Footer.css";

function Footer() {
  return (
    <footer className="bg-footer text-dark py-4 mt-5">
      <div className="container">
        <div className="footer-heading">
          <h3 style={{ fontFamily: "Cal Sans" }}>
            <a
              href="#"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{ textDecoration: "none" }}
            >
              <img src={iconCycle} width="90px" alt="Ride Share Logo" />
            </a>
            <span style={{ color: "#e85f5c", marginLeft: 10 }}>Ride Share</span>
          </h3>
          <p style={{ color: "#667085" }}>
            Sharing insights from all around the world
          </p>
        </div>
        {/* <div
          className="text-center font-monospace mb-2"
          style={{ color: "#222" }}
        >
          Made with <span style={{ color: "#e85f5c" }}>❤️</span> by{" "}
          <span className="fw-bold animated-text" style={{ color: "#e85f5c" }}>
            Nihesh
          </span>
        </div> */}
        {/* <div className="social-icons flex-wrap">
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
        </div> */}
        <div className="footer-bottom">
          <small>
            &copy; {new Date().getFullYear()} Ride Share. All rights reserved.
          </small>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
