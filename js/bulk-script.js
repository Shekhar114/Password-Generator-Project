document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // DOM ELEMENTS
  // =========================
  const bulkDisplay = document.getElementById("bulk-display");
  const refreshBtn = document.getElementById("refresh-btn");
  const copyBtn = document.getElementById("copy-btn");
  const crackTimeDisplay = document.getElementById("crack-time");
  const strengthBadge = document.querySelector(".badge");

  const lengthSlider = document.getElementById("length-slider");
  const lengthDisplayText = document.getElementById("length-display-text");
  const sliderTooltip = document.getElementById("slider-tooltip");

  const qtyVal = document.getElementById("qty-val");
  const qtyDec = document.getElementById("qty-dec");
  const qtyInc = document.getElementById("qty-inc");

  const cbUpper = document.getElementById("cb-upper");
  const cbLower = document.getElementById("cb-lower");
  const cbDigits = document.getElementById("cb-digits");
  const cbSpecial = document.getElementById("cb-special");
  const cbExclude = document.getElementById("cb-exclude");

  // =========================
  // CHARACTER SETS
  // =========================
  const CHAR_SETS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    digits: "0123456789",
    special: "#@*!$%^&()-=_+[]{}|;:,.<>?",
    ambiguous: "0Oo1l|I",
  };

  let generatedPasswordsList = [];
  let strengthText = "";

  // =========================
  // QUANTITY CONTROL
  // =========================
  qtyDec.addEventListener("click", () => {
    let val = parseInt(qtyVal.value);
    if (val > parseInt(qtyVal.min)) {
      qtyVal.value = val - 1;
      generateBulkPasswords();
    }
  });

  qtyInc.addEventListener("click", () => {
    let val = parseInt(qtyVal.value);
    if (val < parseInt(qtyVal.max)) {
      qtyVal.value = val + 1;
      generateBulkPasswords();
    }
  });

  // =========================
  // PASSWORD GENERATOR
  // =========================
  function createPassword(length, charPool, activeSets) {
    let password = "";

    // Ensure each selected type included
    activeSets.forEach(set => {
      if (set.length > 0 && password.length < length) {
        password += set[Math.floor(Math.random() * set.length)];
      }
    });

    // Fill remaining
    while (password.length < length) {
      password += charPool[Math.floor(Math.random() * charPool.length)];
    }

    // Shuffle
    return password.split("").sort(() => 0.5 - Math.random()).join("");
  }

  // =========================
  // BULK GENERATION
  // =========================
  function generateBulkPasswords() {
    const length = parseInt(lengthSlider.value);
    const qty = parseInt(qtyVal.value);

    let charPool = "";
    let activeSets = [];

    if (cbUpper.checked) {
      charPool += CHAR_SETS.upper;
      activeSets.push(CHAR_SETS.upper);
    }
    if (cbLower.checked) {
      charPool += CHAR_SETS.lower;
      activeSets.push(CHAR_SETS.lower);
    }
    if (cbDigits.checked) {
      charPool += CHAR_SETS.digits;
      activeSets.push(CHAR_SETS.digits);
    }
    if (cbSpecial.checked) {
      charPool += CHAR_SETS.special;
      activeSets.push(CHAR_SETS.special);
    }

    // Fallback
    if (charPool.length === 0) {
      charPool = CHAR_SETS.lower;
      activeSets.push(CHAR_SETS.lower);
    }

    // Remove confusing chars
    if (cbExclude.checked) {
      const amb = CHAR_SETS.ambiguous.split("");

      charPool = charPool.split("").filter(c => !amb.includes(c)).join("");

      activeSets = activeSets.map(set =>
        set.split("").filter(c => !amb.includes(c)).join("")
      );
    }

    generatedPasswordsList = [];
    bulkDisplay.innerHTML = "";

    // Generate passwords
    for (let i = 0; i < qty; i++) {
      const pwd = createPassword(length, charPool, activeSets);
      generatedPasswordsList.push(pwd);

      const div = document.createElement("div");
      div.className = "pwd-item";
      div.textContent = pwd;

      bulkDisplay.appendChild(div);
    }

    updateStrength(length);
    updateCrackTime();
  }

  // =========================
  // STRENGTH
  // =========================
  function updateStrength(length) {
    let count = 0;
    if (cbUpper.checked) count++;
    if (cbLower.checked) count++;
    if (cbDigits.checked) count++;
    if (cbSpecial.checked) count++;

    if (length < 8 || count === 0) strengthText = "Weak";
    else if (count === 4 && length >= 20) strengthText = "Very Strong";
    else if (count >= 2 && length >= 16) strengthText = "Strong";
    else strengthText = "Good";

    strengthBadge.textContent = strengthText;
    strengthBadge.className = "badge";

    if (strengthText === "Weak") strengthBadge.classList.add("badge-weak");
    if (strengthText === "Good") strengthBadge.classList.add("badge-good");
    if (strengthText === "Strong") strengthBadge.classList.add("badge-strong");
    if (strengthText === "Very Strong") strengthBadge.classList.add("badge-very-strong");
  }

  // =========================
  // CRACK TIME
  // =========================
  function updateCrackTime() {
    let time = "";

    switch (strengthText) {
      case "Weak": time = "Minutes"; break;
      case "Good": time = "Years"; break;
      case "Strong": time = "150+ Years"; break;
      case "Very Strong": time = "Centuries"; break;
      default: time = "Unknown";
    }

    crackTimeDisplay.textContent = "Estimated Time: " + time;
  }

  // =========================
  // SLIDER UI (FIXED PERFECT)
  // =========================
  function updateSlider() {
    const value = lengthSlider.value;
    const min = lengthSlider.min;
    const max = lengthSlider.max;

    const percent = ((value - min) / (max - min)) * 100;

    // Track fill
    lengthSlider.style.background =
      `linear-gradient(to right, #ffffff ${percent}%, #333333 ${percent}%)`;

    // Tooltip text
    sliderTooltip.textContent = "Length " + value;

    // Perfect positioning
    const sliderWidth = lengthSlider.offsetWidth;
    const thumbWidth = 20;

    const position = (percent / 100) * (sliderWidth - thumbWidth) + thumbWidth / 2;
    sliderTooltip.style.left = position + "px";

    if (lengthDisplayText) lengthDisplayText.textContent = value;

    generateBulkPasswords();
  }

  // =========================
  // EVENTS
  // =========================
  lengthSlider.addEventListener("input", updateSlider);

  [cbUpper, cbLower, cbDigits, cbSpecial, cbExclude].forEach(cb => {
    cb.addEventListener("change", generateBulkPasswords);
  });

  refreshBtn.addEventListener("click", generateBulkPasswords);

  // Copy all passwords
  copyBtn.addEventListener("click", () => {
    if (generatedPasswordsList.length === 0) return;

    const text = generatedPasswordsList.join("\n");

    navigator.clipboard.writeText(text);

    copyBtn.textContent = "Copied!";
    setTimeout(() => copyBtn.textContent = "Copy", 1200);
  });

  // =========================
  // INITIAL LOAD FIX
  // =========================
  window.addEventListener("load", () => {
    requestAnimationFrame(() => {
      lengthSlider.value = 16;
      updateSlider();
    });
  });

});