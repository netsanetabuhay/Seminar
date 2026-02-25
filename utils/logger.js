const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const logger = {
    info: (message) => {
        const log = `[INFO] ${new Date().toISOString()} - ${message}\n`;
        console.log(log);
        fs.appendFileSync(path.join(logsDir, 'app.log'), log);
    },

    error: (message) => {
        const log = `[ERROR] ${new Date().toISOString()} - ${message}\n`;
        console.error(log);
        fs.appendFileSync(path.join(logsDir, 'error.log'), log);
    },

    warn: (message) => {
        const log = `[WARN] ${new Date().toISOString()} - ${message}\n`;
        console.warn(log);
        fs.appendFileSync(path.join(logsDir, 'app.log'), log);
    }
};

module.exports = logger;