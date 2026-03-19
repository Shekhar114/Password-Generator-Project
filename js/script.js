document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const passwordDisplay = document.getElementById("password-display");
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

  // Redirect Logic for Quantity (Number of Passwords)
  qtyInc.addEventListener("click", () => {
    window.location.href = "bulk-index.html";
  });

  qtyDec.addEventListener("click", () => {
    qtyVal.value = 1; // Keep at 1
  });

  // Global strength variable
  let strengthText = "";

  // Dynamic Strength Badge Logic 
  function updateStrengthBadge(length) {
    let checkedCount = 0;
    if (cbUpper.checked) checkedCount++;
    if (cbLower.checked) checkedCount++;
    if (cbDigits.checked) checkedCount++;
    if (cbSpecial.checked) checkedCount++;

    const shieldSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`;

    // Evaluate Strength Level
    if (length < 8 || checkedCount === 0) {
      strengthText = "Bad";
    }
    else if (checkedCount === 4 && length >= 20) {
      strengthText = "Very Strong";
    }
    else if (checkedCount >= 2 && length >= 16) {
      strengthText = "Strong";
    }
    else if (length < 12 || checkedCount === 1) {
      strengthText = "Weak";
    }
    else {
      strengthText = "Good";
    }

    // Update the Text and Icon
    if(strengthBadge) {
      strengthBadge.innerHTML = `${shieldSvg} ${strengthText}`;

      // Reset any dynamic classes previously added
      strengthBadge.classList.remove("badge-bad", "badge-weak", "badge-good", "badge-strong", "badge-very-strong");

      // Apply the correct class based on the text
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

  // Generator Logic
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

    // Default Fallback
    if (charPool.length === 0) {
      charPool = CHAR_SETS.lower;
      activeSets.push(CHAR_SETS.lower);
    }

    // Exclude ambiguous characters if checked
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

    // Guarantee at least one character from each selected set
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

    // Shuffle the password
    password = password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

    passwordDisplay.value = password;

    // Evaluate Strength and Update UI
    updateStrengthBadge(length);
    updateCrackTime(); 
  }

  // --- SLIDER & BUTTON LOGIC ---
  
  // Visual update logic for the slider
  function updateSliderVisuals() {
    lengthDisplayText.textContent = lengthSlider.value;
    
    // Calculate percentage for the white background fill
    const percentage = ((lengthSlider.value - lengthSlider.min) / (lengthSlider.max - lengthSlider.min)) * 100;
    
    // Create the white line fill effect
    lengthSlider.style.background = `linear-gradient(to right, #ffffff ${percentage}%, #333333 ${percentage}%)`;
    
    // Generate new password
    generatePassword();
  }

  // Listen for manual slider drags
  lengthSlider.addEventListener("input", updateSliderVisuals);

  // Minus Button Click
  sliderDecBtn.addEventListener("click", () => {
    let currentValue = parseInt(lengthSlider.value);
    let min = parseInt(lengthSlider.min);
    
    if (currentValue > min) {
      lengthSlider.value = currentValue - 1;
      updateSliderVisuals();
    }
  });

  // Plus Button Click
  sliderIncBtn.addEventListener("click", () => {
    let currentValue = parseInt(lengthSlider.value);
    let max = parseInt(lengthSlider.max);
    
    if (currentValue < max) {
      lengthSlider.value = currentValue + 1;
      updateSliderVisuals();
    }
  });

  // Copy to Clipboard
  copyBtn.addEventListener("click", () => {
    if (!passwordDisplay.value) return;

    navigator.clipboard.writeText(passwordDisplay.value).then(() => {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `Copied! <i class="fa-solid fa-check"></i>`;
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 1000);
    });
  });

  // Event Listeners for checkboxes
  [cbUpper, cbLower, cbDigits, cbSpecial, cbExclude].forEach((checkbox) => {
    checkbox.addEventListener("change", generatePassword);
  });

  refreshBtn.addEventListener("click", generatePassword);

  // Initial setup on load
  updateSliderVisuals();
});