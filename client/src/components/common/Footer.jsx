import React, { useRef } from "react";
import iconCycle from "../../assets/image2.png";
import { FaGithub, FaPhoneAlt, FaLinkedin, FaEnvelope } from "react-icons/fa";
import "./Footer.css";

// import "bootstrap/dist/css/bootstrap.css";
// import "bootstrap/dist/js/bootstrap.bundle.js";

function Footer() {
  return (
    <footer className="bg-footer text-white py-4 mt-5 ">
      <div className="container">
        <div className="footer-heading">
          <h3 style={{ fontFamily: "Cal Sans" }}>
            {" "}
            <a
              href="#"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <img src={iconCycle} width="100px" alt="Logly Logo" />
            </a>
            Ride Share !!
          </h3>
          <p>Sharing insights from all around the world</p>
        </div>

        <div className="text-center text-black font-monospace mb-2">
          Made with ❤️ by <span className="fw-bold animated-text">Nihesh</span>
        </div>

        {/* <address className="contact-info">
          <p>
            Email: <a href="mailto:niheshr03@gmail.com">niheshr03@gmail.com</a>
          </p>
          <p>
            Phone: <a href="tel:+918328094810">+91 8328094810</a>
          </p>
        </address> */}

        <div className="social-icons flex-wrap">
          <a
            href="https://github.com/rnihesh"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/rachakonda-nihesh/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin />
          </a>
          <a href="tel:+918328094810">
            <FaPhoneAlt />
          </a>
          <a href="mailto:niheshr03@gmail.com">
            <FaEnvelope />
          </a>
        </div>

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
