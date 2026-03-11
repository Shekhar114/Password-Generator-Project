document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const bulkDisplay = document.getElementById('bulk-display');
    const refreshBtn = document.getElementById('refresh-btn');
    const copyBtn = document.getElementById('copy-btn');
    const crackTimeDisplay = document.getElementById('crack-time');
    
    // Steppers
    const lengthVal = document.getElementById('length-val');
    const lengthDec = document.getElementById('length-dec');
    const lengthInc = document.getElementById('length-inc');
    
    const qtyVal = document.getElementById('qty-val');
    const qtyDec = document.getElementById('qty-dec');
    const qtyInc = document.getElementById('qty-inc');

    // Checkboxes
    const cbUpper = document.getElementById('cb-upper');
    const cbLower = document.getElementById('cb-lower');
    const cbDigits = document.getElementById('cb-digits');
    const cbSpecial = document.getElementById('cb-special');
    const cbExclude = document.getElementById('cb-exclude');

    // Character Sets
    const CHAR_SETS = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        digits: '0123456789',
        special: '#@*!$%^&()-=_+[]{}|;:,.<>?',
        ambiguous: '0Oo1l|I'
    };

    let generatedPasswordsList = [];

    // Stepper Logic
    function handleStepper(inputEl, decrementBtn, incrementBtn) {
        decrementBtn.addEventListener('click', () => {
            let val = parseInt(inputEl.value);
            if (val > parseInt(inputEl.min)) {
                inputEl.value = val - 1;
                generateBulkPasswords();
            }
        });
        
        incrementBtn.addEventListener('click', () => {
            let val = parseInt(inputEl.value);
            if (val < parseInt(inputEl.max)) {
                inputEl.value = val + 1;
                generateBulkPasswords();
            }
        });
    }

    handleStepper(lengthVal, lengthDec, lengthInc);
    handleStepper(qtyVal, qtyDec, qtyInc);

    // Single Password Generator
    function createSinglePassword(length, charPool, activeSets) {
        let password = '';
        
        // Ensure at least one char from each active set
        activeSets.forEach(set => {
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
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }

    // Bulk Generator Logic
    function generateBulkPasswords() {
        const length = parseInt(lengthVal.value);
        const qty = parseInt(qtyVal.value);
        let charPool = '';
        
        let activeSets = [];

        if (cbUpper.checked) { charPool += CHAR_SETS.upper; activeSets.push(CHAR_SETS.upper); }
        if (cbLower.checked) { charPool += CHAR_SETS.lower; activeSets.push(CHAR_SETS.lower); }
        if (cbDigits.checked) { charPool += CHAR_SETS.digits; activeSets.push(CHAR_SETS.digits); }
        if (cbSpecial.checked) { charPool += CHAR_SETS.special; activeSets.push(CHAR_SETS.special); }

        if (charPool.length === 0) {
            bulkDisplay.innerHTML = '<div class="pwd-item" style="color: #ff6b6b;">Please select at least one character set.</div>';
            generatedPasswordsList = [];
            return;
        }

        // Exclude ambiguous characters
        if (cbExclude.checked) {
            const ambiguousArray = CHAR_SETS.ambiguous.split('');
            charPool = charPool.split('').filter(char => !ambiguousArray.includes(char)).join('');
            
            activeSets = activeSets.map(set => 
                set.split('').filter(char => !ambiguousArray.includes(char)).join('')
            );
        }

        generatedPasswordsList = [];
        bulkDisplay.innerHTML = ''; // Clear previous

        for (let i = 0; i < qty; i++) {
            const newPassword = createSinglePassword(length, charPool, activeSets);
            generatedPasswordsList.push(newPassword);
            
            // Add to DOM
            const pwdElement = document.createElement('div');
            pwdElement.className = 'pwd-item';
            pwdElement.textContent = newPassword;
            bulkDisplay.appendChild(pwdElement);
        }

        updateCrackTime(length, activeSets.length);
    }

    function updateCrackTime(length, setsCount) {
        let estimate = "";
        if (length < 8) estimate = "Instantly";
        else if (length <= 10 && setsCount <= 2) estimate = "Days";
        else if (length <= 14) estimate = "Years";
        else estimate = "Centuries";
        
        crackTimeDisplay.textContent = `Estimated Time to Crack: ${estimate}`;
    }

    // Copy to Clipboard (All Passwords)
    copyBtn.addEventListener('click', () => {
        if (generatedPasswordsList.length === 0) return;
        
        // Join with newlines for easy pasting into Excel, text files, etc.
        const allPasswordsText = generatedPasswordsList.join('\n');
        
        navigator.clipboard.writeText(allPasswordsText).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    });

    // Event Listeners for controls
    [cbUpper, cbLower, cbDigits, cbSpecial, cbExclude].forEach(checkbox => {
        checkbox.addEventListener('change', generateBulkPasswords);
    });
    
    refreshBtn.addEventListener('click', generateBulkPasswords);

    // Initial Generation
    generateBulkPasswords();
});