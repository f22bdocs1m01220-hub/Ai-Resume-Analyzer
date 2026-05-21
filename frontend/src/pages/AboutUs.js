import React from 'react';
import { motion } from 'framer-motion';
import './AboutUs.css';

function AboutUs() {
  const teamMembers = [
    { name: 'Dr. Sarah Johnson', role: 'Founder & CEO', bio: 'AI/ML expert with 15+ years in recruitment tech' },
    { name: 'James Chen', role: 'Lead Developer', bio: 'Full-stack engineer passionate about career tech' },
    { name: 'Maria Garcia', role: 'UX Designer', bio: 'Creates intuitive interfaces for complex problems' },
    { name: 'Ahmed Hassan', role: 'Data Scientist', bio: 'Develops advanced ML models for resume analysis' }
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Accuracy',
      description: 'We use cutting-edge AI to provide precise resume analysis and insights'
    },
    {
      icon: '🛡️',
      title: 'Privacy',
      description: 'Your data is secure. We never share your resume with third parties'
    },
    {
      icon: '💡',
      title: 'Innovation',
      description: 'Constantly improving our algorithms to stay ahead of industry trends'
    },
    {
      icon: '🤝',
      title: 'Support',
      description: '24/7 customer support to help you succeed in your career'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <motion.section 
        className="about-hero"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container">
          <motion.h1 variants={itemVariants}>
            About AI Resume Analyzer
          </motion.h1>
          <motion.p variants={itemVariants}>
            Empowering professionals to achieve their career goals through intelligent resume analysis
          </motion.p>
        </div>
      </motion.section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-grid">
            <motion.div 
              className="mission-content"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2>Our Mission</h2>
              <p>
                At AI Resume Analyzer, we believe everyone deserves a fair chance to succeed in their career. Our mission is to democratize access to expert-level resume optimization by leveraging artificial intelligence and industry knowledge.
              </p>
              <p>
                We've analyzed over 50,000 resumes and helped professionals increase their interview callback rates by an average of 40%. Our platform combines cutting-edge machine learning with real-world hiring expertise to provide actionable insights.
              </p>
              <div className="mission-stats">
                <div className="mission-stat">
                  <h3>50,000+</h3>
                  <p>Resumes Analyzed</p>
                </div>
                <div className="mission-stat">
                  <h3>40%</h3>
                  <p>Avg. Improvement</p>
                </div>
                <div className="mission-stat">
                  <h3>12+</h3>
                  <p>Years Experience</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="mission-image"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="image-placeholder large">
                <span>🚀</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Core Values
          </motion.h2>

          <motion.div 
            className="values-grid"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.15 }}
            viewport={{ once: true }}
          >
            {values.map((value, index) => (
              <motion.div 
                key={index}
                className="value-card"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Powered by Advanced Technology</h2>
            <p className="section-subtitle">
              Our platform uses state-of-the-art machine learning and NLP algorithms
            </p>
          </motion.div>

          <motion.div 
            className="tech-grid"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
            viewport={{ once: true }}
          >
            {[
              { name: 'Machine Learning', desc: 'Advanced algorithms for pattern recognition' },
              { name: 'NLP Processing', desc: 'Natural Language Processing for content analysis' },
              { name: 'ATS Simulation', desc: 'Simulates how ATS software reads resumes' },
              { name: 'Industry Data', desc: 'Real-time job market and industry insights' },
              { name: 'Cloud Infrastructure', desc: 'Secure and scalable cloud-based processing' },
              { name: 'Data Privacy', desc: 'Enterprise-grade encryption and security' }
            ].map((tech, index) => (
              <motion.div 
                key={index}
                className="tech-card"
                variants={itemVariants}
              >
                <h4>{tech.name}</h4>
                <p>{tech.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Team
          </motion.h2>

          <motion.div 
            className="team-grid"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.15 }}
            viewport={{ once: true }}
          >
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index}
                className="team-card"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <div className="team-avatar">{member.name[0]}</div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Journey
          </motion.h2>

          <motion.div 
            className="timeline"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.2 }}
            viewport={{ once: true }}
          >
            {[
              { year: '2014', event: 'Founded AI Resume Analyzer' },
              { year: '2016', event: 'Reached 10,000 users milestone' },
              { year: '2019', event: 'Launched advanced ML models' },
              { year: '2022', event: 'Expanded to 50+ countries' },
              { year: '2024', event: 'AI-powered recommendations launched' },
              { year: '2026', event: 'Next-generation platform release' }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="timeline-item"
                variants={itemVariants}
              >
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <h4>{item.year}</h4>
                  <p>{item.event}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Join Our Community</h2>
            <p>Start your journey to career success today</p>
            <a href="/analyze" className="btn btn-primary">
              Analyze Your Resume Free
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
