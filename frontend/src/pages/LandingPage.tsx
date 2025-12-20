import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="nav-brand">LMS</div>
        <div className="nav-actions">
          <button className="btn-outline" onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="btn-primary" onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>
      </nav>

      <main className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Master Your<br />
            <span className="hero-highlight">Internship Journey</span>
          </h1>
          <p className="hero-description">
            A structured learning platform designed to help interns grow with guided courses, 
            progress tracking, and verified certificates.
          </p>
          <div className="hero-actions">
            <button className="btn-primary btn-large" onClick={() => navigate('/register')}>
              Start Learning Today
            </button>
          </div>
        </div>

        <div className="hero-features">
          <div className="hero-feature">
            <div className="feature-number">01</div>
            <div className="feature-content">
              <h3>Structured Courses</h3>
              <p>Learn step-by-step with sequential chapters designed by mentors</p>
            </div>
          </div>
          <div className="hero-feature">
            <div className="feature-number">02</div>
            <div className="feature-content">
              <h3>Track Progress</h3>
              <p>Monitor your learning journey with real-time progress tracking</p>
            </div>
          </div>
          <div className="hero-feature">
            <div className="feature-number">03</div>
            <div className="feature-content">
              <h3>Earn Certificates</h3>
              <p>Get recognized with certificates upon course completion</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        <p>Built for learning. Designed for growth.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

