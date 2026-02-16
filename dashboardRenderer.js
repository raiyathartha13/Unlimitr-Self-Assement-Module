/**
 * Dashboard Renderer — Production Clinical Intelligence Dashboard Builder
 * UNLIMITR AI Cognitive Backbone v2.0
 * 
 * Translates multidimensional biological intelligence into structured visual authority
 * Not UI decoration — this is a controlled intelligence dashboard builder
 */

(function() {
  "use strict";

  // Register GSAP plugins
  if (typeof gsap !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  /**
   * DashboardRenderer Class
   * Clinical Intelligence Dashboard Builder
   */
  function DashboardRenderer(engineOutput, narrativeEngine) {
    this.data = engineOutput || {};
    this.narrative = narrativeEngine || null;
    this.root = document.querySelector("main.app-shell") || document.body;
  }

  /**
   * MAIN RENDER ENTRY POINT
   */
  DashboardRenderer.prototype.render = function() {
    // Clear existing sections (if any)
    var existingSections = this.root.querySelectorAll(".section-hidden, .fold");
    existingSections.forEach(function(section) {
      section.remove();
    });

    // Render all folds
    this.renderAuthorityHeader();
    this.renderDimensionGrid();
    this.renderImpactSection();
    this.renderTrajectorySection();
    this.renderRiskForecast();
    this.renderRoadmap();
    this.renderConversionBlock();

    // Animate entry
    this.animateEntry();
  };

  /**
   * FOLD 1 — Authority Header
   * Executive summary + premium gauge
   */
  DashboardRenderer.prototype.renderAuthorityHeader = function() {
    var section = document.getElementById("authorityHeader");
    if (!section) return;

    var score = this.data.totalScore || 0;
    var zone = this.data.zone || "Unknown";
    var executiveSummary = "";

    // Get executive summary from NarrativeEngine
    if (this.narrative && typeof this.narrative.generateExecutiveSummary === "function") {
      executiveSummary = this.narrative.generateExecutiveSummary();
    } else if (typeof window.NarrativeEngine !== "undefined") {
      try {
        var narrativeEngine = new window.NarrativeEngine(this.data);
        executiveSummary = narrativeEngine.generateExecutiveSummary();
      } catch (e) {
        executiveSummary = "Your biological system analysis indicates optimization potential with structured intervention.";
      }
    } else {
      executiveSummary = "Your biological system analysis indicates optimization potential with structured intervention.";
    }

    // Update narrative text
    var narrativeEl = document.getElementById("authorityNarrative");
    if (narrativeEl) {
      narrativeEl.textContent = executiveSummary;
    }

    // Update status
    var statusEl = document.getElementById("gaugeStatus");
    var subtextEl = document.getElementById("gaugeSubtext");
    if (statusEl) statusEl.textContent = zone;
    if (subtextEl) {
      subtextEl.textContent = score < 50 ? "Reversible adaptive strain detected" : 
                             score < 70 ? "Structured accountability recommended" : 
                             "Projected improvement: +51% with adherence";
    }

    // Draw main gauge
    this.drawMainGauge(score);
  };

  /**
   * FOLD 2 — Dimension Grid
   * 5 dimension cards with clinical narratives
   */
  DashboardRenderer.prototype.renderDimensionGrid = function() {
    var grid = document.getElementById("driversGrid");
    if (!grid) return;

    grid.innerHTML = ""; // Clear existing

    var dimensions = this.data.dimensions || {};
    var dimensionOrder = ["metabolic", "recovery", "hormonal", "behavioral", "readiness"];

    dimensionOrder.forEach(function(key, index) {
      var value = dimensions[key] || 0;
      if (!dimensions.hasOwnProperty(key)) return;

      // Get clinical narrative
      var narrativeText = "";
      if (this.narrative && typeof this.narrative.generateDimensionNarrative === "function") {
        narrativeText = this.narrative.generateDimensionNarrative(key, value);
      } else if (typeof window.NarrativeEngine !== "undefined") {
        try {
          var narrativeEngine = new window.NarrativeEngine(this.data);
          narrativeText = narrativeEngine.generateDimensionNarrative(key, value);
        } catch (e) {
          narrativeText = this.getDefaultDimensionText(key, value);
        }
      } else {
        narrativeText = this.getDefaultDimensionText(key, value);
      }

      // Create card
      var card = document.createElement("div");
      card.className = "driver-card";
      card.dataset.dimension = key;
      card.dataset.region = this.getDimensionRegion(key);

      var displayName = this.formatDimension(key);
      var severity = this.getSeverity(value);
      var severityClass = "severity-" + severity;
      var severityLabel = severity === "high" ? "High Risk" : severity === "moderate" ? "Moderate" : "Stable";

      // Check if top driver
      var isTopDriver = false;
      var topDriverRank = -1;
      var topDrivers = this.data.topDrivers || [];
      for (var i = 0; i < topDrivers.length; i++) {
        if (topDrivers[i].name === key) {
          isTopDriver = true;
          topDriverRank = i + 1;
          break;
        }
      }

      var topDriverBadge = isTopDriver ? 
        '<span class="top-driver-badge" style="position:absolute;top:8px;right:8px;background:rgba(15,157,88,0.1);color:#0F9D58;font-size:0.65rem;font-weight:700;padding:2px 6px;border-radius:8px;">Top Driver #' + topDriverRank + '</span>' : '';

      card.innerHTML = 
        '<div class="driver-card-header" style="position:relative;">' +
          '<div class="driver-title">' + displayName + '</div>' +
          '<span class="severity-badge ' + severityClass + '">' + severityLabel + '</span>' +
          topDriverBadge +
        '</div>' +
        '<svg class="driver-mini-gauge" viewBox="0 0 80 50" id="gauge-' + key + '"></svg>' +
        '<div class="driver-score" style="color:' + this.getScoreColor(value) + '">' + Math.round(value) + '%</div>' +
        '<div class="driver-desc">' + narrativeText + '</div>';

      grid.appendChild(card);

      // Draw mini gauge
      this.drawMiniGauge("gauge-" + key, value);
    }.bind(this));

    // Stagger reveal
    gsap.to(".driver-card", {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#driversSection",
        start: "top 85%"
      }
    });

    // Setup body interactions
    this.setupBodyInteractions();
  };

  /**
   * FOLD 3 — Biological Impact Section
   * Primary limiting drivers + human silhouette
   */
  DashboardRenderer.prototype.renderImpactSection = function() {
    var section = document.getElementById("impactSection");
    if (!section) return;

    var tooltip = document.getElementById("impactTooltip");
    if (!tooltip) return;

    // Get driver analysis
    var driverAnalysis = "";
    if (this.narrative && typeof this.narrative.generateDriverAnalysis === "function") {
      driverAnalysis = this.narrative.generateDriverAnalysis();
    } else if (typeof window.NarrativeEngine !== "undefined") {
      try {
        var narrativeEngine = new window.NarrativeEngine(this.data);
        driverAnalysis = narrativeEngine.generateDriverAnalysis();
      } catch (e) {
        driverAnalysis = "Primary limiting factors identified. Structured correction addresses these drivers.";
      }
    } else {
      driverAnalysis = "Primary limiting factors identified. Structured correction addresses these drivers.";
    }

    // Update tooltip with driver analysis
    tooltip.textContent = driverAnalysis.length > 200 ? driverAnalysis.substring(0, 200) + "..." : driverAnalysis;
  };

  /**
   * FOLD 4 — Trajectory Simulation
   * Dual-path projection with clinical forecasts
   */
  DashboardRenderer.prototype.renderTrajectorySection = function() {
    var section = document.getElementById("trajectorySection");
    if (!section) return;

    // Get trajectory forecast
    var forecast = null;
    if (this.narrative && typeof this.narrative.generateTrajectoryForecast === "function") {
      forecast = this.narrative.generateTrajectoryForecast();
    } else if (typeof window.NarrativeEngine !== "undefined") {
      try {
        var narrativeEngine = new window.NarrativeEngine(this.data);
        forecast = narrativeEngine.generateTrajectoryForecast();
      } catch (e) {
        forecast = {
          withoutIntervention: "Without structured correction, adaptive plateau is probable within 6–8 weeks.",
          withIntervention: "With guided intervention, metabolic stabilization is projected within 12 weeks."
        };
      }
    } else {
      forecast = {
        withoutIntervention: "Without structured correction, adaptive plateau is probable within 6–8 weeks.",
        withIntervention: "With guided intervention, metabolic stabilization is projected within 12 weeks."
      };
    }

    // Update trajectory copy
    var trajectoryCopy = document.getElementById("trajectoryCopy");
    if (trajectoryCopy && forecast) {
      trajectoryCopy.innerHTML = 
        '<p><strong>Without structured correction:</strong> ' + forecast.withoutIntervention + '</p>' +
        '<p><strong>With guided intervention:</strong> ' + forecast.withIntervention + '</p>';
    }

    // Draw trajectory graph
    this.drawTrajectory();
  };

  /**
   * FOLD 5 — Dropout Risk Forecast
   * Consistency vulnerability map
   */
  DashboardRenderer.prototype.renderRiskForecast = function() {
    var section = document.getElementById("riskSection");
    if (!section) return;

    var grid = document.getElementById("riskGrid");
    if (!grid) return;

    // Get dropout risk narrative
    var riskNarrative = "";
    if (this.narrative && typeof this.narrative.generateDropoutRiskNarrative === "function") {
      riskNarrative = this.narrative.generateDropoutRiskNarrative();
    } else if (typeof window.NarrativeEngine !== "undefined") {
      try {
        var narrativeEngine = new window.NarrativeEngine(this.data);
        riskNarrative = narrativeEngine.generateDropoutRiskNarrative();
      } catch (e) {
        riskNarrative = "Dropout vulnerability assessment based on behavioral sustainability index.";
      }
    } else {
      riskNarrative = "Dropout vulnerability assessment based on behavioral sustainability index.";
    }

    // Update risk subtext
    var riskSubtext = section.querySelector(".risk-subtext");
    if (riskSubtext) {
      riskSubtext.textContent = riskNarrative.length > 150 ? riskNarrative.substring(0, 150) + "..." : riskNarrative;
    }

    // Generate risk grid
    grid.innerHTML = "";
    var dropoutWeeks = this.data.dropoutRiskWeeks || [];
    var score = this.data.totalScore || 0;

    for (var i = 0; i < 12; i++) {
      var weekNum = i + 1;
      var risk;
      if (dropoutWeeks.indexOf(weekNum) >= 0) {
        risk = "high";
      } else if (weekNum >= 2 && weekNum <= 5 && score < 60) {
        risk = "moderate";
      } else {
        risk = "stable";
      }

      var block = document.createElement("div");
      block.className = "risk-block risk-" + risk;
      block.textContent = weekNum;

      var tooltip = document.createElement("div");
      tooltip.className = "risk-tooltip";
      tooltip.textContent = "Week " + weekNum + ": " + 
        (risk === "high" ? "High dropout risk" : risk === "moderate" ? "Moderate risk" : "Stable");
      block.appendChild(tooltip);

      grid.appendChild(block);
    }

    // Stagger reveal
    gsap.to(".risk-block", {
      opacity: 1,
      duration: 0.5,
      stagger: 0.04,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#riskSection",
        start: "top 85%"
      }
    });
  };

  /**
   * FOLD 6 — Strategic Roadmap
   * Correction timeline with milestones
   */
  DashboardRenderer.prototype.renderRoadmap = function() {
    var section = document.getElementById("roadmapSection");
    if (!section) return;

    var milestones = [
      { week: 2, desc: "Metabolic Stabilization" },
      { week: 4, desc: "Recovery Optimization" },
      { week: 8, desc: "Hormonal Correction" },
      { week: 12, desc: "Visible Composition Shift" }
    ];

    var container = document.getElementById("roadmapMilestones");
    if (!container) return;

    container.innerHTML = "";

    milestones.forEach(function(m) {
      var milestone = document.createElement("div");
      milestone.className = "roadmap-milestone";
      milestone.innerHTML = 
        '<div class="roadmap-milestone-week">Week ' + m.week + '</div>' +
        '<div class="roadmap-milestone-desc">' + m.desc + '</div>';
      container.appendChild(milestone);
    });

    // Animate timeline
    var line = document.getElementById("roadmapLine");
    var node = document.getElementById("roadmapNode");

    ScrollTrigger.create({
      trigger: "#roadmapSection",
      start: "top 80%",
      end: "top 20%",
      scrub: 0.5,
      onUpdate: function(self) {
        var progress = self.progress;
        if (line) line.style.width = (progress * 100) + "%";
        if (node) {
          node.style.left = (progress * 100) + "%";
          if (progress > 0.1) node.classList.add("active");
        }
      }
    });

    // Reveal milestones
    gsap.to(".roadmap-milestone", {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#roadmapSection",
        start: "top 85%"
      }
    });
  };

  /**
   * FINAL BLOCK — Conversion
   * Authority conversion with plan rationale
   */
  DashboardRenderer.prototype.renderConversionBlock = function() {
    var section = document.getElementById("conversionSection");
    if (!section) return;

    // Get plan rationale
    var planRationale = "";
    if (this.narrative && typeof this.narrative.generatePlanRationale === "function") {
      planRationale = this.narrative.generatePlanRationale();
    } else if (typeof window.NarrativeEngine !== "undefined") {
      try {
        var narrativeEngine = new window.NarrativeEngine(this.data);
        planRationale = narrativeEngine.generatePlanRationale();
      } catch (e) {
        planRationale = "Structured correction restores resilience.";
      }
    } else {
      planRationale = "Structured correction restores resilience.";
    }

    // Update conversion block text (optional - can add rationale as subtitle)
    var conversionP = section.querySelector(".conversion-block p");
    if (conversionP && planRationale.length < 200) {
      conversionP.textContent = planRationale;
    }
  };

  /**
   * SVG GAUGE DRAWING
   */
  DashboardRenderer.prototype.drawMainGauge = function(value) {
    var gaugeFill = document.getElementById("gaugeFill");
    var gaugeScore = document.getElementById("gaugeScore");
    if (!gaugeFill || !gaugeScore) return;

    var arcLength = Math.PI * 80;
    var dashLength = (value / 100) * arcLength;

    // Animate score counter
    var scoreObj = { value: 0 };
    gsap.to(scoreObj, {
      value: value,
      duration: 1.2,
      ease: "power2.out",
      snap: { value: 1 },
      onUpdate: function() {
        gaugeScore.textContent = Math.round(scoreObj.value);
      }
    });

    // Animate gauge arc
    gsap.fromTo(gaugeFill, 
      { strokeDasharray: "0 " + arcLength },
      { 
        strokeDasharray: dashLength + " " + arcLength,
        duration: 1.2,
        ease: "power2.out"
      }
    );
  };

  DashboardRenderer.prototype.drawMiniGauge = function(id, value) {
    var svg = document.getElementById(id);
    if (!svg) return;

    var arcPath = 'M 10 40 A 30 30 0 0 1 70 40';
    var arcLength = Math.PI * 30;
    var arcDash = (value / 100) * arcLength;
    var color = this.getScoreColor(value);

    // Background arc
    var bgArc = document.createElementNS("http://www.w3.org/2000/svg", "path");
    bgArc.setAttribute("d", arcPath);
    bgArc.setAttribute("fill", "none");
    bgArc.setAttribute("stroke", "rgba(0,0,0,0.08)");
    bgArc.setAttribute("stroke-width", "6");
    svg.appendChild(bgArc);

    // Fill arc
    var fillArc = document.createElementNS("http://www.w3.org/2000/svg", "path");
    fillArc.setAttribute("d", arcPath);
    fillArc.setAttribute("fill", "none");
    fillArc.setAttribute("stroke", color);
    fillArc.setAttribute("stroke-width", "6");
    fillArc.setAttribute("stroke-linecap", "round");
    fillArc.setAttribute("stroke-dasharray", "0 " + arcLength);
    svg.appendChild(fillArc);

    // Animate
    gsap.to(fillArc, {
      strokeDasharray: arcDash + " " + arcLength,
      duration: 0.9,
      delay: 0.1,
      ease: "power2.out"
    });
  };

  /**
   * TRAJECTORY GRAPH DRAWING
   */
  DashboardRenderer.prototype.drawTrajectory = function() {
    var svg = document.getElementById("trajectorySvg");
    if (!svg) return;

    // Get weight data (fallback if not in intelligence)
    var data = window.currentHealthIntelligence || this.data;
    var w = parseFloat(data.user && data.user.weight ? data.user.weight : 78) || 78;
    var targetW = parseFloat(data.user && data.user.targetWeight ? data.user.targetWeight : 70) || 70;
    var weightGap = w - targetW;

    // Generate data points
    var weeks = [0, 2, 4, 6, 8, 10, 12];
    var noIntervention = [];
    var withIntervention = [];

    weeks.forEach(function(week) {
      noIntervention.push(w - (week <= 6 ? week * 0.15 : 0.9));
      withIntervention.push(w - (weightGap * (week / 12) * 0.9));
    });

    // SVG dimensions
    var width = 800;
    var height = 280;
    var padding = 60;
    var chartWidth = width - padding * 2;
    var chartHeight = height - padding * 2;

    // Find min/max for scaling
    var allValues = noIntervention.concat(withIntervention);
    var minVal = Math.min.apply(Math, allValues);
    var maxVal = Math.max.apply(Math, allValues);
    var range = maxVal - minVal;
    var scaleY = chartHeight / range;

    // Clear SVG
    svg.innerHTML = "";

    // Draw grid lines
    for (var i = 0; i <= 4; i++) {
      var y = padding + (chartHeight / 4) * i;
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", padding);
      line.setAttribute("x2", width - padding);
      line.setAttribute("y1", y);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "rgba(0,0,0,0.05)");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);
    }

    // Draw paths
    function createPath(values, smooth) {
      var path = "M ";
      values.forEach(function(val, i) {
        var x = padding + (chartWidth / (weeks.length - 1)) * i;
        var y = padding + chartHeight - ((val - minVal) * scaleY);
        
        if (i === 0) {
          path += x + " " + y;
        } else if (smooth && i < values.length - 1) {
          var prevX = padding + (chartWidth / (weeks.length - 1)) * (i - 1);
          var prevY = padding + chartHeight - ((values[i - 1] - minVal) * scaleY);
          var nextX = padding + (chartWidth / (weeks.length - 1)) * (i + 1);
          var nextY = padding + chartHeight - ((values[i + 1] - minVal) * scaleY);
          
          var cp1x = prevX + (x - prevX) * 0.5;
          var cp1y = prevY;
          var cp2x = x - (nextX - x) * 0.5;
          var cp2y = y;
          
          path += " C " + cp1x + " " + cp1y + ", " + cp2x + " " + cp2y + ", " + x + " " + y;
        } else {
          path += " L " + x + " " + y;
        }
      });
      return path;
    }

    // No intervention path (dashed)
    var noIntPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    noIntPath.setAttribute("d", createPath(noIntervention, false));
    noIntPath.setAttribute("class", "trajectory-path no-intervention");
    noIntPath.setAttribute("stroke", "#D93025");
    noIntPath.setAttribute("stroke-dasharray", "8 4");
    noIntPath.setAttribute("stroke-width", "3");
    noIntPath.setAttribute("fill", "none");
    svg.appendChild(noIntPath);

    // With intervention path (smooth)
    var withIntPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    withIntPath.setAttribute("d", createPath(withIntervention, true));
    withIntPath.setAttribute("class", "trajectory-path with-intervention");
    withIntPath.setAttribute("stroke", "#0F9D58");
    withIntPath.setAttribute("stroke-width", "3");
    withIntPath.setAttribute("fill", "none");
    svg.appendChild(withIntPath);

    // Add points
    weeks.forEach(function(week, i) {
      var x = padding + (chartWidth / (weeks.length - 1)) * i;
      
      var noIntPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      noIntPoint.setAttribute("cx", x);
      noIntPoint.setAttribute("cy", padding + chartHeight - ((noIntervention[i] - minVal) * scaleY));
      noIntPoint.setAttribute("r", "4");
      noIntPoint.setAttribute("fill", "#fff");
      noIntPoint.setAttribute("stroke", "#D93025");
      noIntPoint.setAttribute("stroke-width", "2");
      svg.appendChild(noIntPoint);

      var withIntPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      withIntPoint.setAttribute("cx", x);
      withIntPoint.setAttribute("cy", padding + chartHeight - ((withIntervention[i] - minVal) * scaleY));
      withIntPoint.setAttribute("r", "4");
      withIntPoint.setAttribute("fill", "#fff");
      withIntPoint.setAttribute("stroke", "#0F9D58");
      withIntPoint.setAttribute("stroke-width", "2");
      svg.appendChild(withIntPoint);
    });

    // Animate paths on scroll
    ScrollTrigger.create({
      trigger: "#trajectorySection",
      start: "top 80%",
      onEnter: function() {
        var pathLength = noIntPath.getTotalLength();
        noIntPath.style.strokeDasharray = pathLength;
        noIntPath.style.strokeDashoffset = pathLength;
        gsap.to(noIntPath, {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: "power2.out"
        });

        pathLength = withIntPath.getTotalLength();
        withIntPath.style.strokeDasharray = pathLength;
        withIntPath.style.strokeDashoffset = pathLength;
        gsap.to(withIntPath, {
          strokeDashoffset: 0,
          duration: 1.2,
          delay: 0.3,
          ease: "power2.out"
        });
      }
    });
  };

  /**
   * ANIMATION ENTRY
   */
  DashboardRenderer.prototype.animateEntry = function() {
    // Reveal authority header immediately
    gsap.fromTo("#authorityHeader", 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    );

    // Other sections reveal on scroll (handled by individual render methods)
  };

  /**
   * BODY INTERACTIONS
   */
  DashboardRenderer.prototype.setupBodyInteractions = function() {
    var bodyRegions = document.querySelectorAll(".body-region");
    var tooltip = document.getElementById("impactTooltip");
    var cards = document.querySelectorAll(".driver-card");

    cards.forEach(function(card) {
      card.addEventListener("mouseenter", function() {
        var region = this.dataset.region;
        var dimension = this.dataset.dimension;
        var pulse = this.querySelector(".severity-high") !== null;

        bodyRegions.forEach(function(br) {
          if (br.dataset.region === region) {
            br.classList.add("highlight");
            if (pulse) br.classList.add("pulse");
          }
        });

        if (tooltip && dimension) {
          var narrative = "";
          if (typeof window.NarrativeEngine !== "undefined") {
            try {
              var narrativeEngine = new window.NarrativeEngine(this.data);
              narrative = narrativeEngine.generateDimensionNarrative(dimension, 
                (this.data.dimensions || {})[dimension] || 0);
            } catch (e) {}
          }
          tooltip.textContent = narrative || "Hover a driver card to see biological impact.";
        }
      }.bind(this));

      card.addEventListener("mouseleave", function() {
        bodyRegions.forEach(function(br) {
          br.classList.remove("highlight", "pulse");
        });
        if (tooltip) tooltip.textContent = "Hover a driver card to see biological impact.";
      });
    }.bind(this));
  };

  /**
   * UTILITY METHODS
   */
  DashboardRenderer.prototype.formatDimension = function(key) {
    var map = {
      metabolic: "Metabolic Throughput",
      recovery: "Recovery Integrity",
      hormonal: "Hormonal Stability",
      behavioral: "Behavioral Sustainability",
      readiness: "Intervention Readiness"
    };
    return map[key] || key;
  };

  DashboardRenderer.prototype.getScoreColor = function(score) {
    if (score < 50) return "#D93025";
    if (score < 70) return "#E89B2C";
    return "#0F9D58";
  };

  DashboardRenderer.prototype.getSeverity = function(score) {
    if (score < 50) return "high";
    if (score < 70) return "moderate";
    return "low";
  };

  DashboardRenderer.prototype.getDimensionRegion = function(key) {
    var map = {
      metabolic: "torso",
      recovery: "head",
      hormonal: "abdomen",
      behavioral: "legs",
      readiness: "torso"
    };
    return map[key] || "torso";
  };

  DashboardRenderer.prototype.getDefaultDimensionText = function(key, value) {
    var texts = {
      metabolic: "Body composition signals suggest optimization potential. Targeted nutrition can improve efficiency.",
      recovery: "Sleep and stress load affect fat oxidation. Recovery optimization can accelerate progress by 22%.",
      hormonal: "Signals indicate hormonal regulation patterns. Meal timing and resistance training normalize response.",
      behavioral: "Consistency is a primary lever. Structured programming addresses plateaus effectively.",
      readiness: "Intervention readiness factors support protocol adherence."
    };
    return texts[key] || "Dimension analysis indicates optimization potential.";
  };

  /**
   * INITIALIZATION FUNCTION
   * Main entry point for dashboard rendering
   */
  function init() {
    // Load assessment data
    var data = null;
    try {
      var raw = localStorage.getItem("assessmentData") || 
                sessionStorage.getItem("assessmentData") ||
                localStorage.getItem("ai_health_assessment_v2") ||
                sessionStorage.getItem("ai_health_assessment_v2");
      if (raw) data = JSON.parse(raw);
    } catch (e) {}

    if (!data) {
      data = {
        weight: 78,
        height: 172,
        age: 30,
        gender: "male",
        targetWeight: 70,
        activityLevel: "moderate",
        sleepQuality: "good",
        stressLevel: "moderate",
        commitment: "4-5",
        healthIssues: "",
        primaryGoal: "weight-loss"
      };
    }

    // Compute health intelligence
    var intelligence = null;
    if (typeof window.HealthEngine !== "undefined") {
      try {
        var engine = new window.HealthEngine(data);
        intelligence = engine.computeAll();
        // Store user data in intelligence for trajectory
        intelligence.user = data;
      } catch (e) {
        console.warn("HealthEngine computation failed:", e);
      }
    }

    if (!intelligence) {
      console.warn("HealthEngine not available, using fallback");
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
        topDrivers: [],
        correctionWindowWeeks: 12,
        dropoutRiskWeeks: [3, 4],
        planRecommendation: { duration: 3, intensity: "Guided Correction" },
        user: data
      };
    }

    // Create NarrativeEngine
    var narrativeEngine = null;
    if (typeof window.NarrativeEngine !== "undefined") {
      try {
        narrativeEngine = new window.NarrativeEngine(intelligence);
      } catch (e) {
        console.warn("NarrativeEngine creation failed:", e);
      }
    }

    // Store intelligence globally for reference
    if (typeof window !== "undefined") {
      window.currentHealthIntelligence = intelligence;
    }

    // Create and render dashboard
    var renderer = new DashboardRenderer(intelligence, narrativeEngine);
    renderer.render();

    // Setup download handler
    var downloadBtn = document.getElementById("downloadReportBtn");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", function() {
        if (typeof jspdf !== "undefined") {
          var doc = new jspdf.jsPDF();
          doc.setFont("helvetica");
          doc.setFontSize(20);
          doc.text("Health Intelligence Report", 20, 24);
          doc.setFontSize(11);
          doc.text("Total Score: " + intelligence.totalScore + "/100", 20, 36);
          doc.text("Zone: " + intelligence.zone, 20, 46);
          if (narrativeEngine) {
            doc.text(narrativeEngine.generateExecutiveSummary(), 20, 56, { maxWidth: 170 });
          }
          doc.setFontSize(9);
          doc.text("Generated by Unlimitr AI Health Intelligence", 20, 280);
          doc.save("Unlimitr_Health_Report.pdf");
        } else {
          window.print();
        }
      });
    }

    // Setup section reveals
    var sections = document.querySelectorAll(".section-hidden");
    sections.forEach(function(section, i) {
      if (section.id === "authorityHeader") return;
      
      gsap.fromTo(section, 
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 88%"
          }
        }
      );
    });

    // Log intelligence structure
    if (typeof console !== "undefined" && console.log) {
      console.log("Health Intelligence Dashboard Rendered:", {
        totalScore: intelligence.totalScore,
        zone: intelligence.zone,
        topDrivers: intelligence.topDrivers.map(function(d) { 
          return d.name + " (" + d.impact + "% impact)"; 
        }),
        correctionWindow: intelligence.correctionWindowWeeks + " weeks",
        dropoutRisk: intelligence.dropoutRiskWeeks.length > 0 ? 
          "Weeks " + intelligence.dropoutRiskWeeks.join(", ") : "Low risk"
      });
    }
  }

  // Export
  if (typeof window !== "undefined") {
    window.DashboardRenderer = DashboardRenderer;
  }

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
