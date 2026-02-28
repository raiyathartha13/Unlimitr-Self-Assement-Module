/**
 * Coach Carousel Component — API-Based Coach Selection
 * Displays recommended coaches with profile matching
 * 
 * Features:
 * - Fetches coaches from backend API
 * - Shows compatibility score
 * - Allows coach selection
 * - Saves preference to backend
 */

(function(global) {
  'use strict';

  const API_ENDPOINT = '/api/coaches';
  const PREFERENCE_ENDPOINT = '/api/save-preference';

  /**
   * CoachCarousel Manager
   */
  function CoachCarousel(containerId, options) {
    this.container = document.getElementById(containerId);
    this.options = options || {};
    this.coaches = [];
    this.selectedCoach = null;
    this.userProfile = this.loadUserProfile();
  }

  /**
   * Initialize carousel
   */
  CoachCarousel.prototype.init = function() {
    if (!this.container) {
      console.warn('CoachCarousel: Container not found');
      return;
    }

    this.injectStyles();
    this.fetchCoaches();
  };

  /**
   * Load user profile from localStorage
   */
  CoachCarousel.prototype.loadUserProfile = function() {
    try {
      const stored = localStorage.getItem('assessmentData') || 
                    localStorage.getItem('unlimitr_assessment');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return {};
  };

  /**
   * Fetch coaches from API
   */
  CoachCarousel.prototype.fetchCoaches = function() {
    const userId = localStorage.getItem('userId') || 'anonymous';
    const url = `${API_ENDPOINT}?recommended=true&user_id=${userId}`;

    // Show loading state
    this.container.innerHTML = '<div class="coach-loading">Loading recommended coaches...</div>';

    // For demo: use mock data if API unavailable
    fetch(url)
      .then(res => res.json())
      .then(data => {
        this.coaches = data.coaches || data || this.getMockCoaches();
        this.render();
      })
      .catch(err => {
        console.warn('API unavailable, using mock data:', err);
        this.coaches = this.getMockCoaches();
        this.render();
      });
  };

  /**
   * Get mock coaches for demo
   */
  CoachCarousel.prototype.getMockCoaches = function() {
    return [
      {
        id: 1,
        name: 'Dr. Priya Sharma',
        specialty: 'Metabolic Correction',
        experience: '8 years',
        rating: 4.9,
        image: 'https://via.placeholder.com/120',
        intro: 'Specialized in thyroid and PCOS management. 500+ successful transformations.',
        bestFor: 'Thyroid',
        compatibility: 98
      },
      {
        id: 2,
        name: 'Rajesh Kumar',
        specialty: 'Fat Loss & Performance',
        experience: '12 years',
        rating: 4.8,
        image: 'https://via.placeholder.com/120',
        intro: 'Expert in metabolic reset protocols. Former competitive athlete.',
        bestFor: 'Fat Loss',
        compatibility: 95
      },
      {
        id: 3,
        name: 'Ananya Reddy',
        specialty: 'Hormonal Balance',
        experience: '6 years',
        rating: 4.9,
        image: 'https://via.placeholder.com/120',
        intro: 'PCOS and insulin resistance specialist. Cycle-synced nutrition expert.',
        bestFor: 'PCOS',
        compatibility: 97
      }
    ];
  };

  /**
   * Render carousel
   */
  CoachCarousel.prototype.render = function() {
    if (this.coaches.length === 0) {
      this.container.innerHTML = '<div class="coach-empty">No coaches available</div>';
      return;
    }

    const html = `
      <div class="coach-carousel-header">
        <h3 class="coach-title">Based on your biological profile, we recommend:</h3>
        <p class="coach-subtitle">Select your preferred coach to personalize your transformation plan</p>
      </div>
      <div class="coach-cards-grid" id="coachCardsGrid">
        ${this.coaches.map(coach => this.renderCoachCard(coach)).join('')}
      </div>
    `;

    this.container.innerHTML = html;
    this.attachCardListeners();
  };

  /**
   * Render individual coach card
   */
  CoachCarousel.prototype.renderCoachCard = function(coach) {
    const compatibilityBadge = coach.compatibility >= 95 
      ? `<div class="coach-compatibility">${coach.compatibility}% Match</div>`
      : '';

    return `
      <div class="coach-card glass" data-coach-id="${coach.id}">
        ${compatibilityBadge}
        <div class="coach-image-wrap">
          <img src="${coach.image}" alt="${coach.name}" class="coach-image" onerror="this.src='https://via.placeholder.com/120'">
          ${coach.bestFor ? `<div class="coach-best-for">Best for ${coach.bestFor}</div>` : ''}
        </div>
        <div class="coach-info">
          <h4 class="coach-name">${coach.name}</h4>
          <div class="coach-specialty">${coach.specialty}</div>
          <div class="coach-meta">
            <span class="coach-experience">${coach.experience}</span>
            <span class="coach-rating">⭐ ${coach.rating}</span>
          </div>
          <p class="coach-intro">${coach.intro}</p>
          <button class="coach-select-btn" data-coach-id="${coach.id}">
            Select This Coach
          </button>
        </div>
      </div>
    `;
  };

  /**
   * Attach event listeners to cards
   */
  CoachCarousel.prototype.attachCardListeners = function() {
    const cards = this.container.querySelectorAll('.coach-card');
    const buttons = this.container.querySelectorAll('.coach-select-btn');

    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('coach-select-btn')) return;
        const coachId = parseInt(card.dataset.coachId);
        this.selectCoach(coachId);
      });
    });

    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const coachId = parseInt(btn.dataset.coachId);
        this.selectCoach(coachId);
      });
    });
  };

  /**
   * Select coach
   */
  CoachCarousel.prototype.selectCoach = function(coachId) {
    const coach = this.coaches.find(c => c.id === coachId);
    if (!coach) return;

    this.selectedCoach = coach;

    // Update UI
    this.container.querySelectorAll('.coach-card').forEach(card => {
      card.classList.remove('selected');
      if (parseInt(card.dataset.coachId) === coachId) {
        card.classList.add('selected');
      }
    });

    // Save preference
    this.savePreference(coach);
  };

  /**
   * Save coach preference to backend
   */
  CoachCarousel.prototype.savePreference = function(coach) {
    const userId = localStorage.getItem('userId') || 'anonymous';
    const planData = this.getCurrentPlan();

    const payload = {
      user_id: userId,
      coach_id: coach.id,
      plan_type: planData.duration || 12,
      timestamp: new Date().toISOString()
    };

    // Save locally
    localStorage.setItem('selectedCoach', JSON.stringify(coach));

    // Send to backend
    fetch(PREFERENCE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      console.log('Coach preference saved:', data);
      this.showSuccessMessage();
    })
    .catch(err => {
      console.warn('Failed to save preference:', err);
      // Non-critical, preference saved locally
      this.showSuccessMessage();
    });
  };

  /**
   * Get current plan from localStorage
   */
  CoachCarousel.prototype.getCurrentPlan = function() {
    try {
      const stored = localStorage.getItem('recommendedPlan');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return { duration: 12 };
  };

  /**
   * Show success message
   */
  CoachCarousel.prototype.showSuccessMessage = function() {
    const msg = document.createElement('div');
    msg.className = 'coach-success-msg';
    msg.textContent = '✓ Coach selected! Your plan will be personalized by ' + this.selectedCoach.name;
    this.container.insertAdjacentElement('afterbegin', msg);
    
    setTimeout(() => {
      msg.style.opacity = '0';
      setTimeout(() => msg.remove(), 300);
    }, 3000);
  };

  /**
   * Inject CSS styles
   */
  CoachCarousel.prototype.injectStyles = function() {
    if (document.getElementById('coach-carousel-styles')) return;

    const style = document.createElement('style');
    style.id = 'coach-carousel-styles';
    style.textContent = `
      .coach-carousel-header {
        text-align: center;
        margin-bottom: 32px;
      }
      .coach-title {
        font-size: 22px;
        font-weight: 800;
        margin-bottom: 8px;
        color: var(--text, #e2f0ff);
      }
      .coach-subtitle {
        font-size: 14px;
        color: rgba(180, 200, 240, 0.7);
      }
      .coach-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-top: 24px;
      }
      .coach-card {
        padding: 24px;
        border: 1px solid rgba(0, 212, 255, 0.15);
        border-radius: 18px;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
      }
      .coach-card:hover {
        border-color: rgba(0, 212, 255, 0.35);
        transform: translateY(-4px);
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
      }
      .coach-card.selected {
        border-color: #00b87a;
        border-width: 2px;
        background: rgba(0, 184, 122, 0.08);
      }
      .coach-compatibility {
        position: absolute;
        top: 16px;
        right: 16px;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(0, 184, 122, 0.2);
        color: #00b87a;
        border: 1px solid rgba(0, 184, 122, 0.3);
      }
      .coach-image-wrap {
        position: relative;
        width: 120px;
        height: 120px;
        margin: 0 auto 16px;
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid rgba(0, 212, 255, 0.2);
      }
      .coach-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .coach-best-for {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
        font-size: 10px;
        font-weight: 600;
        text-align: center;
        padding: 4px;
      }
      .coach-name {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 4px;
        text-align: center;
      }
      .coach-specialty {
        font-size: 13px;
        color: #00ddb4;
        text-align: center;
        margin-bottom: 8px;
        font-weight: 600;
      }
      .coach-meta {
        display: flex;
        justify-content: center;
        gap: 16px;
        font-size: 12px;
        color: rgba(180, 200, 240, 0.7);
        margin-bottom: 12px;
      }
      .coach-rating {
        color: #ffb347;
      }
      .coach-intro {
        font-size: 13px;
        color: rgba(180, 200, 240, 0.8);
        line-height: 1.6;
        margin-bottom: 16px;
        text-align: center;
      }
      .coach-select-btn {
        width: 100%;
        padding: 12px 24px;
        border-radius: 12px;
        background: linear-gradient(135deg, #00b87a, #00ddb4);
        color: #040e1c;
        font-family: 'Outfit', sans-serif;
        font-size: 14px;
        font-weight: 700;
        border: none;
        cursor: pointer;
        transition: transform 0.2s;
      }
      .coach-select-btn:hover {
        transform: translateY(-2px);
      }
      .coach-card.selected .coach-select-btn {
        background: rgba(0, 184, 122, 0.3);
        color: #00b87a;
        cursor: default;
      }
      .coach-success-msg {
        padding: 16px;
        background: rgba(0, 184, 122, 0.15);
        border: 1px solid rgba(0, 184, 122, 0.3);
        border-radius: 12px;
        color: #00b87a;
        font-weight: 600;
        margin-bottom: 20px;
        text-align: center;
        transition: opacity 0.3s;
      }
      .coach-loading, .coach-empty {
        text-align: center;
        padding: 40px;
        color: rgba(180, 200, 240, 0.7);
      }
    `;

    document.head.appendChild(style);
  };

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoachCarousel;
  }

  if (typeof global !== 'undefined') {
    global.CoachCarousel = CoachCarousel;
  }
})(typeof window !== 'undefined' ? window : this);
