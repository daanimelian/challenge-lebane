const LEVELS = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };

const colors = {
  INFO: '\x1b[36m',
  WARN: '\x1b[33m',
  ERROR: '\x1b[31m',
  RESET: '\x1b[0m',
};

function timestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 23);
}

function log(level, message, data) {
  const color = colors[level] || '';
  const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
  console.log(`${color}[${timestamp()}] [${level}] ${message}${dataStr}${colors.RESET}`);
}

module.exports = {
  info: (message, data) => log(LEVELS.INFO, message, data),
  warn: (message, data) => log(LEVELS.WARN, message, data),
  error: (message, data) => log(LEVELS.ERROR, message, data),
  step: (stepName) => log(LEVELS.INFO, `STEP → ${stepName}`),
};
