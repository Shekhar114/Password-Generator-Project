document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const bulkDisplay = document.getElementById("bulk-display");
  const refreshBtn = document.getElementById("refresh-btn");
  const copyBtn = document.getElementById("copy-btn");
  const crackTimeDisplay = document.getElementById("crack-time");
  const strengthBadge = document.querySelector(".badge-strong"); // Added for dynamic strength

  // Steppers
  const lengthVal = document.getElementById("length-val");
  const lengthDec = document.getElementById("length-dec");
  const lengthInc = document.getElementById("length-inc");

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

  // Stepper Logic
  function handleStepper(inputEl, decrementBtn, incrementBtn) {
    decrementBtn.addEventListener("click", () => {
      let val = parseInt(inputEl.value);
      if (val > parseInt(inputEl.min)) {
        inputEl.value = val - 1;
        generateBulkPasswords();
      }
    });

    incrementBtn.addEventListener("click", () => {
      let val = parseInt(inputEl.value);
      if (val < parseInt(inputEl.max)) {
        inputEl.value = val + 1;
        generateBulkPasswords();
      }
    });
  }

  handleStepper(lengthVal, lengthDec, lengthInc);
  handleStepper(qtyVal, qtyDec, qtyInc);

  // Global strength variable to tie both badge and crack time together
  let strengthText = "";

  // Dynamic Strength Badge Logic
  function updateStrengthBadge(length) {
    let checkedCount = 0;
    if (cbUpper.checked) checkedCount++;
    if (cbLower.checked) checkedCount++;
    if (cbDigits.checked) checkedCount++;
    if (cbSpecial.checked) checkedCount++;

    const shieldSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`;

    // 1. Bad: Length is under 8 chars OR nothing is checked (relying on default fallback)
    if (length < 8 || checkedCount === 0) {
      strengthText = "Bad";
    }
    // 2. Very Strong: All 4 character types checked AND length > 50
    else if (checkedCount === 4 && length > 50) {
      strengthText = "Very Strong";
    }
    // 3. Strong: At least 2 checkboxes checked AND length >= 16
    else if (checkedCount >= 2 && length >= 16) {
      strengthText = "Strong";
    }
    // 4. Weak: Length is short (8-11) or only 1 character type is checked
    else if (length < 12 || checkedCount === 1) {
      strengthText = "Weak";
    }
    // 5. Good: Any other valid combination
    else {
      strengthText = "Good";
    }

    if (strengthBadge) {
      strengthBadge.innerHTML = `${shieldSvg} ${strengthText}`;
    }
  }

  // Rough Crack Time Estimation (Strictly mapped to strengthText)
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
        estimate = "180 days";
        break;
      case "Strong":
        estimate = "Centuries";
        break;
      case "Very Strong":
        estimate = "Millennia";
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
    const length = parseInt(lengthVal.value);
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

    // If user unchecked everything, default to lowercase behind the scenes
    if (charPool.length === 0) {
      charPool = CHAR_SETS.lower;
      activeSets.push(CHAR_SETS.lower);
      // UI remains untouched (no checkboxes will show as checked)
    }

    // Exclude ambiguous characters
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

      // Add to DOM
      const pwdElement = document.createElement("div");
      pwdElement.className = "pwd-item";
      pwdElement.textContent = newPassword;
      bulkDisplay.appendChild(pwdElement);
    }

    // Ensure Strength evaluates BEFORE Crack Time is requested
    updateStrengthBadge(length);
    updateCrackTime();
  }

  // Copy to Clipboard (All Passwords)
  copyBtn.addEventListener("click", () => {
    if (generatedPasswordsList.length === 0) return;

    // Join with newlines for easy pasting into Excel, text files, etc.
    const allPasswordsText = generatedPasswordsList.join("\n");

    navigator.clipboard.writeText(allPasswordsText).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 1000);
    });
  });

  // Event Listeners for controls
  [cbUpper, cbLower, cbDigits, cbSpecial, cbExclude].forEach((checkbox) => {
    checkbox.addEventListener("change", generateBulkPasswords);
  });

  refreshBtn.addEventListener("click", generateBulkPasswords);

  // Initial Generation
  generateBulkPasswords();
});
