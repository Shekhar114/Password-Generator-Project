document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const bulkDisplay = document.getElementById("bulk-display");
  const refreshBtn = document.getElementById("refresh-btn");
  const copyBtn = document.getElementById("copy-btn");
  const crackTimeDisplay = document.getElementById("crack-time");
  const strengthBadge = document.querySelector(".badge-strong") || document.querySelector(".badge"); 

  // Slider Elements
  const lengthSlider = document.getElementById("length-slider");
  const lengthDisplayText = document.getElementById("length-display-text");
  const sliderDecBtn = document.getElementById("slider-dec");
  const sliderIncBtn = document.getElementById("slider-inc");

  // Quantity Stepper
  const qtyVal = document.getElementById("qty-val");
  const qtyDec = document.getElementById("qty-dec");
  const qtyInc = document.getElementById("qty-inc");

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

  let generatedPasswordsList = [];

  // Quantity Stepper Logic
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

  // Global strength variable to tie both badge and crack time together
  let strengthText = "";

  // Dynamic Strength Badge Logic (WITH COLORS)
  function updateStrengthBadge(length) {
    let checkedCount = 0;
    if (cbUpper.checked) checkedCount++;
    if (cbLower.checked) checkedCount++;
    if (cbDigits.checked) checkedCount++;
    if (cbSpecial.checked) checkedCount++;

    const shieldSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`;

    if (length < 8 || checkedCount === 0) {
      strengthText = "Bad";
    } else if (checkedCount === 4 && length >= 20) {
      strengthText = "Very Strong";
    } else if (checkedCount >= 2 && length >= 16) {
      strengthText = "Strong";
    } else if (length < 12 || checkedCount === 1) {
      strengthText = "Weak";
    } else {
      strengthText = "Good";
    }

    if (strengthBadge) {
      strengthBadge.innerHTML = `${shieldSvg} ${strengthText}`;

      // Color Logic
      strengthBadge.classList.remove("badge-bad", "badge-weak", "badge-good", "badge-strong", "badge-very-strong");

      if (strengthText === "Bad" || strengthText === "Weak") {
          strengthBadge.classList.add("badge-weak");
      } else if (strengthText === "Good") {
          strengthBadge.classList.add("badge-good");
      } else if (strengthText === "Strong") {
          strengthBadge.classList.add("badge-strong");
      } else if (strengthText === "Very Strong") {
          strengthBadge.classList.add("badge-very-strong");
      }
    }
  }

  // Rough Crack Time Estimation
  function updateCrackTime() {
    let estimate = "";

    switch (strengthText) {
      case "Bad":
        estimate = "A few seconds";
        break;
      case "Weak":
        estimate = "8 Minutes";
        break;
      case "Good":
        estimate = "2 Years";
        break;
      case "Strong":
        estimate = "150 Years";
        break;
      case "Very Strong":
        estimate = "Centuries";
        break;
      default:
        estimate = "Unknown";
    }

    crackTimeDisplay.textContent = `Estimated Time to Crack: ${estimate}`;
  }

  // Single Password Generator
  function createSinglePassword(length, charPool, activeSets) {
    let password = "";

    // Ensure at least one char from each active set
    activeSets.forEach((set) => {
      if (set.length > 0 && password.length < length) {
        const randomChar = set[Math.floor(Math.random() * set.length)];
        password += randomChar;
      }
    });

    // Fill the rest randomly
    while (password.length < length) {
      const randomChar = charPool[Math.floor(Math.random() * charPool.length)];
      password += randomChar;
    }

    // Shuffle the characters
    return password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
  }

  // Bulk Generator Logic
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

    if (charPool.length === 0) {
      charPool = CHAR_SETS.lower;
      activeSets.push(CHAR_SETS.lower);
    }

    if (cbExclude.checked) {
      const ambiguousArray = CHAR_SETS.ambiguous.split("");
      charPool = charPool
        .split("")
        .filter((char) => !ambiguousArray.includes(char))
        .join("");

      activeSets = activeSets.map((set) =>
        set
          .split("")
          .filter((char) => !ambiguousArray.includes(char))
          .join(""),
      );
    }

    generatedPasswordsList = [];
    bulkDisplay.innerHTML = ""; // Clear previous

    for (let i = 0; i < qty; i++) {
      const newPassword = createSinglePassword(length, charPool, activeSets);
      generatedPasswordsList.push(newPassword);

      const pwdElement = document.createElement("div");
      pwdElement.className = "pwd-item";
      pwdElement.textContent = newPassword;
      bulkDisplay.appendChild(pwdElement);
    }

    updateStrengthBadge(length);
    updateCrackTime();
  }

  // --- SLIDER & BUTTON LOGIC ---
  function updateSliderVisuals() {
    lengthDisplayText.textContent = lengthSlider.value;
    
    // Calculate percentage for the white background fill
    const percentage = ((lengthSlider.value - lengthSlider.min) / (lengthSlider.max - lengthSlider.min)) * 100;
    
    lengthSlider.style.background = `linear-gradient(to right, #ffffff ${percentage}%, #333333 ${percentage}%)`;
    
    generateBulkPasswords();
  }

  lengthSlider.addEventListener("input", updateSliderVisuals);

  sliderDecBtn.addEventListener("click", () => {
    let currentValue = parseInt(lengthSlider.value);
    let min = parseInt(lengthSlider.min);
    if (currentValue > min) {
      lengthSlider.value = currentValue - 1;
      updateSliderVisuals();
    }
  });

  sliderIncBtn.addEventListener("click", () => {
    let currentValue = parseInt(lengthSlider.value);
    let max = parseInt(lengthSlider.max);
    if (currentValue < max) {
      lengthSlider.value = currentValue + 1;
      updateSliderVisuals();
    }
  });

  // Copy to Clipboard (All Passwords)
  copyBtn.addEventListener("click", () => {
    if (generatedPasswordsList.length === 0) return;

    // Join with newlines
    const allPasswordsText = generatedPasswordsList.join("\n");

    navigator.clipboard.writeText(allPasswordsText).then(() => {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `Copied! <i class="fa-solid fa-check"></i>`;
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 1500);
    });
  });

  // Event Listeners for checkboxes
  [cbUpper, cbLower, cbDigits, cbSpecial, cbExclude].forEach((checkbox) => {
    checkbox.addEventListener("change", generateBulkPasswords);
  });

  refreshBtn.addEventListener("click", generateBulkPasswords);

  // Initial setup on load
  updateSliderVisuals();
});