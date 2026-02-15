/**
 * Voice Coach — Floating AI orb + waveform animation
 * Layer 6: Non-conversational Voice AI
 */
(function () {
  "use strict";

  var orbEl, canvas, ctx, waveformData = [], isSpeaking = false;

  function init() {
    var wrap = document.getElementById("journeyBlurWrap");
    if (!wrap) return;
    if (document.getElementById("voiceCoachOrb")) return;

    var container = document.createElement("div");
    container.id = "voiceCoachOrb";
    container.className = "voice-coach-orb";
    container.setAttribute("aria-label", "AI Coach - Click to hear your health summary");
    container.style.cssText = "position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg, var(--spanish-green), var(--blue-gray));box-shadow:0 8px 32px rgba(0,137,68,0.35);cursor:pointer;z-index:90;display:flex;align-items:center;justify-content:center;transition:transform 0.2s, box-shadow 0.2s;";

    orbEl = document.createElement("div");
    orbEl.className = "voice-orb-inner";
    orbEl.style.cssText = "width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.9);";
    container.appendChild(orbEl);

    canvas = document.createElement("canvas");
    canvas.className = "voice-waveform";
    canvas.width = 120;
    canvas.height = 120;
    canvas.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:120px;height:120px;pointer-events:none;opacity:0;transition:opacity 0.3s;";
    container.style.position = "relative";
    container.appendChild(canvas);
    ctx = canvas.getContext("2d");

    container.addEventListener("click", function () {
      if (typeof window.speakAsCoach === "function") {
        var msg = document.getElementById("healthInsightsText") || document.getElementById("counsellorMessage");
        var text = msg ? msg.textContent : "";
        if (text) {
          isSpeaking = true;
          container.classList.add("speaking");
          canvas.style.opacity = "0.9";
          window.speakAsCoach(text, "your coach");
          animateWaveform();
          setTimeout(function () {
            isSpeaking = false;
            container.classList.remove("speaking");
            canvas.style.opacity = "0";
          }, Math.min(text.length * 50, 15000));
        }
      }
    });

    container.addEventListener("mouseenter", function () {
      if (typeof gsap !== "undefined") {
        gsap.to(container, { scale: 1.1, boxShadow: "0 12px 40px rgba(0,137,68,0.45)", duration: 0.2 });
      }
    });
    container.addEventListener("mouseleave", function () {
      if (typeof gsap !== "undefined") {
        gsap.to(container, { scale: 1, boxShadow: "0 8px 32px rgba(0,137,68,0.35)", duration: 0.2 });
      }
    });

    document.body.appendChild(container);
  }

  function animateWaveform() {
    if (!ctx || !isSpeaking) return;
    var cw = canvas.width;
    var ch = canvas.height;
    var cx = cw / 2;
    var cy = ch / 2;

    function draw() {
      if (!isSpeaking) return;
      ctx.clearRect(0, 0, cw, ch);
      var t = Date.now() * 0.01;
      var bars = 24;
      for (var i = 0; i < bars; i++) {
        var angle = (i / bars) * Math.PI * 2 + t * 0.5;
        var r = 25 + Math.sin(t + i * 0.5) * 8;
        var x1 = cx + Math.cos(angle) * 20;
        var y1 = cy + Math.sin(angle) * 20;
        var x2 = cx + Math.cos(angle) * (20 + r);
        var y2 = cy + Math.sin(angle) * (20 + r);
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.lineWidth = 2;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  if (typeof window !== "undefined") {
    window.initVoiceCoach = init;
    window.VoiceCoach = { init: init };
  }
})();
