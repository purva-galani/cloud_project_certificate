const fs = require('fs');
const path = require('path');

function getCurrentFinancialYear() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const startYear = currentMonth < 4 ? currentYear - 1 : currentYear;
    const endYear = startYear + 1;
    return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
}

function getNextSerialNumber() {
    const counterFile = path.join(process.cwd(), 'counter.json');
    let counter = 1;
    try {
        if (fs.existsSync(counterFile)) {
            const data = JSON.parse(fs.readFileSync(counterFile, 'utf8'));
            const currentFY = getCurrentFinancialYear();
            if (data.financialYear === currentFY) {
                counter = data.counter + 1;
            }
            fs.writeFileSync(counterFile, JSON.stringify({
                financialYear: currentFY,
                counter: counter
            }));
        } else {
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