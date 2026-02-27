/**
 * UNLIMITR Solution Page — Premium Health-Tech Interactions
 * Series B-level digital therapeutic platform
 */

(function() {
  'use strict';

  // Register GSAP plugins
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

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
    
    if (typeof window !== "undefined" && window.currentHealthIntelligence) {
      intelligence = window.currentHealthIntelligence;
    }
    
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
    var duration = planRec.duration || 3;
    
    var PLAN_CATALOG = {
      total_wellness: {
        title: "Fitstart Total Wellness Plan",
        focus: "Full-body reset with holistic fat-loss support.",
        features: [
          {
            title: "24 Personalized Dietitian Sessions",
            description: "Structured metabolic nutrition correction tailored to biomarkers.",
            icon: "👨‍⚕️"
          },
          {
            title: "24 Fitness/Yoga Sessions",
            description: "Movement protocols designed for metabolic efficiency.",
            icon: "🧘"
          },
          {
            title: "Clinical Progress Monitoring System",
            description: "Biomarker tracking and adaptive protocol adjustments.",
            icon: "📊"
          },
          {
            title: "24/7 Clinical Support",
            description: "Continuous guidance for behavioral consistency.",
            icon: "💬"
          }
        ]
      },
      medical_supervised: {
        title: "Medical Supervised Plan",
        focus: "Supervised fat loss with medical-grade safety and monitoring.",
        features: [
          {
            title: "48 Medical Review Sessions",
            description: "Structured monitoring with condition-specific protocols.",
            icon: "🏥"
          },
          {
            title: "Clinical Progress Monitoring System",
            description: "Biomarker tracking and adaptive protocol adjustments.",
            icon: "📊"
          },
          {
            title: "24/7 Clinical Support",
            description: "Continuous guidance for behavioral consistency.",
            icon: "💬"
          }
        ]
      }
    };
    
    var plan = PLAN_CATALOG[planType] || PLAN_CATALOG.total_wellness;
    
    // Calculate pricing
    var pricing = {
      3: { price: 6999, original: 10499, daily: 78 },
      6: { price: 12999, original: 19499, daily: 72 },
      12: { price: 19999, original: 29999, daily: 55 }
    };
    
    var priceData = pricing[duration] || pricing[3];
    
    return {
      name: plan.title,
      objective: plan.focus,
      features: plan.features,
      duration: duration,
      price: priceData.price,
      originalPrice: priceData.original,
      dailyPrice: priceData.daily,
      dietSessions: duration === 3 ? 12 : duration === 6 ? 24 : 48,
      fitnessSessions: duration === 3 ? 12 : duration === 6 ? 24 : 48
    };
  }

  // =============================
  // SECTION 1 — SCORE RING ANIMATION
  // =============================

  function animateScoreRing(score) {
    var scoreRing = document.getElementById("scoreRing");
    var scoreValue = document.getElementById("scoreValue");
    
    if (!scoreRing || !scoreValue) return;
    
    var circumference = 2 * Math.PI * 100;
    var offset = circumference - (score / 100) * circumference;
    
    // Animate ring
    if (typeof gsap !== 'undefined') {
      gsap.to(scoreRing, {
        strokeDashoffset: offset,
        duration: 2,
        ease: "power2.out"
      });
      
      // Animate number count
      gsap.to({ value: 0 }, {
        value: score,
        duration: 2,
        ease: "power2.out",
        onUpdate: function() {
          scoreValue.textContent = Math.round(this.targets()[0].value);
        }
      });
    } else {
      // Fallback without GSAP
      scoreRing.style.strokeDashoffset = offset;
      scoreValue.textContent = score;
    }
    
    // Animate projection
    var projection = document.getElementById("scoreProjection");
    if (projection) {
      var targetScore = Math.min(75, score + 30);
      projection.textContent = score + " → " + targetScore;
    }
  }

  // =============================
  // SECTION 2 — TRAJECTORY ANIMATION
  // =============================

  function drawTrajectory(intelligence) {
    var svg = document.getElementById("trajectorySvg");
    if (!svg) return;
    
    var currentScore = intelligence.totalScore || 62;
    var weeks = intelligence.correctionWindowWeeks || 12;
    var width = 640;
    var height = 300;
    var padding = 80;
    var chartWidth = width - (padding * 2);
    var chartHeight = height - (padding * 2);
    
    // Without intervention path (declining)
    var pathWithout = "";
    for (var i = 0; i <= weeks; i++) {
      var x = padding + (i / weeks) * chartWidth;
      var decline = currentScore - (i * 3); // Decline faster
      var y = padding + ((100 - decline) / 100) * chartHeight;
      
      if (i === 0) {
        pathWithout += "M " + x + " " + y;
      } else {
        pathWithout += " L " + x + " " + y;
      }
    }
    
    // With intervention path (improving)
    var pathWith = "";
    for (var i = 0; i <= weeks; i++) {
      var x = padding + (i / weeks) * chartWidth;
      var improvement = currentScore + (i * (75 - currentScore) / weeks);
      var oscillation = Math.sin(i * 0.4) * 1.5; // Subtle biological fluctuation
      var y = padding + ((100 - (improvement + oscillation)) / 100) * chartHeight;
      
      if (i === 0) {
        pathWith += "M " + x + " " + y;
      } else {
        pathWith += " L " + x + " " + y;
      }
    }
    
    var pathWithoutEl = document.getElementById("pathWithout");
    var pathWithEl = document.getElementById("pathWith");
    
    if (pathWithoutEl) pathWithoutEl.setAttribute("d", pathWithout);
    if (pathWithEl) pathWithEl.setAttribute("d", pathWith);
    
    // Animate paths
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(pathWithoutEl, 
        { strokeDashoffset: 1000 },
        { strokeDashoffset: 0, duration: 3, ease: "power2.out" }
      );
      
      gsap.fromTo(pathWithEl,
        { strokeDashoffset: 1000 },
        { strokeDashoffset: 0, duration: 3, delay: 0.5, ease: "power2.out" }
      );
    }
  }

  // =============================
  // SECTION 3 — RECOMMENDED PLAN
  // =============================

  function renderRecommendedPlan(plan) {
    var container = document.getElementById("recommendedPlanCard");
    if (!container) return;
    
    var html = `
      <div class="recommended-plan-header">
        <h3>${plan.name}</h3>
        <p>${plan.objective}</p>
      </div>
      <div class="recommended-plan-features-grid">
    `;
    
    plan.features.forEach(function(feature, index) {
      html += `
        <div class="recommended-plan-feature-card" data-index="${index}">
          <div class="recommended-plan-feature-image">
            <div class="recommended-plan-feature-icon">${feature.icon}</div>
          </div>
          <h4>${feature.title}</h4>
          <p>${feature.description}</p>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Animate cards on scroll
    if (typeof gsap !== 'undefined') {
      gsap.utils.toArray(".recommended-plan-feature-card").forEach(function(card, i) {
        gsap.fromTo(card,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%"
            }
          }
        );
      });
    } else {
      // Fallback: simple reveal
      var cards = container.querySelectorAll(".recommended-plan-feature-card");
      cards.forEach(function(card) {
        card.classList.add("visible");
      });
    }
  }

  // =============================
  // SECTION 4 — VALUE COMPARISON
  // =============================

  function renderValueComparison(plan) {
    var duration = plan.duration || 12;
    
    // Calculate market costs based on duration
    var marketCosts = {
      trainer: duration * 2000,
      dietitian: (duration === 3 ? 12 : duration === 6 ? 24 : 48) * 1500,
      coaching: duration * 1500,
      medical: (duration === 3 ? 1 : duration === 6 ? 2 : 4) * 3000
    };
    
    var totalMarket = marketCosts.trainer + marketCosts.dietitian + marketCosts.coaching + marketCosts.medical;
    var savings = totalMarket - plan.price;
    
    // Animate numbers
    function animateValue(id, target, prefix, suffix) {
      var el = document.getElementById(id);
      if (!el) return;
      
      if (typeof gsap !== 'undefined') {
        gsap.to({ value: 0 }, {
          value: target,
          duration: 2,
          ease: "power2.out",
          onUpdate: function() {
            var val = Math.round(this.targets()[0].value);
            el.textContent = prefix + val.toLocaleString("en-IN") + suffix;
          }
        });
      } else {
        el.textContent = prefix + target.toLocaleString("en-IN") + suffix;
      }
    }
    
    animateValue("trainerCost", marketCosts.trainer, "₹", "");
    animateValue("dietitianCost", marketCosts.dietitian, "₹", "");
    animateValue("coachingCost", marketCosts.coaching, "₹", "");
    animateValue("medicalCost", marketCosts.medical, "₹", "");
    animateValue("totalMarketCost", totalMarket, "₹", "");
    animateValue("unlimitrPrice", plan.price, "₹", "");
    animateValue("totalSavings", savings, "₹", "");
  }

  // =============================
  // SECTION 5 — PLAN COMPARISON
  // =============================

  function renderPlanComparison() {
    var container = document.getElementById("planCardsGrid");
    if (!container) return;
    
    var plans = [
      {
        duration: 3,
        label: "3 Months",
        subtitle: "Initial correction phase",
        price: 6999,
        original: 10499,
        daily: 78,
        savings: 3500,
        sessions: 12
      },
      {
        duration: 6,
        label: "6 Months",
        subtitle: "Stabilization protocol",
        price: 12999,
        original: 19499,
        daily: 72,
        savings: 6500,
        sessions: 24
      },
      {
        duration: 12,
        label: "12 Months",
        subtitle: "Complete metabolic reset",
        price: 19999,
        original: 29999,
        daily: 55,
        savings: 10000,
        sessions: 48,
        featured: true
      }
    ];
    
    container.innerHTML = plans.map(function(plan) {
      var savingsPercent = Math.round((plan.savings / plan.original) * 100);
      return `
        <div class="plan-card ${plan.featured ? 'featured' : ''}" data-duration="${plan.duration}" data-price="${plan.price}">
          ${plan.featured ? '' : '<span class="plan-badge">Save ' + savingsPercent + '%</span>'}
          <div class="plan-duration">${plan.label}</div>
          <div class="plan-subtitle">${plan.subtitle}</div>
          <div class="plan-pricing">
            <div class="plan-original">₹${plan.original.toLocaleString("en-IN")}</div>
            <div class="plan-price">₹${plan.price.toLocaleString("en-IN")}</div>
            <div class="plan-savings">You Save ₹${plan.savings.toLocaleString("en-IN")}</div>
            <div class="plan-daily">Just <strong>₹${plan.daily}/day</strong></div>
          </div>
        </div>
      `;
    }).join('');
    
    // Animate cards
    if (typeof gsap !== 'undefined') {
      gsap.utils.toArray(".plan-card").forEach(function(card, i) {
        gsap.fromTo(card,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: i * 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%"
            }
          }
        );
      });
    }
    
    // Add click handlers
    var cards = container.querySelectorAll(".plan-card");
    cards.forEach(function(card) {
      card.addEventListener("click", function() {
        cards.forEach(function(c) { c.classList.remove("selected"); });
        card.classList.add("selected");
        
        var duration = parseInt(card.dataset.duration);
        var price = parseInt(card.dataset.price);
        
        // Update global plan
        if (typeof window !== "undefined") {
          window.selectedPlan = { duration: duration, price: price };
        }
      });
    });
  }

  // =============================
  // SECTION 6 — CLINICAL OUTCOMES
  // =============================

  function animateOutcomes() {
    var outcomeCards = document.querySelectorAll(".outcome-card");
    
    outcomeCards.forEach(function(card) {
      var valueEl = card.querySelector(".outcome-value");
      if (!valueEl) return;
      
      var target = parseInt(valueEl.dataset.target) || 0;
      
      if (typeof gsap !== 'undefined') {
        // Reveal animation
        gsap.fromTo(card,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%"
            },
            onComplete: function() {
              // Count animation
              gsap.to({ value: 0 }, {
                value: target,
                duration: 2,
                ease: "power2.out",
                onUpdate: function() {
                  valueEl.textContent = Math.round(this.targets()[0].value);
                }
              });
            }
          }
        );
      } else {
        card.classList.add("visible");
        valueEl.textContent = target;
      }
    });
  }

  // =============================
  // RAZORPAY INTEGRATION
  // =============================

  function initializeRazorpay() {
    var checkoutBtn = document.getElementById("checkoutBtn");
    var finalCtaBtn = document.getElementById("finalCtaBtn");
    var activateBtn = document.getElementById("activatePlanBtn");
    
    function openCheckout() {
      var selectedPlan = window.selectedPlan || { duration: 12, price: 19999 };
      var planName = selectedPlan.duration + "-Month Structured Correction Plan";
      
      var options = {
        key: "YOUR_RAZORPAY_KEY",
        amount: selectedPlan.price * 100,
        currency: "INR",
        name: "Unlimitr",
        description: planName,
        handler: function(response) {
          window.location.href = "/payment-success.html?payment_id=" + response.razorpay_payment_id;
        },
        theme: {
          color: "#0E3D2F"
        }
      };
      
      var rzp = new Razorpay(options);
      rzp.on("payment.failed", function(response) {
        console.error("Payment failed:", response);
        alert("Payment failed. Please try again.");
      });
      rzp.open();
    }
    
    if (checkoutBtn) checkoutBtn.addEventListener("click", openCheckout);
    if (finalCtaBtn) finalCtaBtn.addEventListener("click", openCheckout);
    if (activateBtn) activateBtn.addEventListener("click", function() {
      document.getElementById("checkoutBtn")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  // =============================
  // DOWNLOAD HANDLERS
  // =============================

  function initializeDownloadHandlers() {
    var downloadBtns = document.querySelectorAll("#downloadReportBtn, #finalDownloadBtn");
    
    downloadBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        var intelligence = loadHealthIntelligence();
        
        if (typeof window.jspdf !== "undefined") {
          var doc = new window.jspdf.jsPDF();
          doc.setFont("helvetica");
          doc.setFontSize(20);
          doc.text("Clinical Health Intelligence Report", 20, 24);
          doc.setFontSize(11);
          doc.text("Total Score: " + intelligence.totalScore + "/100", 20, 36);
          doc.text("Zone: " + intelligence.zone, 20, 46);
          doc.text("Correction Window: " + intelligence.correctionWindowWeeks + " weeks", 20, 56);
          doc.setFontSize(9);
          doc.text("Generated by Unlimitr Clinical Intelligence System", 20, 280);
          doc.save("Unlimitr_Clinical_Report.pdf");
        } else {
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
    
    // Store globally
    if (typeof window !== "undefined") {
      window.currentHealthIntelligence = intelligence;
      window.currentPlan = plan;
      window.selectedPlan = { duration: plan.duration, price: plan.price };
    }
    
    // Store plan data in localStorage for offer-upgraded.html
    try {
      var planData = {
        name: plan.name,
        objective: plan.objective,
        duration: plan.duration,
        price: plan.price,
        originalPrice: plan.originalPrice,
        dailyPrice: plan.dailyPrice,
        dietSessions: plan.dietSessions,
        fitnessSessions: plan.fitnessSessions,
        features: plan.features,
        intelligence: {
          totalScore: intelligence.totalScore,
          zone: intelligence.zone,
          correctionWindowWeeks: intelligence.correctionWindowWeeks
        }
      };
      localStorage.setItem('recommendedPlan', JSON.stringify(planData));
      
      // Also store health score if available
      if (intelligence.totalScore) {
        localStorage.setItem('healthScore', JSON.stringify({
          total: intelligence.totalScore,
          metabolic: intelligence.dimensions?.metabolic || 60,
          recovery: intelligence.dimensions?.recovery || 60,
          hormonal: intelligence.dimensions?.hormonal || 60,
          behavioral: intelligence.dimensions?.behavioral || 60
        }));
      }
    } catch (e) {
      console.warn('Failed to store plan data:', e);
    }
    
    // Redirect to offer-upgraded.html after a brief delay to ensure data is stored
    setTimeout(function() {
      // Use relative path from solution/ directory
      window.location.href = '../offer-upgraded.html';
    }, 100);
  }

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
