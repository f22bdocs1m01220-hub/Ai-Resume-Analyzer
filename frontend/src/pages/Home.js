import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const features = [
    {
      icon: '🎯',
      title: 'Smart Analysis',
      description: 'Advanced AI algorithms analyze your resume and provide personalized insights to improve your chances of getting hired.'
    },
    {
      icon: '📊',
      title: 'Detailed Metrics',
      description: 'Get comprehensive metrics including ATS compatibility score, keyword optimization, and skill assessment.'
    },
    {
      icon: '💡',
      title: 'Expert Recommendations',
      description: 'Receive actionable recommendations based on industry standards and job market trends.'
    },
    {
      icon: '🎓',
      title: 'Course Suggestions',
      description: 'Discover recommended courses and resources to build skills that employers are looking for.'
    },
    {
      icon: '📈',
      title: 'Career Insights',
      description: 'Track your career trajectory with data-driven insights and personalized career path recommendations.'
    },
    {
      icon: '🔐',
      title: 'Privacy Protected',
      description: 'Your resume data is completely secure and never shared with third parties.'
    }
  ];

  const benefits = [
    'Improve ATS Compatibility',
    'Optimize Keywords',
    'Enhance Formatting',
    'Highlight Strengths',
    'Fix Common Mistakes',
    'Stand Out to Recruiters'
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <motion.section 
        className="hero-section"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="hero-content">
          <motion.h1 variants={itemVariants}>
            Your Resume, Supercharged by AI
          </motion.h1>
          
          <motion.p variants={itemVariants} className="hero-subtitle">
            Get instant feedback on your resume with AI-powered analysis. Optimize your application to stand out from the competition and land your dream job.
          </motion.p>
          
          <motion.div variants={itemVariants} className="hero-buttons">
            <Link to="/analyze" className="btn btn-primary">
              Analyze My Resume Now
            </Link>
            <Link to="/about" className="btn btn-secondary">
              Learn More
            </Link>
          </motion.div>
        </div>

        <motion.div 
          className="hero-animation"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="floating-card">
            <span className="card-emoji">📄</span>
            <p>Resume Analysis</p>
          </div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <motion.div 
            className="stats-grid"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="stat-card"
              whileHover={{ scale: 1.05 }}
            >
              <h3>50,000+</h3>
              <p>Resumes Analyzed</p>
            </motion.div>
            <motion.div 
              className="stat-card"
              whileHover={{ scale: 1.05 }}
            >
              <h3>85%</h3>
              <p>Success Rate</p>
            </motion.div>
            <motion.div 
              className="stat-card"
              whileHover={{ scale: 1.05 }}
            >
              <h3>100+</h3>
              <p>Companies Partnered</p>
            </motion.div>
            <motion.div 
              className="stat-card"
              whileHover={{ scale: 1.05 }}
            >
              <h3>24/7</h3>
              <p>Support Available</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Powerful Features</h2>
            <p className="section-subtitle">
              Everything you need to create a standout resume and advance your career
            </p>
          </motion.div>

          <motion.div 
            className="features-grid"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-card"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>

          <motion.div 
            className="steps-grid"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.15 }}
            viewport={{ once: true }}
          >
            {[
              { step: 1, title: 'Upload Resume', desc: 'Simply upload your resume in PDF format' },
              { step: 2, title: 'AI Analysis', desc: 'Our AI analyzes your resume comprehensively' },
              { step: 3, title: 'Get Insights', desc: 'Receive detailed feedback and recommendations' },
              { step: 4, title: 'Improve & Apply', desc: 'Implement suggestions and ace the interviews' }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="step-card"
                variants={itemVariants}
              >
                <div className="step-number">{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="benefits-wrapper">
            <motion.div 
              className="benefits-content"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2>Why Choose AI Resume Analyzer?</h2>
              <p>
                Our platform combines cutting-edge artificial intelligence with industry expertise to provide you with the most comprehensive resume analysis available. Whether you're a recent graduate or an experienced professional, we help you present your best self to employers.
              </p>
              <ul className="benefits-list">
                {benefits.map((benefit, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    ✓ {benefit}
                  </motion.li>
                ))}
              </ul>
              <Link to="/analyze" className="btn btn-primary">
                Start Your Free Analysis
              </Link>
            </motion.div>

            <motion.div 
              className="benefits-image"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="image-placeholder">
                <div className="placeholder-content">
                  <span>🚀</span>
                  <p>AI-Powered</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Boost Your Career?</h2>
            <p>Join thousands of professionals who have improved their resumes and landed their dream jobs.</p>
            <Link to="/analyze" className="btn btn-primary">
              Analyze Your Resume Free
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;
