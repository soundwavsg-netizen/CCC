import React, { useState } from 'react';
import './Project62Landing.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Project62Landing = () => {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState({ name: '', email: '', phone: '' });
  const [formStatus, setFormStatus] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('4_weeks');
  const [selectedMeals, setSelectedMeals] = useState(1);

  // Lead form submission
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/project62/leads`, leadData);
      setFormStatus('success');
      setTimeout(() => {
        setShowLeadForm(false);
        setFormStatus('');
        setLeadData({ name: '', email: '', phone: '' });
      }, 3000);
    } catch (error) {
      console.error('Lead submission error:', error);
      setFormStatus('error');
    }
  };

  // Calculate meal-prep pricing
  const calculateMealPrepPrice = () => {
    const pricing = {
      '1_week': { 1: 12.00, 2: 12.00 },
      '2_weeks': { 1: 11.50, 2: 11.50 },
      '4_weeks': { 1: 10.80, 2: 10.80 },
      '6_weeks': { 1: 10.00, 2: 10.00 }
    };
    
    const durationMap = { '1_week': 1, '2_weeks': 2, '4_weeks': 4, '6_weeks': 6 };
    const weeks = durationMap[selectedDuration];
    const pricePerMeal = pricing[selectedDuration][selectedMeals];
    const totalMeals = weeks * 6 * selectedMeals; // 6 days per week
    const mealCost = totalMeals * pricePerMeal;
    const deliveryCost = weeks * 20; // $20 per week
    const totalCost = mealCost + deliveryCost;
    
    return {
      pricePerMeal: pricePerMeal.toFixed(2),
      totalMeals,
      mealCost: mealCost.toFixed(2),
      deliveryCost: deliveryCost.toFixed(2),
      totalCost: totalCost.toFixed(2)
    };
  };

  const pricing = calculateMealPrepPrice();

  return (
    <div className="project62-landing">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            6 Days a Week.<br />
            2 Meals a Day.<br />
            <span className="highlight">One Life Transformed.</span>
          </h1>
          <p className="hero-subtitle">
            "I dropped from 80kg to 62kg in 7 months — no crash diets, no fads.<br />
            Project 62 is how I did it — and how you can too."
          </p>
          <p className="hero-explanation">
            <strong>Project 62</strong> = Ian's achieved weight of 62kg + our proven system:<br />
            <span className="highlight-text">6 days of planned meals · 2 meals a day · Delivered to your door</span>
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => setShowLeadForm(true)}>
              Get Free 6-Day Guide
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById('meal-prep').scrollIntoView({ behavior: 'smooth' })}>
              Explore Meal Prep Plans
            </button>
          </div>
        </div>
      </section>

      {/* The 62 Journey */}
      <section className="journey-section">
        <h2>The 62 Journey</h2>
        <div className="journey-content">
          <div className="journey-text">
            <p className="journey-quote">
              "Consistency is key. I ate 2 balanced meals a day, 6 days a week, and still enjoyed life.
              Project 62 is about balance and sustainability — we handle the meal prep, you focus on showing up."
            </p>
            <div className="journey-stats">
              <div className="stat">
                <span className="stat-label">Age</span>
                <span className="stat-value">34</span>
              </div>
              <div className="stat">
                <span className="stat-label">Height</span>
                <span className="stat-value">162 cm</span>
              </div>
              <div className="stat">
                <span className="stat-label">Weight Loss</span>
                <span className="stat-value">80→62 kg</span>
              </div>
              <div className="stat">
                <span className="stat-label">System</span>
                <span className="stat-value">6 days/2 meals</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 60-20-20 Philosophy */}
      <section className="philosophy-section">
        <h2>The 60-20-20 Philosophy</h2>
        <p className="philosophy-intro">The proven framework behind Project 62</p>
        
        <div className="philosophy-grid">
          <div className="philosophy-card">
            <div className="card-icon">60%</div>
            <h3>Diet</h3>
            <p>The core of success. We provide healthy, balanced meal-prep plans with clear portions and great taste. This is where most results come from.</p>
          </div>
          
          <div className="philosophy-card">
            <div className="card-icon">20%</div>
            <h3>Consistency & Sustainability</h3>
            <p>People often quit when meal prep gets hard. We remove that barrier by delivering meals to your doorstep, keeping you consistent week after week.</p>
          </div>
          
          <div className="philosophy-card">
            <div className="card-icon">20%</div>
            <h3>Movement & Activity</h3>
            <p>We offer simple tips for staying active to support your journey — but movement is not the main focus. Food and consistency lead the way.</p>
          </div>
        </div>
        
        <p className="philosophy-tagline">
          "Project 62 isn't a challenge — it's a lifestyle you can actually keep."
        </p>
      </section>

      {/* Digital Guides Section */}
      <section className="digital-guides-section">
        <h2>Digital Guides & Programs</h2>
        
        <div className="guides-grid">
          <div className="guide-card free">
            <div className="guide-badge">FREE</div>
            <h3>6-Day Starter Guide</h3>
            <p>Simple meal plan + swaps. Free upon sign-up (name & email required).</p>
            <div className="guide-price">$0</div>
            <button className="btn-guide" onClick={() => setShowLeadForm(true)}>
              Download Free Guide
            </button>
          </div>
          
          <div className="guide-card">
            <h3>6-Week Transformation Plan</h3>
            <p>Full plan + grocery guide + recipes.</p>
            <div className="guide-price">$14.90</div>
            <button className="btn-guide" onClick={() => window.location.href = '/project62/checkout/digital/starter'}>
              Get Full Plan
            </button>
          </div>
          
          <div className="guide-card premium">
            <div className="guide-badge">CUSTOM</div>
            <h3>Custom Plan with Ian</h3>
            <p>Personalised plan + chat consultation.</p>
            <div className="guide-price">$29.90</div>
            <button className="btn-guide" onClick={() => window.location.href = '/project62/checkout/digital/custom'}>
              Build My Plan
            </button>
          </div>
        </div>
      </section>

      {/* Meal-Prep Subscription Section */}
      <section className="meal-prep-section" id="meal-prep">
        <h2>Meal-Prep Subscription</h2>
        <p className="meal-prep-subtitle">Weekly delivery (once a week). Delivery fee $20/week.</p>
        
        <div className="meal-prep-calculator">
          <div className="calculator-controls">
            <div className="control-group">
              <label>Duration</label>
              <select value={selectedDuration} onChange={(e) => setSelectedDuration(e.target.value)}>
                <option value="1_week">1 Week</option>
                <option value="2_weeks">2 Weeks</option>
                <option value="4_weeks">4 Weeks</option>
                <option value="6_weeks">6 Weeks</option>
              </select>
            </div>
            
            <div className="control-group">
              <label>Meals Per Day</label>
              <select value={selectedMeals} onChange={(e) => setSelectedMeals(parseInt(e.target.value))}>
                <option value="1">1 Meal/Day</option>
                <option value="2">2 Meals/Day</option>
              </select>
            </div>
          </div>
          
          <div className="pricing-breakdown">
            <div className="breakdown-row">
              <span>Price per meal:</span>
              <span>${pricing.pricePerMeal}</span>
            </div>
            <div className="breakdown-row">
              <span>Total meals ({pricing.totalMeals}):</span>
              <span>${pricing.mealCost}</span>
            </div>
            <div className="breakdown-row">
              <span>Delivery fee:</span>
              <span>${pricing.deliveryCost}</span>
            </div>
            <div className="breakdown-row total">
              <span>Total:</span>
              <span>${pricing.totalCost} SGD</span>
            </div>
          </div>
          
          <button className="btn-subscribe" onClick={() => window.location.href = `/project62/checkout/meal-prep?duration=${selectedDuration}&meals=${selectedMeals}`}>
            Subscribe Now
          </button>
        </div>
      </section>

      {/* Why Project 62 Works */}
      <section className="why-section">
        <h2>Why Project 62 Works</h2>
        <p className="why-quote">
          "We deliver the 60% (your meals), keep you on the next 20% (consistency through weekly delivery), and support you through the last 20% (simple activity tips).<br />
          That's the formula — no crash diets, no complicated workouts, just progress you can live with."
        </p>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <h2>What Customers Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>"Got another cool order from me — tastes great and keeps me on track!"</p>
            <span className="testimonial-author">— Customer A</span>
          </div>
          <div className="testimonial-card">
            <p>"Finally a meal plan I can stick to. No more meal prep stress!"</p>
            <span className="testimonial-author">— Customer B</span>
          </div>
        </div>
      </section>

      {/* Contact & Socials */}
      <section className="contact-section">
        <h2>Get In Touch</h2>
        <div className="contact-links">
          <a href="https://wa.me/6589821301" target="_blank" rel="noopener noreferrer" className="contact-link">
            📱 WhatsApp
          </a>
          <a href="https://instagram.com/project62sg" target="_blank" rel="noopener noreferrer" className="contact-link">
            📷 Instagram
          </a>
          <a href="mailto:project62@gmail.com" className="contact-link">
            ✉️ Email
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Project 62 | A Cognition & Competence Consultancy Initiative</p>
        <div className="footer-links">
          <a href="/project62/customer/login">Customer Login</a>
          <a href="/project62/admin">Admin</a>
        </div>
      </footer>

      {/* Lead Form Modal */}
      {showLeadForm && (
        <div className="modal-overlay" onClick={() => setShowLeadForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLeadForm(false)}>×</button>
            <h3>Get Your FREE 6-Day Starter Guide</h3>
            <p>Enter your details and we'll email you the guide instantly.</p>
            
            <form onSubmit={handleLeadSubmit}>
              <input
                type="text"
                placeholder="Your Name *"
                value={leadData.name}
                onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Your Email *"
                value={leadData.email}
                onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="Your Phone (optional)"
                value={leadData.phone}
                onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
              />
              
              <button type="submit" disabled={formStatus === 'sending'}>
                {formStatus === 'sending' ? 'Sending...' : 'Send Me the Guide'}
              </button>
              
              {formStatus === 'success' && (
                <p className="form-message success">✅ Check your email! Guide sent successfully.</p>
              )}
              {formStatus === 'error' && (
                <p className="form-message error">❌ Something went wrong. Please try again.</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project62Landing;
