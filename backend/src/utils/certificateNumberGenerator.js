const fs = require('fs');
const path = require('path');

function getCurrentFinancialYear() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // JavaScript months are 0-based
    
    // If current month is before April (4), we're in the previous financial year
    const startYear = currentMonth < 4 ? currentYear - 1 : currentYear;
    const endYear = startYear + 1;
    
    // Convert to YY format
    return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
}

function getNextSerialNumber() {
    const counterFile = path.join(process.cwd(), 'counter.json');
    let counter = 1;

    try {
        if (fs.existsSync(counterFile)) {
            const data = JSON.parse(fs.readFileSync(counterFile, 'utf8'));
            const currentFY = getCurrentFinancialYear();
            
            // Reset counter if financial year has changed
            if (data.financialYear === currentFY) {
                counter = data.counter + 1;
            }
            
            // Update counter file
            fs.writeFileSync(counterFile, JSON.stringify({
                financialYear: currentFY,
                counter: counter
            }));
        } else {
            // Create new counter file
            fs.writeFileSync(counterFile, JSON.stringify({
                financialYear: getCurrentFinancialYear(),
                counter: counter
            }));
        }
    } catch (error) {
        console.error('Error managing certificate counter:', error);
    }

    return counter;
}

function generateCertificateNumber() {
    const serialNumber = getNextSerialNumber();
    const financialYear = getCurrentFinancialYear();
    return `RPS/CERT/${financialYear}/${String(serialNumber).padStart(3, '0')}`;
}

module.exports = {
    generateCertificateNumber
};