/**
 * Price Lock Mechanism — FOMO + Commitment Layer
 * Allows users to lock transformation price for 7 days
 * 
 * Features:
 * - ₹999 refundable lock payment
 * - 7-day countdown timer
 * - Free Counsellor + Coach session included
 * - Adjustable against full payment
 */

(function(global) {
  'use strict';

  const LOCK_PRICE = 999; // ₹999 refundable
  const LOCK_DURATION_DAYS = 7;
  const API_ENDPOINT = '/api/lock-price'; // Backend endpoint

  /**
   * PriceLock Manager
   */
  function PriceLockManager() {
    this.lockExpiry = null;
    this.countdownInterval = null;
  }

  /**
   * Initialize price lock UI
   */
  PriceLockManager.prototype.init = function() {
    this.createLockUI();
    this.loadExistingLock();
    this.attachEventListeners();
  };

  /**
   * Create price lock UI element
   */
  PriceLockManager.prototype.createLockUI = function() {
    const lockHTML = `
      <div id="priceLockCard" class="price-lock-card glass" style="display:none;">
        <div class="lock-header">
          <div class="lock-badge">🔒 Price Lock Available</div>
          <div class="lock-countdown" id="lockCountdown">—</div>
        </div>
        <div class="lock-content">
          <h3 class="lock-title">Lock Your Transformation Price</h3>
          <p class="lock-desc">Pay ₹${LOCK_PRICE.toLocaleString('en-IN')} refundable to freeze your plan price for ${LOCK_DURATION_DAYS} days.</p>
          <div class="lock-benefits">
            <div class="lock-benefit-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Price frozen for ${LOCK_DURATION_DAYS} days</span>
            </div>
            <div class="lock-benefit-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Free Counsellor Session</span>
            </div>
            <div class="lock-benefit-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Free Coach Session</span>
            </div>
            <div class="lock-benefit-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Fully adjustable against full payment</span>
            </div>
          </div>
          <button class="lock-btn" id="lockPriceBtn">
            Lock My Price — ₹${LOCK_PRICE.toLocaleString('en-IN')}
          </button>
          <p class="lock-note">Refundable if you change your mind</p>
        </div>
      </div>
    `;

    // Inject styles
    this.injectStyles();

    // Find insertion point (before CTA section or at end of page)
    const ctaSection = document.querySelector('.cta-section, .final-cta-section');
    if (ctaSection) {
      ctaSection.insertAdjacentHTML('beforebegin', lockHTML);
    } else {
      document.body.insertAdjacentHTML('beforeend', lockHTML);
    }
  };

  /**
   * Inject CSS styles for price lock
   */
  PriceLockManager.prototype.injectStyles = function() {
    const style = document.createElement('style');
    style.id = 'price-lock-styles';
    style.textContent = `
      .price-lock-card {
        margin: 24px 0;
        padding: 32px;
        border: 2px solid rgba(0, 221, 180, 0.25);
        background: linear-gradient(155deg, rgba(0, 35, 65, 0.9), rgba(5, 15, 40, 0.95));
        position: relative;
        overflow: hidden;
      }
      .price-lock-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 8%;
        right: 8%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(0, 221, 180, 0.5), transparent);
      }
      .lock-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 12px;
      }
      .lock-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        padding: 6px 16px;
        border-radius: 999px;
        background: rgba(0, 184, 122, 0.15);
        color: #00b87a;
        border: 1px solid rgba(0, 184, 122, 0.25);
      }
      .lock-countdown {
        font-size: 14px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        color: #ffb347;
        letter-spacing: 0.05em;
      }
      .lock-title {
        font-size: 22px;
        font-weight: 800;
        margin-bottom: 12px;
        line-height: 1.2;
      }
      .lock-desc {
        font-size: 14px;
        color: rgba(180, 200, 240, 0.7);
        line-height: 1.6;
        margin-bottom: 20px;
      }
      .lock-benefits {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 24px;
      }
      .lock-benefit-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13.5px;
        color: rgba(226, 240, 255, 0.9);
      }
      .lock-benefit-item svg {
        stroke: #00b87a;
        flex-shrink: 0;
      }
      .lock-btn {
        width: 100%;
        padding: 16px 32px;
        border-radius: 14px;
        background: linear-gradient(135deg, #00b87a, #00ddb4);
        color: #040e1c;
        font-family: 'Outfit', sans-serif;
        font-size: 16px;
        font-weight: 800;
        border: none;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 8px 32px rgba(0, 221, 180, 0.35);
        letter-spacing: 0.01em;
      }
      .lock-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(0, 221, 180, 0.5);
      }
      .lock-note {
        font-size: 12px;
        color: rgba(160, 200, 240, 0.5);
        text-align: center;
        margin-top: 12px;
      }
    `;
    
    if (!document.getElementById('price-lock-styles')) {
      document.head.appendChild(style);
    }
  };

  /**
   * Load existing lock from localStorage/API
   */
  PriceLockManager.prototype.loadExistingLock = function() {
    try {
      const stored = localStorage.getItem('priceLock');
      if (stored) {
        const lockData = JSON.parse(stored);
        this.lockExpiry = new Date(lockData.expiry);
        
        if (this.lockExpiry > new Date()) {
          this.showLockCard(true);
          this.startCountdown();
        } else {
          localStorage.removeItem('priceLock');
        }
      }
    } catch (e) {
      console.warn('Failed to load price lock:', e);
    }
  };

  /**
   * Show/hide lock card
   */
  PriceLockManager.prototype.showLockCard = function(locked) {
    const card = document.getElementById('priceLockCard');
    if (card) {
      card.style.display = locked ? 'block' : 'none';
      if (locked) {
        const btn = document.getElementById('lockPriceBtn');
        if (btn) {
          btn.textContent = 'Price Locked ✓';
          btn.disabled = true;
          btn.style.opacity = '0.7';
        }
      }
    }
  };

  /**
   * Start countdown timer
   */
  PriceLockManager.prototype.startCountdown = function() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    const updateCountdown = () => {
      if (!this.lockExpiry) return;

      const now = new Date();
      const diff = this.lockExpiry - now;

      if (diff <= 0) {
        clearInterval(this.countdownInterval);
        this.lockExpiry = null;
        localStorage.removeItem('priceLock');
        this.showLockCard(false);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const countdownEl = document.getElementById('lockCountdown');
      if (countdownEl) {
        countdownEl.textContent = `Expires in: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
    };

    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 1000);
  };

  /**
   * Attach event listeners
   */
  PriceLockManager.prototype.attachEventListeners = function() {
    const btn = document.getElementById('lockPriceBtn');
    if (btn) {
      btn.addEventListener('click', () => this.handleLockPrice());
    }
  };

  /**
   * Handle price lock payment
   */
  PriceLockManager.prototype.handleLockPrice = function() {
    // Get current plan data
    const planData = this.getCurrentPlanData();
    
    // Initialize Razorpay
    if (typeof Razorpay === 'undefined') {
      this.loadRazorpayScript(() => this.openLockCheckout(planData));
    } else {
      this.openLockCheckout(planData);
    }
  };

  /**
   * Get current plan data from page/localStorage
   */
  PriceLockManager.prototype.getCurrentPlanData = function() {
    try {
      const stored = localStorage.getItem('recommendedPlan');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    
    // Fallback: extract from page
    return {
      duration: 12,
      price: 19999,
      name: 'Structured Correction Plan'
    };
  };

  /**
   * Open Razorpay checkout for lock payment
   */
  PriceLockManager.prototype.openLockCheckout = function(planData) {
    const options = {
      key: 'YOUR_RAZORPAY_KEY', // Replace with actual key
      amount: LOCK_PRICE * 100,
      currency: 'INR',
      name: 'Unlimitr',
      description: `Price Lock: ${planData.name || 'Transformation Plan'}`,
      handler: (response) => {
        this.saveLock(response, planData);
      },
      theme: {
        color: '#00ddb4'
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (response) => {
      console.error('Lock payment failed:', response);
      alert('Payment failed. Please try again.');
    });
    rzp.open();
  };

  /**
   * Save lock data after successful payment
   */
  PriceLockManager.prototype.saveLock = function(paymentResponse, planData) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + LOCK_DURATION_DAYS);

    const lockData = {
      paymentId: paymentResponse.razorpay_payment_id,
      planData: planData,
      expiry: expiry.toISOString(),
      timestamp: new Date().toISOString()
    };

    // Save locally
    localStorage.setItem('priceLock', JSON.stringify(lockData));
    this.lockExpiry = expiry;

    // Send to backend
    this.sendLockToBackend(lockData);

    // Update UI
    this.showLockCard(true);
    this.startCountdown();
  };

  /**
   * Send lock data to backend API
   */
  PriceLockManager.prototype.sendLockToBackend = function(lockData) {
    // Get user ID from localStorage or session
    const userId = localStorage.getItem('userId') || 'anonymous';
    
    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        plan_selected: lockData.planData,
        payment_id: lockData.paymentId,
        timestamp: lockData.timestamp,
        lock_expiry: lockData.expiry,
        status: 'active'
      })
    }).catch(err => {
      console.warn('Failed to send lock to backend:', err);
      // Non-critical, continue with local storage
    });
  };

  /**
   * Load Razorpay script
   */
  PriceLockManager.prototype.loadRazorpayScript = function(callback) {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = callback;
    document.head.appendChild(script);
  };

  // Auto-initialize on DOM ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const manager = new PriceLockManager();
        manager.init();
        global.PriceLockManager = PriceLockManager;
      });
    } else {
      const manager = new PriceLockManager();
      manager.init();
      global.PriceLockManager = PriceLockManager;
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PriceLockManager;
  }
})(typeof window !== 'undefined' ? window : this);
