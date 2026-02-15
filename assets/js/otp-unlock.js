/**
 * Reusable OTP + mobile unlock flow for journey (and other pages).
 * Requires: unlockOverlay, unlockCard, unlockMobile, unlockCountryCode, unlockOtp,
 * sendOtpBtn, verifyOtpBtn, unlockMobileError, unlockShowNum, unlockOtpCancel.
 * Optional: journeyBlurWrap (blurred until verified).
 * Storage: journey_verified = 'true' when verified.
 */
(function () {
  var DOMAIN_URL = "https://healthclickaway.com";
  var STORAGE_VERIFIED = "journey_verified";

  function initOtp() {
    var overlay = document.getElementById("unlockOverlay");
    var blurWrap = document.getElementById("journeyBlurWrap");
    var unlockCard = document.getElementById("unlockCard");
    var mobileInput = document.getElementById("unlockMobile");
    var countrySelect = document.getElementById("unlockCountryCode");
    var otpInput = document.getElementById("unlockOtp");
    var sendOtpBtn = document.getElementById("sendOtpBtn");
    var verifyOtpBtn = document.getElementById("verifyOtpBtn");
    var mobileErrorEl = document.getElementById("unlockMobileError");
    var showNumEl = document.getElementById("unlockShowNum");
    var otpCancelBtn = document.getElementById("unlockOtpCancel");

    if (!overlay) return;

    // Migrate away from localStorage (was persisting across sessions)
    try { localStorage.removeItem(STORAGE_VERIFIED); } catch (e) {}

    overlay.classList.remove("journey-unlocked");
    if (blurWrap) blurWrap.classList.add("journey-blurred");

    function getCountryCode() {
      return (countrySelect && countrySelect.value) ? countrySelect.value : "+91";
    }

    function sendOtp(phone) {
      var fd = new FormData();
      fd.append("phone_number", phone);
      return fetch(DOMAIN_URL + "/user-web-service/V6/users/send_otp", { method: "POST", body: fd }).then(function (r) { return r.json(); });
    }

    function verifyOtp(phone, otp) {
      var fd = new FormData();
      fd.append("phone_number", phone);
      fd.append("otp", otp);
      return fetch(DOMAIN_URL + "/user-web-service/V6/users/verify_otp", { method: "POST", body: fd }).then(function (r) { return r.json(); });
    }

    function unlock() {
      if (blurWrap) blurWrap.classList.remove("journey-blurred");
      if (overlay) {
        overlay.classList.add("journey-unlocked");
        overlay.style.display = "none";
        overlay.style.visibility = "hidden";
      }
      try { sessionStorage.setItem(STORAGE_VERIFIED, "true"); } catch (e) {}
    }

    function setVerified() {
      if (mobileInput) { mobileInput.readOnly = true; mobileInput.classList.add("bg-light"); }
      if (countrySelect) countrySelect.disabled = true;
      if (sendOtpBtn) { sendOtpBtn.textContent = "Verified"; sendOtpBtn.disabled = true; }
    }

    // Use sessionStorage so overlay shows on each new tab/session (localStorage persisted forever)
    if (sessionStorage.getItem(STORAGE_VERIFIED) === "true") {
      unlock();
      return;
    }

    // Ensure overlay is visible and content is blurred
    overlay.classList.remove("journey-unlocked");
    overlay.style.display = "flex";
    overlay.style.visibility = "visible";
    overlay.style.opacity = "1";
    if (blurWrap) blurWrap.classList.add("journey-blurred");

    if (sendOtpBtn && mobileInput) {
      sendOtpBtn.addEventListener("click", function () {
        if (sendOtpBtn.disabled) return;
        var val = (mobileInput.value || "").replace(/\D/g, "");
        if (val.length !== 10) {
          if (mobileErrorEl) mobileErrorEl.textContent = "Enter a valid 10-digit mobile number.";
          return;
        }
        if (mobileErrorEl) mobileErrorEl.textContent = "";
        var phone = getCountryCode() + val;
        sendOtp(phone).then(function (res) {
          if (res && res.code === 200) {
            if (showNumEl) showNumEl.textContent = phone;
            unlockCard.classList.add("otp-mode");
            otpInput.value = "";
            if (otpInput.focus) otpInput.focus();
          } else {
            if (mobileErrorEl) mobileErrorEl.textContent = "Failed to send OTP. Please try again.";
          }
        }).catch(function () {
          if (mobileErrorEl) mobileErrorEl.textContent = "Failed to send OTP. Please try again.";
        });
      });
    }

    if (verifyOtpBtn && otpInput) {
      verifyOtpBtn.addEventListener("click", function () {
        var otp = (otpInput.value || "").trim();
        if (otp.length !== 4) {
          alert("Enter 4-digit OTP.");
          return;
        }
        var phone = showNumEl ? showNumEl.textContent : "";
        if (!phone) return;
        verifyOtp(phone, otp).then(function (r) {
          if (r && r.code === 200) {
            setVerified();
            unlock();
            unlockCard.classList.remove("otp-mode");
          } else {
            alert("Verification failed. Please try again.");
          }
        }).catch(function () {
          alert("Verification failed. Please try again.");
        });
      });
    }

    if (otpCancelBtn) {
      otpCancelBtn.addEventListener("click", function () {
        unlockCard.classList.remove("otp-mode");
      });
    }

    if (otpInput) {
      otpInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") verifyOtpBtn && verifyOtpBtn.click();
      });
      otpInput.addEventListener("input", function () {
        var v = (otpInput.value || "").replace(/\D/g, "").slice(0, 4);
        if (otpInput.value !== v) otpInput.value = v;
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initOtp);
  } else {
    initOtp();
  }
})();
