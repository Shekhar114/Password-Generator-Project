document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const passwordDisplay = document.getElementById("password-display");
  const refreshBtn = document.getElementById("refresh-btn");
  const copyBtn = document.getElementById("copy-btn");
  const crackTimeDisplay = document.getElementById("crack-time");
  const strengthBadge = document.querySelector(".badge-strong"); // Added to target the strength badge

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

  // Stepper Logic
  function handleStepper(inputEl, decrementBtn, incrementBtn) {
    decrementBtn.addEventListener("click", () => {
      let val = parseInt(inputEl.value);
      if (val > parseInt(inputEl.min)) {
        inputEl.value = val - 1;
        generatePassword();
      }
    });

    incrementBtn.addEventListener("click", () => {
      let val = parseInt(inputEl.value);
      if (val < parseInt(inputEl.max)) {
        inputEl.value = val + 1;
        generatePassword();
      }
    });
  }

  handleStepper(lengthVal, lengthDec, lengthInc);
  handleStepper(qtyVal, qtyDec, qtyInc);

  // Dynamic Strength Badge Logic
  function updateStrengthBadge(length) {
    let strengthText = "";
    // Keeping the shield icon
    const shieldSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`;

    if (length < 8) {
      strengthText = "Weak";
    } else if (length < 13) {
      strengthText = "Good";
    } else if (length < 16) {
      strengthText = "Strong";
    } else {
      strengthText = "Very Strong";
    }

    strengthBadge.innerHTML = `${shieldSvg} ${strengthText}`;
  }

  // Generator Logic
  function generatePassword() {
    const length = parseInt(lengthVal.value);
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

    // Prevent generating if no sets are selected
    if (charPool.length === 0) {
        passwordDisplay.value = "Please select options";
    //   passwordDisplay.value = password;
      return;
    }

    // Exclude ambiguous characters if checked
    if (cbExclude.checked) {
      const ambiguousArray = CHAR_SETS.ambiguous.split("");
      charPool = charPool
        .split("")
        .filter((char) => !ambiguousArray.includes(char))
        .join("");

      // Re-filter active sets so guaranteed chars aren't ambiguous
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

    // Shuffle the password so the guaranteed characters aren't always at the front
    password = password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

    passwordDisplay.value = password;
    updateCrackTime(length, activeSets.length);
    updateStrengthBadge(length); // Update the strength badge text dynamically
  }

  // Rough Crack Time Estimation
  function updateCrackTime(length, setsCount) {
    let estimate = "";
    if (length < 8) estimate = "Instantly";
    else if (length <= 10 && setsCount <= 2) estimate = "Days";
    else if (length <= 14) estimate = "Years";
    else estimate = "Centuries";

    crackTimeDisplay.textContent = `Estimated Time to Crack: ${estimate}`;
  }

  // Copy to Clipboard
  copyBtn.addEventListener("click", () => {
    if (
      !passwordDisplay.value ||
      passwordDisplay.value === "Please select options"
    )
      return;

    navigator.clipboard.writeText(passwordDisplay.value).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 1000);
    });
  });

  // Event Listeners for controls
  [cbUpper, cbLower, cbDigits, cbSpecial, cbExclude].forEach((checkbox) => {
    checkbox.addEventListener("change", generatePassword);
  });

  refreshBtn.addEventListener("click", generatePassword);

  // Initial Generation
  generatePassword();
});
