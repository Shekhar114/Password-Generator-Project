document.addEventListener("DOMContentLoaded", () => {

  // DOM Elements
  const passwordDisplay = document.getElementById("password-display");
  const refreshBtn = document.getElementById("refresh-btn");
  const copyBtn = document.getElementById("copy-btn");
  const crackTimeDisplay = document.getElementById("crack-time");
  const strengthBadge = document.querySelector(".badge");

  // Slider
  const lengthSlider = document.getElementById("length-slider");
  const sliderTooltip = document.getElementById("slider-tooltip");

  // Checkboxes
  const cbUpper = document.getElementById("cb-upper");
  const cbLower = document.getElementById("cb-lower");
  const cbDigits = document.getElementById("cb-digits");
  const cbSpecial = document.getElementById("cb-special");
  const cbExclude = document.getElementById("cb-exclude");

  // Character Sets
  const CHAR_SETS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    digits: "0123456789",
    special: "#@*!$%^&()-=_+[]{}|;:,.<>?",
    ambiguous: "0Oo1l|I",
  };

  let strengthText = "";

  // =========================
  // PASSWORD GENERATOR
  // =========================
  function generatePassword() {
    const length = parseInt(lengthSlider.value);
    let charPool = "";
    let password = "";
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

    if (charPool.length === 0) {
      charPool = CHAR_SETS.lower;
      activeSets.push(CHAR_SETS.lower);
    }

    // Remove ambiguous
    if (cbExclude.checked) {
      const amb = CHAR_SETS.ambiguous.split("");
      charPool = charPool.split("").filter(c => !amb.includes(c)).join("");

      activeSets = activeSets.map(set =>
        set.split("").filter(c => !amb.includes(c)).join("")
      );
    }

    // Ensure each set used
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
    password = password.split("").sort(() => 0.5 - Math.random()).join("");

    passwordDisplay.value = password;

    updateStrength(length);
    updateCrackTime();
  }

  // =========================
  // STRENGTH LOGIC
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
      case "Strong": time = "100+ Years"; break;
      case "Very Strong": time = "Centuries"; break;
      default: time = "Unknown";
    }

    // crackTimeDisplay.textContent = "Estimated Time to Crack : " + time;
    crackTimeDisplay.innerHTML = "Estimated Time to Crack : <strong>" + time + "</strong>";
  }

  // =========================
  // SLIDER VISUAL
  // =========================
  function updateSlider() {
    const value = lengthSlider.value;
    const min = lengthSlider.min;
    const max = lengthSlider.max;

    const percent = ((value - min) / (max - min)) * 100;

    // Fill track
    lengthSlider.style.background =
      `linear-gradient(to right, #ffffff ${percent}%, #333333 ${percent}%)`;

    // Tooltip text
    sliderTooltip.textContent = "Length " + value;

    // Tooltip position FIXED PERFECT
    const sliderWidth = lengthSlider.offsetWidth;
    const thumbWidth = 20;

    const position = (percent / 100) * (sliderWidth - thumbWidth) + thumbWidth / 2;

    sliderTooltip.style.left = position + "px";

    generatePassword();
  }

  // =========================
  // EVENTS
  // =========================
  lengthSlider.addEventListener("input", updateSlider);

  [cbUpper, cbLower, cbDigits, cbSpecial, cbExclude].forEach(cb => {
    cb.addEventListener("change", generatePassword);
  });

  refreshBtn.addEventListener("click", generatePassword);

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(passwordDisplay.value);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1000);
  });

  // =========================
  // PERFECT INITIAL LOAD
  // =========================
  window.addEventListener("load", () => {
    requestAnimationFrame(() => {
      lengthSlider.value = 16;
      updateSlider();
    });
  });

});