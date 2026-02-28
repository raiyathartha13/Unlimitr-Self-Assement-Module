/**
 * No-Cost EMI Calculator Component
 * Calculates and displays EMI options for each plan
 * 
 * Features:
 * - EMI breakdown for 3, 6, 12 month plans
 * - Razorpay integration flag
 * - Toggle between full payment and EMI
 */

(function(global) {
  'use strict';

  /**
   * EMICalculator Manager
   */
  function EMICalculator(containerId, planData) {
    this.container = document.getElementById(containerId);
    this.planData = planData || this.getDefaultPlan();
    this.paymentMode = 'full'; // 'full' or 'emi'
  }

  /**
   * Initialize calculator
   */
  EMICalculator.prototype.init = function() {
    if (!this.container) {
      console.warn('EMICalculator: Container not found');
      return;
    }

    this.injectStyles();
    this.render();
    this.attachListeners();
  };

  /**
   * Get default plan data
   */
  EMICalculator.prototype.getDefaultPlan = function() {
    try {
      const stored = localStorage.getItem('recommendedPlan');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return {
      duration: 12,
      price: 19999,
      name: 'Structured Correction Plan'
    };
  };

  /**
   * Calculate EMI
   */
  EMICalculator.prototype.calculateEMI = function(price, months) {
    // No-cost EMI: price divided by months (no interest)
    return Math.round(price / months);
  };

  /**
   * Render calculator
   */
  EMICalculator.prototype.render = function() {
    const emiAmount = this.calculateEMI(this.planData.price, this.planData.duration);
    
    const html = `
      <div class="emi-calculator">
        <div class="emi-toggle-group">
          <button class="emi-toggle-btn ${this.paymentMode === 'full' ? 'active' : ''}" data-mode="full">
            Pay in Full
          </button>
          <button class="emi-toggle-btn ${this.paymentMode === 'emi' ? 'active' : ''}" data-mode="emi">
            Pay via EMI
          </button>
        </div>
        
        <div class="emi-display" id="emiDisplay">
          ${this.paymentMode === 'full' 
            ? this.renderFullPayment()
            : this.renderEMIBreakdown(emiAmount)
          }
        </div>
        
        <div class="emi-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
          <span>No Cost EMI available. No interest or hidden charges.</span>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  };

  /**
   * Render full payment view
   */
  EMICalculator.prototype.renderFullPayment = function() {
    return `
      <div class="payment-summary">
        <div class="payment-row">
          <span class="payment-label">Total Amount</span>
          <span class="payment-amount">₹${this.planData.price.toLocaleString('en-IN')}</span>
        </div>
        <div class="payment-row highlight">
          <span class="payment-label">You Pay Today</span>
          <span class="payment-amount large">₹${this.planData.price.toLocaleString('en-IN')}</span>
        </div>
      </div>
    `;
  };

  /**
   * Render EMI breakdown
   */
  EMICalculator.prototype.renderEMIBreakdown = function(emiAmount) {
    const months = this.planData.duration;
    
    return `
      <div class="emi-breakdown">
        <div class="emi-summary">
          <div class="emi-monthly">
            <span class="emi-label">Monthly Payment</span>
            <span class="emi-amount">₹${emiAmount.toLocaleString('en-IN')}/month</span>
          </div>
          <div class="emi-total">
            <span class="emi-label">Total Amount</span>
            <span class="emi-total-amount">₹${this.planData.price.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div class="emi-schedule">
          <div class="emi-schedule-title">Payment Schedule</div>
          <div class="emi-schedule-list">
            ${Array.from({ length: months }, (_, i) => `
              <div class="emi-schedule-item">
                <span class="schedule-month">Month ${i + 1}</span>
                <span class="schedule-amount">₹${emiAmount.toLocaleString('en-IN')}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  };

  /**
   * Attach event listeners
   */
  EMICalculator.prototype.attachListeners = function() {
    const toggles = this.container.querySelectorAll('.emi-toggle-btn');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const mode = toggle.dataset.mode;
        this.setPaymentMode(mode);
      });
    });
  };

  /**
   * Set payment mode
   */
  EMICalculator.prototype.setPaymentMode = function(mode) {
    this.paymentMode = mode;
    
    // Update toggle buttons
    this.container.querySelectorAll('.emi-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Re-render display
    const display = document.getElementById('emiDisplay');
    if (display) {
      const emiAmount = this.calculateEMI(this.planData.price, this.planData.duration);
      display.innerHTML = mode === 'full' 
        ? this.renderFullPayment()
        : this.renderEMIBreakdown(emiAmount);
    }
    
    // Store preference
    localStorage.setItem('paymentMode', mode);
    
    // Trigger custom event
    const event = new CustomEvent('paymentModeChanged', { detail: { mode, planData: this.planData } });
    document.dispatchEvent(event);
  };

  /**
   * Get current payment mode
   */
  EMICalculator.prototype.getPaymentMode = function() {
    return this.paymentMode;
  };

  /**
   * Get payment amount (full or first EMI)
   */
  EMICalculator.prototype.getPaymentAmount = function() {
    if (this.paymentMode === 'full') {
      return this.planData.price;
    } else {
      return this.calculateEMI(this.planData.price, this.planData.duration);
    }
  };

  /**
   * Inject CSS styles
   */
  EMICalculator.prototype.injectStyles = function() {
    if (document.getElementById('emi-calculator-styles')) return;

    const style = document.createElement('style');
    style.id = 'emi-calculator-styles';
    style.textContent = `
      .emi-calculator {
        background: rgba(10, 20, 45, 0.6);
        border: 1px solid rgba(0, 212, 255, 0.15);
        border-radius: 18px;
        padding: 24px;
        margin: 20px 0;
      }
      .emi-toggle-group {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
      }
      .emi-toggle-btn {
        flex: 1;
        padding: 12px 24px;
        border-radius: 12px;
        background: rgba(10, 20, 45, 0.8);
        border: 1.5px solid rgba(0, 212, 255, 0.2);
        color: rgba(180, 200, 240, 0.8);
        font-family: 'Outfit', sans-serif;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .emi-toggle-btn:hover {
        border-color: rgba(0, 212, 255, 0.4);
        background: rgba(0, 212, 255, 0.05);
      }
      .emi-toggle-btn.active {
        background: linear-gradient(135deg, #00b87a, #00ddb4);
        border-color: transparent;
        color: #040e1c;
        font-weight: 700;
      }
      .payment-summary {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .payment-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid rgba(0, 212, 255, 0.1);
      }
      .payment-row:last-child {
        border-bottom: none;
      }
      .payment-row.highlight {
        padding-top: 16px;
        border-top: 2px solid rgba(0, 212, 255, 0.2);
      }
      .payment-label {
        font-size: 14px;
        color: rgba(180, 200, 240, 0.7);
      }
      .payment-amount {
        font-size: 18px;
        font-weight: 700;
        color: var(--text, #e2f0ff);
      }
      .payment-amount.large {
        font-size: 24px;
        background: linear-gradient(135deg, #00ddb4, #00b8ff);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .emi-breakdown {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .emi-summary {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        padding: 16px;
        background: rgba(0, 212, 255, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(0, 212, 255, 0.1);
      }
      .emi-monthly, .emi-total {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .emi-label {
        font-size: 12px;
        color: rgba(180, 200, 240, 0.6);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .emi-amount {
        font-size: 20px;
        font-weight: 800;
        color: #00ddb4;
      }
      .emi-total-amount {
        font-size: 18px;
        font-weight: 700;
        color: var(--text, #e2f0ff);
      }
      .emi-schedule {
        margin-top: 8px;
      }
      .emi-schedule-title {
        font-size: 13px;
        font-weight: 600;
        color: rgba(180, 200, 240, 0.8);
        margin-bottom: 12px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .emi-schedule-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 8px;
        max-height: 200px;
        overflow-y: auto;
      }
      .emi-schedule-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: rgba(10, 20, 45, 0.6);
        border-radius: 8px;
        border: 1px solid rgba(0, 212, 255, 0.1);
        font-size: 12px;
      }
      .schedule-month {
        color: rgba(180, 200, 240, 0.7);
      }
      .schedule-amount {
        font-weight: 600;
        color: var(--text, #e2f0ff);
      }
      .emi-note {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 16px;
        padding: 12px;
        background: rgba(0, 184, 122, 0.08);
        border: 1px solid rgba(0, 184, 122, 0.15);
        border-radius: 10px;
        font-size: 12px;
        color: #00b87a;
      }
      .emi-note svg {
        stroke: #00b87a;
        flex-shrink: 0;
      }
    `;

    document.head.appendChild(style);
  };

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EMICalculator;
  }

  if (typeof global !== 'undefined') {
    global.EMICalculator = EMICalculator;
  }
})(typeof window !== 'undefined' ? window : this);
