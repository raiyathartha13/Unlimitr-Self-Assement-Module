/**
 * Solution Page — Dynamic Injection Layer
 * Production-grade solution page with Razorpay integration
 * Loads user recommendation from HealthEngine and renders complete solution experience
 */

(function() {
  'use strict';

  // =============================
  // DATA LOADING
  // =============================

  function loadUserData() {
    var data = null;
    try {
      var raw = localStorage.getItem("assessmentData") || 
                sessionStorage.getItem("assessmentData") ||
                localStorage.getItem("ai_health_assessment_v2") ||
                sessionStorage.getItem("ai_health_assessment_v2");
      if (raw) data = JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to load assessment data:", e);
    }
    return data;
  }

  function loadHealthIntelligence() {
    var intelligence = null;
    
    // Try to get from window (if dashboard was loaded)
    if (typeof window !== "undefined" && window.currentHealthIntelligence) {
      intelligence = window.currentHealthIntelligence;
    }
    
    // Try to compute from user data
    if (!intelligence) {
      var data = loadUserData();
      if (data && typeof window.HealthEngine !== "undefined") {
        try {
          var engine = new window.HealthEngine(data);
          intelligence = engine.computeAll();
          intelligence.user = data;
        } catch (e) {
          console.warn("HealthEngine computation failed:", e);
        }
      }
    }
    
    // Fallback
    if (!intelligence) {
      intelligence = {
        totalScore: 62,
        zone: "Adaptive Strain",
        dimensions: {
          metabolic: 68,
          recovery: 54,
          hormonal: 61,
          behavioral: 47,
          readiness: 72
        },
        correctionWindowWeeks: 12,
        dropoutRiskWeeks: [3, 4],
        planRecommendation: {
          duration: 3,
          intensity: "Guided Correction",
          type: "total_wellness",
          focusAreas: ["metabolic", "recovery"]
        },
        user: loadUserData() || {}
      };
    }
    
    return intelligence;
  }

  function getRecommendedPlan(intelligence) {
    var planRec = intelligence.planRecommendation || {};
    var planType = planRec.type || "total_wellness";
    
    // Plan catalog (matches engine.js)
    var PLAN_CATALOG = {
      total_wellness: {
        title: "Fitstart Total Wellness Plan",
        focus: "Full-body reset with holistic fat-loss support.",
        bullets: [
          "Metabolic reset + sustainable fat loss",
          "Balanced nutrition + stress recovery",
          "Weekly coach + AI check-ins",
          "Diet personalization",
          "AI nudges",
          "WhatsApp accountability"
        ]
      },
      sugar_shield: {
        title: "Fitstart Sugar Shield",
        focus: "Blood sugar control + insulin sensitivity.",
        bullets: [
          "Glycemic control nutrition plan",
          "Low-spike meal timing protocol",
          "Energy + cravings stabilization"
        ]
      },
      thyro_care: {
        title: "Fitstart Thyro Care",
        focus: "Thyroid-supportive nutrition + recovery.",
        bullets: [
          "Thyroid-friendly meal planning",
          "Sleep and stress modulation",
          "Gentle movement routines"
        ]
      },
      hormo_balance: {
        title: "Fitstart Hormo Balance",
        focus: "Hormone balance with cycle-aware coaching.",
        bullets: [
          "PCOS/period support protocols",
          "Inflammation-lowering diet",
          "Energy + mood stabilization"
        ]
      },
      medical_supervised: {
        title: "Medical Supervised Plan",
        focus: "Supervised fat loss with medical-grade safety and monitoring.",
        bullets: [
          "Weekly roadmap with medical oversight",
          "Diet personalization for your conditions",
          "AI nudges + WhatsApp accountability",
          "Monthly coach call"
        ]
      }
    };
    
    var plan = PLAN_CATALOG[planType] || PLAN_CATALOG.total_wellness;
    
    // Calculate pricing based on duration
    var duration = planRec.duration || 3;
    var basePrice = duration === 3 ? 6999 : duration === 6 ? 12999 : 19999;
    var originalPrice = basePrice * 1.5;
    
    return {
      name: plan.title,
      objective: plan.focus,
      bullets: plan.bullets,
      duration: duration,
      durationWeeks: duration * 4,
      price: basePrice,
      originalPrice: Math.round(originalPrice),
      dailyPrice: Math.round(basePrice / (duration * 30)),
      dietSessions: duration === 3 ? 12 : duration === 6 ? 24 : 36,
      fitnessSessions: duration === 3 ? 12 : duration === 6 ? 24 : 36,
      isMedical: planType === "medical_supervised"
    };
  }

  // =============================
  // RENDERING FUNCTIONS
  // =============================

  function renderHealthScore(score) {
    var scoreCircle = document.getElementById("scoreCircle");
    var scoreValue = document.getElementById("scoreValue");
    
    if (scoreCircle && scoreValue) {
      var circumference = 2 * Math.PI * 85;
      var offset = circumference - (score / 100) * circumference;
      
      scoreCircle.style.strokeDashoffset = circumference;
      setTimeout(function() {
        scoreCircle.style.strokeDashoffset = offset;
      }, 100);
      
      scoreValue.textContent = score;
    }
  }

  function renderScoreProjection(currentScore, targetScore) {
    var projectionEl = document.getElementById("scoreProjection");
    if (projectionEl) {
      projectionEl.textContent = currentScore + " → " + targetScore;
    }
  }

  function renderRecommendedPlan(plan) {
    var container = document.getElementById("recommendedPlanCard");
    if (!container) return;
    
    container.innerHTML = `
      <div class="recommended-plan">
        <h3>${plan.name}</h3>
        <p>${plan.objective}</p>
        <ul>
          <li>${plan.dietSessions} Dietitian Sessions</li>
          <li>${plan.fitnessSessions} Fitness/Yoga Sessions</li>
          <li>AI Health App Access</li>
          <li>24/7 Support</li>
          ${plan.bullets.map(function(bullet) {
            return '<li>' + bullet + '</li>';
          }).join('')}
        </ul>
      </div>
    `;
  }

  function renderFeatureGrid() {
    var container = document.getElementById("featureGrid");
    if (!container) return;
    
    var features = [
      {
        title: "Personalized Nutrition",
        description: "Macro-optimized meal plans aligned with your metabolic profile and health conditions."
      },
      {
        title: "AI-Powered Coaching",
        description: "Daily nudges, habit tracking, and adaptive recommendations based on your progress."
      },
      {
        title: "Medical Oversight",
        description: "Structured monitoring with condition-specific protocols for safe, sustainable transformation."
      },
      {
        title: "Behavioral Accountability",
        description: "WhatsApp support, weekly check-ins, and structured milestones to prevent dropout."
      },
      {
        title: "Recovery Optimization",
        description: "Sleep, stress, and recovery protocols to enhance metabolic efficiency."
      },
      {
        title: "Long-term Sustainability",
        description: "Habit-based approach designed for permanent lifestyle transformation."
      }
    ];
    
    container.innerHTML = features.map(function(feature) {
      return `
        <div class="feature-card">
          <h3>${feature.title}</h3>
          <p>${feature.description}</p>
        </div>
      `;
    }).join('');
  }

  function renderTrajectoryChart(intelligence) {
    var canvas = document.getElementById("trajectoryChart");
    if (!canvas) return;
    
    var ctx = canvas.getContext("2d");
    var width = canvas.offsetWidth;
    var height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    
    var padding = 40;
    var chartWidth = width - (padding * 2);
    var chartHeight = height - (padding * 2);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw axes
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = "#6B7280";
    ctx.font = "12px Inter";
    ctx.fillText("Weeks", width / 2 - 30, height - 10);
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Health Score", 0, 0);
    ctx.restore();
    
    // Draw without intervention path (red dashed)
    ctx.strokeStyle = "#D93025";
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    var currentScore = intelligence.totalScore;
    var weeks = intelligence.correctionWindowWeeks || 12;
    
    for (var i = 0; i <= weeks; i++) {
      var x = padding + (i / weeks) * chartWidth;
      var decline = currentScore - (i * 2); // Decline over time
      var y = height - padding - (decline / 100) * chartHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Draw with intervention path (green smooth)
    ctx.strokeStyle = "#0F9D58";
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    ctx.beginPath();
    
    for (var i = 0; i <= weeks; i++) {
      var x = padding + (i / weeks) * chartWidth;
      var improvement = currentScore + (i * (75 - currentScore) / weeks);
      var oscillation = Math.sin(i * 0.5) * 2; // Micro oscillation
      var y = height - padding - ((improvement + oscillation) / 100) * chartHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Draw markers
    ctx.fillStyle = "#0F9D58";
    ctx.beginPath();
    ctx.arc(padding + chartWidth, padding + (0.25 * chartHeight), 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#D93025";
    ctx.beginPath();
    ctx.arc(padding + chartWidth, padding + (0.75 * chartHeight), 6, 0, Math.PI * 2);
    ctx.fill();
  }

  function renderPricing(plan) {
    var dailyCostEl = document.getElementById("dailyCost");
    var finalPriceEl = document.getElementById("finalPrice");
    
    if (dailyCostEl) dailyCostEl.textContent = plan.dailyPrice;
    if (finalPriceEl) {
      finalPriceEl.textContent = "₹ " + plan.price.toLocaleString("en-IN");
      var strikeEl = finalPriceEl.previousElementSibling;
      if (strikeEl && strikeEl.classList.contains("strike")) {
        strikeEl.textContent = "₹ " + plan.originalPrice.toLocaleString("en-IN");
      }
    }
  }

  function renderPlanOptions(intelligence, currentPlan) {
    var container = document.getElementById("planOptionsContainer");
    if (!container) return;
    
    var options = [
      { duration: 3, label: "3 Months", price: 6999, originalPrice: 10499 },
      { duration: 6, label: "6 Months", price: 12999, originalPrice: 19499, popular: true },
      { duration: 12, label: "12 Months", price: 19999, originalPrice: 29999 }
    ];
    
    container.innerHTML = options.map(function(option) {
      var isSelected = option.duration === currentPlan.duration;
      return `
        <div class="plan-option-card ${isSelected ? 'selected' : ''}" data-duration="${option.duration}" data-price="${option.price}">
          ${option.popular ? '<div style="position: absolute; top: -12px; right: 20px; background: var(--primary); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">POPULAR</div>' : ''}
          <h3>${option.label}</h3>
          <div class="duration">${option.duration * 4} weeks of structured correction</div>
          <div class="price">₹ ${option.price.toLocaleString("en-IN")}</div>
          <ul class="features">
            <li>${option.duration * 4} Dietitian Sessions</li>
            <li>${option.duration * 4} Fitness Sessions</li>
            <li>AI App Access</li>
            <li>24/7 Support</li>
          </ul>
        </div>
      `;
    }).join('');
    
    // Add click handlers
    var cards = container.querySelectorAll(".plan-option-card");
    cards.forEach(function(card) {
      card.addEventListener("click", function() {
        cards.forEach(function(c) { c.classList.remove("selected"); });
        card.classList.add("selected");
        
        var duration = parseInt(card.dataset.duration);
        var price = parseInt(card.dataset.price);
        var dailyPrice = Math.round(price / (duration * 30));
        var originalPrice = Math.round(price * 1.5);
        
        document.getElementById("dailyCost").textContent = dailyPrice;
        document.getElementById("finalPrice").textContent = "₹ " + price.toLocaleString("en-IN");
        var strikeEl = document.getElementById("finalPrice").previousElementSibling;
        if (strikeEl && strikeEl.classList.contains("strike")) {
          strikeEl.textContent = "₹ " + originalPrice.toLocaleString("en-IN");
        }
        
        // Update current plan
        currentPlan.duration = duration;
        currentPlan.price = price;
        currentPlan.dailyPrice = dailyPrice;
        currentPlan.originalPrice = originalPrice;
      });
    });
  }

  function renderTestimonials() {
    var container = document.getElementById("testimonialBlock");
    if (!container) return;
    
    var testimonials = [
      {
        quote: "The structured approach helped me reverse my metabolic strain. Lost 12kg in 3 months with sustainable habits.",
        author: "Priya S., 34",
        outcome: "12kg loss • Metabolic score: 45 → 78"
      },
      {
        quote: "Medical oversight gave me confidence. My thyroid levels stabilized while losing weight safely.",
        author: "Rajesh K., 42",
        outcome: "8kg loss • TSH normalized • Energy restored"
      },
      {
        quote: "The behavioral accountability prevented my usual dropout. This time I completed the full program.",
        author: "Anita M., 29",
        outcome: "15kg loss • Consistency: 95% adherence"
      }
    ];
    
    container.innerHTML = testimonials.map(function(testimonial) {
      return `
        <div class="testimonial-card">
          <div class="quote">"${testimonial.quote}"</div>
          <div class="author">— ${testimonial.author}</div>
          <div class="outcome">${testimonial.outcome}</div>
        </div>
      `;
    }).join('');
  }

  // =============================
  // RAZORPAY INTEGRATION
  // =============================

  function initializeRazorpay(plan) {
    var checkoutBtn = document.getElementById("checkoutBtn");
    var finalCtaBtn = document.getElementById("finalCtaBtn");
    
    function openCheckout() {
      // Replace with your actual Razorpay key
      var RAZORPAY_KEY = "YOUR_RAZORPAY_KEY_ID";
      
      if (RAZORPAY_KEY === "YOUR_RAZORPAY_KEY_ID") {
        alert("Razorpay key not configured. Please set RAZORPAY_KEY in solution.js");
        return;
      }
      
      var options = {
        key: RAZORPAY_KEY,
        amount: plan.price * 100, // Amount in paise
        currency: "INR",
        name: "Unlimitr",
        description: plan.name + " (" + plan.duration + " months)",
        image: "https://unlimitr.com/img/hca_logo.svg",
        handler: function(response) {
          // Payment success
          console.log("Payment successful:", response);
          window.location.href = "/payment-success.html?payment_id=" + response.razorpay_payment_id;
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        notes: {
          plan_name: plan.name,
          duration: plan.duration,
          health_score: window.currentHealthIntelligence ? window.currentHealthIntelligence.totalScore : null
        },
        theme: {
          color: "#0f5132"
        }
      };
      
      var rzp = new Razorpay(options);
      rzp.on("payment.failed", function(response) {
        console.error("Payment failed:", response);
        alert("Payment failed. Please try again.");
      });
      rzp.open();
    }
    
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", openCheckout);
    }
    
    if (finalCtaBtn) {
      finalCtaBtn.addEventListener("click", openCheckout);
    }
  }

  // =============================
  // DOWNLOAD REPORT HANDLER
  // =============================

  function initializeDownloadHandlers() {
    var downloadBtns = document.querySelectorAll("#downloadReportBtn, #finalDownloadBtn");
    
    downloadBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        var intelligence = loadHealthIntelligence();
        
        // Try jsPDF if available
        if (typeof window.jspdf !== "undefined") {
          var doc = new window.jspdf.jsPDF();
          doc.setFont("helvetica");
          doc.setFontSize(20);
          doc.text("Health Intelligence Report", 20, 24);
          doc.setFontSize(11);
          doc.text("Total Score: " + intelligence.totalScore + "/100", 20, 36);
          doc.text("Zone: " + intelligence.zone, 20, 46);
          doc.text("Correction Window: " + intelligence.correctionWindowWeeks + " weeks", 20, 56);
          doc.setFontSize(9);
          doc.text("Generated by Unlimitr AI Health Intelligence", 20, 280);
          doc.save("Unlimitr_Health_Report.pdf");
        } else {
          // Fallback to print
          window.print();
        }
      });
    });
  }

  // =============================
  // INITIALIZATION
  // =============================

  function init() {
    // Load data
    var intelligence = loadHealthIntelligence();
    var plan = getRecommendedPlan(intelligence);
    
    // Store globally for reference
    if (typeof window !== "undefined") {
      window.currentHealthIntelligence = intelligence;
      window.currentPlan = plan;
    }
    
    // Render components
    renderHealthScore(intelligence.totalScore);
    renderScoreProjection(intelligence.totalScore, Math.min(75, intelligence.totalScore + 30));
    renderRecommendedPlan(plan);
    renderFeatureGrid();
    renderTrajectoryChart(intelligence);
    renderPricing(plan);
    renderPlanOptions(intelligence, plan);
    renderTestimonials();
    
    // Initialize interactions
    initializeRazorpay(plan);
    initializeDownloadHandlers();
    
    // Handle activate plan button
    var activateBtn = document.getElementById("activatePlanBtn");
    if (activateBtn) {
      activateBtn.addEventListener("click", function() {
        document.getElementById("checkoutBtn").scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
    
    // Resize handler for chart
    window.addEventListener("resize", function() {
      renderTrajectoryChart(intelligence);
    });
  }

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
