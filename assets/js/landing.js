/**
 * UNLIMITR Landing Page — Immersive AI Lab Interactions
 * Lightweight vanilla JS animations
 */

(function() {
  'use strict';

  // =============================
  // SCORE ANIMATION
  // =============================

  function animateScore() {
    var scoreEl = document.getElementById('previewScore');
    if (!scoreEl) return;
    
    var target = 32;
    var duration = 2000;
    var start = 0;
    var startTime = null;
    
    function animate(currentTime) {
      if (!startTime) startTime = currentTime;
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      
      var current = Math.floor(start + (target - start) * progress);
      scoreEl.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  }

  // =============================
  // SCROLL REVEAL
  // =============================

  function initScrollReveal() {
    var observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Observe intelligence cards
    var intelCards = document.querySelectorAll('.intel-card');
    intelCards.forEach(function(card, i) {
      card.style.transitionDelay = (i * 0.1) + 's';
      observer.observe(card);
    });
    
    // Observe authority stats
    var statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(function(item, i) {
      item.style.transitionDelay = (i * 0.15) + 's';
      observer.observe(item);
    });
  }

  // =============================
  // COUNTER ANIMATION
  // =============================

  function animateCounters() {
    var counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(function(counter) {
      var target = parseInt(counter.dataset.target) || 0;
      var duration = 2000;
      var start = 0;
      var startTime = null;
      var suffix = counter.textContent.includes('+') ? '+' : '';
      
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting && !counter.classList.contains('animated')) {
            counter.classList.add('animated');
            
            function animate(currentTime) {
              if (!startTime) startTime = currentTime;
              var elapsed = currentTime - startTime;
              var progress = Math.min(elapsed / duration, 1);
              
              // Ease out
              progress = 1 - Math.pow(1 - progress, 3);
              
              var current = Math.floor(start + (target - start) * progress);
              counter.textContent = current + suffix;
              
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            }
            
            requestAnimationFrame(animate);
            observer.unobserve(counter);
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(counter);
    });
  }

  // =============================
  // TRAJECTORY PATH GENERATION
  // =============================

  function generateTrajectoryPaths() {
    var pathDecline = document.getElementById('pathDecline');
    var pathRecovery = document.getElementById('pathRecovery');
    
    if (!pathDecline || !pathRecovery) return;
    
    var width = 640;
    var height = 300;
    var padding = 80;
    var chartWidth = width - (padding * 2);
    var chartHeight = height - (padding * 2);
    var weeks = 12;
    
    // Decline path (red)
    var declinePath = '';
    for (var i = 0; i <= weeks; i++) {
      var x = padding + (i / weeks) * chartWidth;
      var decline = 62 - (i * 3);
      var y = padding + ((100 - decline) / 100) * chartHeight;
      
      if (i === 0) {
        declinePath += 'M ' + x + ' ' + y;
      } else {
        declinePath += ' L ' + x + ' ' + y;
      }
    }
    pathDecline.setAttribute('d', declinePath);
    
    // Recovery path (green)
    var recoveryPath = '';
    for (var i = 0; i <= weeks; i++) {
      var x = padding + (i / weeks) * chartWidth;
      var improvement = 62 + (i * (75 - 62) / weeks);
      var oscillation = Math.sin(i * 0.4) * 1.5;
      var y = padding + ((100 - (improvement + oscillation)) / 100) * chartHeight;
      
      if (i === 0) {
        recoveryPath += 'M ' + x + ' ' + y;
      } else {
        recoveryPath += ' L ' + x + ' ' + y;
      }
    }
    pathRecovery.setAttribute('d', recoveryPath);
  }

  // =============================
  // INITIALIZATION
  // =============================

  function init() {
    // Animate preview score after delay
    setTimeout(animateScore, 500);
    
    // Initialize scroll reveals
    initScrollReveal();
    
    // Animate counters
    animateCounters();
    
    // Generate trajectory paths
    generateTrajectoryPaths();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
