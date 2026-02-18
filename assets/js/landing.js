/**
 * UNLIMITR — Landing Page JavaScript
 * Simple animations and interactions
 */

(function() {
  'use strict';

  // =============================
  // Header Scroll Effect
  // =============================
  
  const header = document.querySelector('.main-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      } else {
        header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
      }
    });
  }

  // =============================
  // Smooth Scroll
  // =============================
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || !href) return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offsetTop = target.offsetTop - 100;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // =============================
  // Scroll Reveal Animation
  // =============================
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe cards
  function initScrollReveal() {
    const elements = document.querySelectorAll(
      '.service-card, .condition-card, .expert-profile, .review-card'
    );
    
    elements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
      observer.observe(el);
    });
  }

  // =============================
  // Counter Animation
  // =============================
  
  function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const suffix = element.textContent.includes('+') ? '+' : '';
    const prefix = element.textContent.includes('$') ? '$' : '';
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        element.textContent = prefix + target.toLocaleString() + suffix;
        clearInterval(timer);
      } else {
        element.textContent = prefix + Math.floor(start).toLocaleString() + suffix;
      }
    }, 16);
  }

  function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const text = entry.target.textContent;
          let target = parseInt(text.replace(/[^0-9]/g, ''));
          if (text.includes('M')) target = target * 1000000;
          if (text.includes('B')) target = target * 1000000000;
          animateCounter(entry.target, target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
      counterObserver.observe(counter);
    });
  }

  // =============================
  // Review Navigation
  // =============================
  
  function initReviewNav() {
    const prevBtn = document.querySelector('.prev-arrow');
    const nextBtn = document.querySelector('.next-arrow');
    
    if (prevBtn && nextBtn) {
      // Simple placeholder - can be extended with actual review data
      prevBtn.addEventListener('click', () => {
        console.log('Previous review');
      });
      
      nextBtn.addEventListener('click', () => {
        console.log('Next review');
      });
    }
  }

  // =============================
  // Newsletter Form
  // =============================
  
  function initNewsletter() {
    const form = document.querySelector('.newsletter-form');
    const input = document.querySelector('.newsletter-input');
    const button = document.querySelector('.newsletter-btn');
    
    if (form && input && button) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = input.value;
        if (email && email.includes('@')) {
          alert('Thank you for subscribing!');
          input.value = '';
        } else {
          alert('Please enter a valid email address');
        }
      });
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
      });
    }
  }

  // =============================
  // Initialize Everything
  // =============================
  
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    initScrollReveal();
    initCounters();
    initReviewNav();
    initNewsletter();
  }

  // Start
  init();

})();
