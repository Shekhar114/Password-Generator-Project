document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const passwordDisplay = document.getElementById("password-display");
  const refreshBtn = document.getElementById("refresh-btn");
  const copyBtn = document.getElementById("copy-btn");
  const crackTimeDisplay = document.getElementById("crack-time");
  const strengthBadge = document.querySelector(".badge-strong");

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

  // Stepper Logic for Length
  function handleLengthStepper() {
    lengthDec.addEventListener("click", () => {
      let val = parseInt(lengthVal.value);
      if (val > parseInt(lengthVal.min)) {
        lengthVal.value = val - 1;
        generatePassword();
      }
    });

    lengthInc.addEventListener("click", () => {
      let val = parseInt(lengthVal.value);
      if (val < parseInt(lengthVal.max)) {
        lengthVal.value = val + 1;
        generatePassword();
      }
    });
  }
  handleLengthStepper();

  // Redirect Logic for Quantity (Number of Passwords)
  qtyInc.addEventListener("click", () => {
    // Redirect to the bulk generator page when trying to increase past 1
    window.location.href = "bulk-index.html";
  });

  qtyDec.addEventListener("click", () => {
    // Keep at 1, since this is the single password generator page
    qtyVal.value = 1;
  });

  // Dynamic Strength Badge Logic
  let strengthText = "";
  function updateStrengthBadge(length) {
    let checkedCount = 0;
    if (cbUpper.checked) checkedCount++;
    if (cbLower.checked) checkedCount++;
    if (cbDigits.checked) checkedCount++;
    if (cbSpecial.checked) checkedCount++;

    // let strengthText = "";
    const shieldSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`;

    if (checkedCount === 0) {
      strengthText = "Bad";
    }
    // 1. Weak: Nothing checked OR length is too short (< 8)
    else if (checkedCount === 0 || length < 8) {
      strengthText = "Weak";
    }
    // 2. Very Strong: All 4 character type checkboxes checked AND length > 50
    else if (checkedCount === 4 && length > 50) {
      strengthText = "Very Strong";
    }
    // 3. Strong: At least 2 checkboxes checked AND length >= 12
    else if (checkedCount >= 2 && length >= 16) {
      strengthText = "Strong";
    }
    // 4. Good: Any other valid combination
    else {
      strengthText = "Good";
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

    // Default Fallback: If no sets are selected, generate a lowercase password anyway
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
    if (strengthText.match("Bad")) estimate = "few Seconds";
    else if (length < 8) estimate = "8 Minutes";
    else if (length < 16 && strengthText.match("Good")) estimate = "180 days";
    else if ((length) => 16 && length < 50) estimate = "Centuries";
    else estimate = "Centuries";

    crackTimeDisplay.textContent = `Estimated Time to Crack: ${estimate}`;
  }

  // Copy to Clipboard
  copyBtn.addEventListener("click", () => {
    if (!passwordDisplay.value) return;

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
