/**
 * Page 1 — AI Intelligent Assessment
 * Structured 4-step flow: DOB (Flatpickr), sliders, info-icon tooltips, validation, Lottie loader.
 */

(function () {
  const form = document.getElementById("assessmentForm");
  if (!form) return;

  const totalSteps = 4;
  let step = 1;
  const stepLabel = document.getElementById("stepLabel");
  const stepperBars = document.querySelectorAll(".stepper .step span");
  const prevBtn = document.getElementById("prevStep");
  const nextBtn = document.getElementById("nextStep");
  const submitBtn = document.getElementById("submitAssessment");
  const loadingOverlay = document.getElementById("loadingOverlay");
  const lottieContainer = document.getElementById("lottieBrain");

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // —— Flatpickr for Date of Birth ———
  const dobInput = document.getElementById("dateOfBirthInput");
  const ageField = document.getElementById("ageField");
  if (dobInput && typeof flatpickr !== "undefined") {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
    const isMobile = window.innerWidth < 768;
    flatpickr(dobInput, {
      dateFormat: "Y-m-d",
      maxDate: maxDate,
      static: false, // Allow calendar to position dynamically
      positionElement: isMobile ? dobInput : undefined, // On mobile, position relative to input
      appendTo: isMobile ? document.body : undefined, // On mobile, append to body for proper z-index
      clickOpens: true, // Ensure calendar opens on click
      allowInput: true, // Allow manual input
      mobileNative: false, // Force flatpickr UI even on mobile
      zIndex: 99999, // High z-index for mobile
      onChange: function (selectedDates, dateStr) {
        if (ageField && dateStr) {
          const dob = new Date(dateStr);
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
          ageField.value = age;
        }
      },
      onOpen: function(selectedDates, dateStr, instance) {
        // Ensure calendar is visible on mobile
        if (isMobile) {
          setTimeout(() => {
            const calendar = instance.calendarContainer;
            if (calendar) {
              calendar.style.zIndex = '99999';
              calendar.style.position = 'fixed';
              // Position calendar above input
              const rect = dobInput.getBoundingClientRect();
              calendar.style.top = (rect.bottom + 8) + 'px';
              calendar.style.left = '16px';
              calendar.style.right = '16px';
              calendar.style.width = 'auto';
            }
          }, 10);
        }
      }
    });
  }

  function updateAge() {
    if (!dobInput || !ageField || !dobInput.value) return;
    const dob = new Date(dobInput.value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    ageField.value = age;
  }

  // —— Info icon tooltips (beside icon, click to open, click outside to close) ———
  form.querySelectorAll(".field-wrap[data-info]").forEach((wrap) => {
    const info = wrap.getAttribute("data-info");
    const icon = wrap.querySelector(".info-icon");
    if (!icon || !info) return;

    const iconWrap = document.createElement("span");
    iconWrap.className = "info-icon-wrap";
    icon.parentNode.insertBefore(iconWrap, icon);
    iconWrap.appendChild(icon);

    const tooltip = document.createElement("span");
    tooltip.className = "info-tooltip";
    tooltip.textContent = info;
    iconWrap.appendChild(tooltip);

    icon.addEventListener("click", function (e) {
      e.stopPropagation();
      const wasOpen = iconWrap.classList.contains("info-tooltip-open");
      form.querySelectorAll(".info-icon-wrap.info-tooltip-open").forEach((w) => w.classList.remove("info-tooltip-open"));
      if (!wasOpen) {
        iconWrap.classList.add("info-tooltip-open");
        if (typeof gsap !== "undefined") {
          gsap.fromTo(tooltip, { opacity: 0, x: -4 }, { opacity: 1, x: 0, duration: 0.2 });
        }
      }
    });

    icon.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        icon.click();
      }
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".info-icon-wrap")) {
      form.querySelectorAll(".info-icon-wrap.info-tooltip-open").forEach((w) => w.classList.remove("info-tooltip-open"));
    }
  });

  // —— Height slider: cm → ft+in ———
  function cmToFtIn(cm) {
    const totalIn = cm / 2.54;
    const ft = Math.floor(totalIn / 12);
    const in_ = Math.round(totalIn % 12);
    return ft + " ft " + in_ + " in";
  }
  const heightSlider = document.getElementById("heightSlider");
  const heightCm = document.getElementById("heightCm");
  const heightFtIn = document.getElementById("heightFtIn");
  if (heightSlider && heightCm && heightFtIn) {
    function updateHeight() {
      const v = parseInt(heightSlider.value, 10);
      heightCm.textContent = v;
      heightFtIn.textContent = cmToFtIn(v);
    }
    heightSlider.addEventListener("input", updateHeight);
    updateHeight();
  }

  // —— Weight / Target Weight sliders ———
  function kgToLbs(kg) {
    return Math.round(kg * 2.205);
  }
  const weightSlider = document.getElementById("weightSlider");
  const targetWeightSlider = document.getElementById("targetWeightSlider");
  const weightKg = document.getElementById("weightKg");
  const weightLbs = document.getElementById("weightLbs");
  const targetWeightKg = document.getElementById("targetWeightKg");
  const targetWeightLbs = document.getElementById("targetWeightLbs");
  if (weightSlider && weightKg && weightLbs) {
    function updateWeight() {
      const v = parseInt(weightSlider.value, 10);
      weightKg.textContent = v;
      weightLbs.textContent = kgToLbs(v);
    }
    weightSlider.addEventListener("input", updateWeight);
    updateWeight();
  }
  if (targetWeightSlider && targetWeightKg && targetWeightLbs) {
    function updateTargetWeight() {
      const v = parseInt(targetWeightSlider.value, 10);
      targetWeightKg.textContent = v;
      targetWeightLbs.textContent = kgToLbs(v);
    }
    targetWeightSlider.addEventListener("input", updateTargetWeight);
    updateTargetWeight();
  }

  // —— Health issues & diet ———
  const radios = form.querySelectorAll('input[name="healthIssueMain"]');
  const checkboxes = form.querySelectorAll("#healthIssuesList input[type='checkbox']");
  const healthOtherCheck = document.getElementById("healthOtherCheck");
  const healthOtherInput = document.getElementById("healthOtherInput");
  const dietSelect = document.getElementById("dietSelect");

  function toggleHealthCheckboxes() {
    const noMedical = form.querySelector('input[name="healthIssueMain"][value="none"]');
    const disabled = noMedical && noMedical.checked;
    checkboxes.forEach((cb) => {
      cb.disabled = disabled;
      if (disabled) cb.checked = false;
    });
    healthOtherInput?.classList.toggle("d-none", !(healthOtherCheck?.checked && !disabled));
  }
  radios.forEach((r) => r.addEventListener("change", toggleHealthCheckboxes));
  checkboxes.forEach((cb) => cb.addEventListener("change", toggleHealthCheckboxes));
  toggleHealthCheckboxes();

  // —— Conditional fields: Female → Menstrual; Thyroid/Diabetes/PCOS → extra fields (visibility also in inline script) ——
  const genderSelect = document.getElementById("genderSelect");
  const menstrualWrap = document.getElementById("menstrualWrap");
  const thyroidFields = document.getElementById("thyroidFields");
  const diabetesFields = document.getElementById("diabetesFields");
  const pcosFields = document.getElementById("pcosFields");

  function toggleConditionalFields() {
    if (genderSelect && menstrualWrap) {
      menstrualWrap.classList.toggle("d-none", genderSelect.value !== "female");
    }
    const thyroidCb = form.querySelector('input[name="health_thyroid"]');
    const diabetesCb = form.querySelector('input[name="health_diabetes"]');
    const pcosCb = form.querySelector('input[name="health_pcos"]');
    if (thyroidFields) thyroidFields.classList.toggle("show", thyroidCb && thyroidCb.checked);
    if (diabetesFields) diabetesFields.classList.toggle("show", diabetesCb && diabetesCb.checked);
    if (pcosFields) pcosFields.classList.toggle("show", pcosCb && pcosCb.checked);
  }
  if (genderSelect) genderSelect.addEventListener("change", toggleConditionalFields);
  radios.forEach((r) => r.addEventListener("change", toggleConditionalFields));
  checkboxes.forEach((cb) => cb.addEventListener("change", toggleConditionalFields));
  toggleConditionalFields();


  // —— Form submit: aggregate healthIssues ———
  form.addEventListener("submit", function (e) {
    updateAge();
    const noMedical = form.querySelector('input[name="healthIssueMain"][value="none"]');
    const issues = [];
    if (noMedical && !noMedical.checked) {
      checkboxes.forEach((cb) => {
        if (cb.checked && cb.name !== "health_other") issues.push(cb.value);
        if (cb.id === "healthOtherCheck" && cb.checked) {
          const t = form.querySelector('input[name="healthOtherText"]');
          if (t?.value?.trim()) issues.push(t.value.trim().toLowerCase());
        }
      });
    }
    let hiddenHealth = form.querySelector('input[name="healthIssues"]');
    if (!hiddenHealth) {
      hiddenHealth = document.createElement("input");
      hiddenHealth.type = "hidden";
      hiddenHealth.name = "healthIssues";
      form.appendChild(hiddenHealth);
    }
    hiddenHealth.value = issues.join(", ");
  });

  // —— Validation (custom only, no browser popups) ———
  function clearStepValidation(stepIndex) {
    const panel = form.querySelector('.step-panel[data-step="' + stepIndex + '"]');
    if (!panel) return;
    panel.querySelectorAll(".form-control, .form-select").forEach((el) => {
      el.classList.remove("is-valid", "is-invalid");
    });
    panel.querySelectorAll(".field-wrap").forEach((w) => w.classList.remove("is-invalid"));
    panel.querySelectorAll(".field-error").forEach((e) => (e.textContent = ""));
  }

  function setInvalid(el, msg) {
    if (!el) return;
    const wrap = el.closest(".field-wrap");
    const errEl = wrap?.querySelector(".field-error") ?? el.parentElement?.querySelector(".field-error");
    el.classList.remove("is-valid");
    el.classList.add("is-invalid");
    if (wrap) wrap.classList.add("is-invalid");
    if (errEl) errEl.textContent = msg || "This field is required.";
  }

  function setValid(el) {
    if (!el) return;
    const wrap = el.closest(".field-wrap");
    el.classList.remove("is-invalid");
    el.classList.add("is-valid");
    if (wrap) wrap.classList.remove("is-invalid");
    const errEl = wrap?.querySelector(".field-error") ?? el.parentElement?.querySelector(".field-error");
    if (errEl) errEl.textContent = "";
  }

  /** Validate a single field only (used on blur/input) — no bulk validation */
  function validateSingleField(el, stepIndex) {
    if (!el || !el.closest(".step-panel.active")) return;
    const wrap = el.closest(".field-wrap");
    const errEl = wrap?.querySelector(".field-error");

    if (stepIndex === 1) {
      if (el.name === "clientName") {
        if (!el.value?.trim()) { setInvalid(el); return false; }
        setValid(el); return true;
      }
      if (el.name === "clientEmail") {
        if (!el.value?.trim()) { setInvalid(el); return false; }
        if (!EMAIL_RE.test(el.value)) { setInvalid(el, "Please enter a valid email address."); return false; }
        setValid(el); return true;
      }
      if (el.name === "dateOfBirth") {
        if (!el.value?.trim()) { setInvalid(el); return false; }
        setValid(el); return true;
      }
      if (el.name === "gender") {
        if (!el.value) { setInvalid(el); return false; }
        setValid(el); return true;
      }
    }
    if (stepIndex === 3 && el.name === "activityLevel") {
      if (!el.value) { setInvalid(el); return false; }
      setValid(el); return true;
    }
    if (stepIndex === 4) {
      if (el.name === "primaryGoal") {
        if (!el.value) { setInvalid(el); return false; }
        setValid(el); return true;
      }
      if (el.name === "commitment") {
        if (!el.value) { setInvalid(el); return false; }
        setValid(el); return true;
      }
      if (el.name === "healthOtherText" && healthOtherCheck?.checked) {
        const noMedical = form.querySelector('input[name="healthIssueMain"][value="none"]');
        if (noMedical && !noMedical.checked && !el.value?.trim()) { setInvalid(el); return false; }
        setValid(el); return true;
      }
    }
    return true;
  }

  function validateStep(stepIndex) {
    const panel = form.querySelector('.step-panel[data-step="' + stepIndex + '"]');
    if (!panel) return true;
    clearStepValidation(stepIndex);
    let valid = true;
    let firstInvalid = null;

    if (stepIndex === 1) {
      const nameEl = form.querySelector('input[name="clientName"]');
      const emailEl = form.querySelector('input[name="clientEmail"]');
      const dobEl = form.querySelector('input[name="dateOfBirth"]');
      const genderEl = form.querySelector('select[name="gender"]');

      if (!nameEl?.value?.trim()) {
        setInvalid(nameEl);
        if (!firstInvalid) firstInvalid = nameEl;
        valid = false;
      } else setValid(nameEl);

      if (!emailEl?.value?.trim()) {
        setInvalid(emailEl);
        if (!firstInvalid) firstInvalid = emailEl;
        valid = false;
      } else if (!EMAIL_RE.test(emailEl.value)) {
        setInvalid(emailEl, "Please enter a valid email address.");
        if (!firstInvalid) firstInvalid = emailEl;
        valid = false;
      } else setValid(emailEl);

      if (!dobEl?.value?.trim()) {
        setInvalid(dobEl);
        if (!firstInvalid) firstInvalid = dobEl;
        valid = false;
      } else setValid(dobEl);

      if (!genderEl?.value) {
        setInvalid(genderEl);
        if (!firstInvalid) firstInvalid = genderEl;
        valid = false;
      } else setValid(genderEl);
    }

    if (stepIndex === 2) {
      // Step 2: Body Metrics — sliders always have values, no required validation
      valid = true;
    }

    if (stepIndex === 3) {
      const activityEl = form.querySelector('select[name="activityLevel"]');
      if (!activityEl?.value) {
        setInvalid(activityEl);
        if (!firstInvalid) firstInvalid = activityEl;
        valid = false;
      } else setValid(activityEl);
    }

    if (stepIndex === 4) {
      const noMedical = form.querySelector('input[name="healthIssueMain"][value="none"]');
      const goalEl = form.querySelector('select[name="primaryGoal"]');
      const commitmentEl = form.querySelector('select[name="commitment"]');
      const healthOtherTextEl = form.querySelector('input[name="healthOtherText"]');

      if (!goalEl?.value) {
        setInvalid(goalEl);
        if (!firstInvalid) firstInvalid = goalEl;
        valid = false;
      } else setValid(goalEl);

      if (!commitmentEl?.value) {
        setInvalid(commitmentEl);
        if (!firstInvalid) firstInvalid = commitmentEl;
        valid = false;
      } else setValid(commitmentEl);

      if (noMedical && !noMedical.checked && healthOtherCheck?.checked && !healthOtherTextEl?.value?.trim()) {
        setInvalid(healthOtherTextEl);
        if (!firstInvalid) firstInvalid = healthOtherTextEl;
        valid = false;
      } else if (healthOtherTextEl) setValid(healthOtherTextEl);

    }

    if (!valid && firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return valid;
  }

  function isStep4Valid() {
    const goalEl = form.querySelector('select[name="primaryGoal"]');
    const commitmentEl = form.querySelector('select[name="commitment"]');
    if (!goalEl?.value || !commitmentEl?.value) return false;
    const noMedical = form.querySelector('input[name="healthIssueMain"][value="none"]');
    if (noMedical && !noMedical.checked && healthOtherCheck?.checked) {
      const t = form.querySelector('input[name="healthOtherText"]');
      if (!t?.value?.trim()) return false;
    }
    return true;
  }

  function updateSubmitButtonState() {
    if (!submitBtn) return;
    const valid = isStep4Valid();
    submitBtn.disabled = !valid;
    submitBtn.classList.toggle("primary-btn--disabled", !valid);
  }

  form.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("blur", () => {
      if (el.closest(".step-panel.active")) validateSingleField(el, step);
    });
    el.addEventListener("input", () => {
      if (el.closest(".step-panel.active")) {
        validateSingleField(el, step);
        if (step === 4) updateSubmitButtonState();
      }
    });
    el.addEventListener("change", () => {
      if (el.closest(".step-panel.active")) {
        validateSingleField(el, step);
        if (step === 4) updateSubmitButtonState();
        toggleHealthCheckboxes();
      }
    });
  });

  function updateStepper(current) {
    stepperBars.forEach((bar, idx) => {
      bar.style.width = idx < current ? "100%" : "0%";
    });
    if (stepLabel) stepLabel.textContent = `Step ${current} of ${totalSteps}`;
  }

  function showStep(index) {
    const nextPanel = form.querySelector('.step-panel[data-step="' + index + '"]');
    const currentPanel = form.querySelector(".step-panel.active");
    if (currentPanel === nextPanel) return;

    if (currentPanel) {
      if (typeof gsap !== "undefined") {
        gsap.to(currentPanel, {
          opacity: 0,
          y: -8,
          duration: 0.25,
          onComplete: function () {
            currentPanel.classList.remove("active");
            currentPanel.style.opacity = "1";
            currentPanel.style.transform = "none";
          }
        });
      } else {
        currentPanel.classList.remove("active");
      }
    }
    if (nextPanel) {
      nextPanel.classList.add("active");
      if (typeof gsap !== "undefined") {
        nextPanel.style.opacity = "0";
        nextPanel.style.transform = "translateY(8px)";
        gsap.to(nextPanel, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
      }
    }
    updateStepper(index);

    // Back button: hidden on Step 1, visible from Step 2 onward
    if (prevBtn) {
      prevBtn.style.display = index === 1 ? "none" : "inline-flex";
      prevBtn.disabled = index === 1;
    }
    if (nextBtn) nextBtn.style.display = index === totalSteps ? "none" : "inline-flex";
    if (submitBtn) submitBtn.style.display = index === totalSteps ? "inline-flex" : "none";
    if (index === 4) updateSubmitButtonState();
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (step > 1) {
        step -= 1;
        showStep(step);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (!validateStep(step)) return;
      if (step < totalSteps) {
        step += 1;
        showStep(step);
      }
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateStep(4)) return;
    updateAge();

    const fd = new FormData(form);
    const raw = Object.fromEntries(fd.entries());
    var pcosSymptoms = [];
    form.querySelectorAll('input[name="pcos_symptom"]:checked').forEach(function (cb) {
      pcosSymptoms.push(cb.value);
    });
    var assessmentData = {
      clientName: String(raw.clientName || "").trim(),
      clientEmail: String(raw.clientEmail || "").trim(),
      dateOfBirth: String(raw.dateOfBirth || "").trim(),
      age: raw.age ? String(raw.age).trim() : "",
      gender: String(raw.gender || "male").trim(),
      height: String(raw.height || "172").trim(),
      weight: String(raw.weight || "78").trim(),
      targetWeight: String(raw.targetWeight || raw.weight || "70").trim(),
      activityLevel: String(raw.activityLevel || "").trim(),
      sleepQuality: String(raw.sleepQuality || "").trim(),
      stressLevel: String(raw.stressLevel || "").trim(),
      healthIssues: String(raw.healthIssues || "").trim(),
      primaryGoal: String(raw.primaryGoal || "").trim(),
      dietPreferences: String(raw.dietPreferences || "").trim(),
      foodAllergies: String(raw.dietRestrictionText || "").trim(),
      commitment: String(raw.commitment || "").trim(),
      obstacles: String(raw.obstacles || "").trim(),
      menstrualCycle: String(raw.menstrualCycle || "").trim(),
      thyroidType: String(raw.thyroidType || "").trim(),
      tshLevel: String(raw.tshLevel || "").trim(),
      hba1cLevel: String(raw.hba1cLevel || "").trim(),
      fastingSugar: String(raw.fastingSugar || "").trim(),
      pcosSymptoms: pcosSymptoms,
      insulinResistance: String(raw.insulinResistance || "").trim(),
      dietRestrictionText: String(raw.dietRestrictionText || "").trim()
    };
    if (!assessmentData.clientName || !assessmentData.clientEmail || !assessmentData.primaryGoal) return;

    try {
      localStorage.setItem("assessmentData", JSON.stringify(assessmentData));
      sessionStorage.setItem("assessmentData", JSON.stringify(assessmentData));
      if (typeof window.saveAssessment === "function") {
        window.saveAssessment(assessmentData);
      }
    } catch (err) {
      try {
        localStorage.setItem("assessmentData", JSON.stringify(assessmentData));
      } catch (e2) {}
    }

    if (loadingOverlay) {
      loadingOverlay.classList.remove("d-none");
      loadingOverlay.style.display = "flex";
    }
    if (lottieContainer && typeof lottie !== "undefined") {
      try {
        lottie.loadAnimation({
          container: lottieContainer,
          renderer: "svg",
          loop: true,
          autoplay: true,
          path: "https://assets2.lottiefiles.com/packages/lf20_yygyqnwk.json"
        });
      } catch (err) {}
    }

    setTimeout(function () {
      // Redirect to ultra dashboard (updated 2024)
      window.location.href = "journey-ultra.html";
    }, 3000);
  });

  updateStepper(1);
  showStep(1);
})();
