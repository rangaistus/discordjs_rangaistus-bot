const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const CURRENT = process.env.LOG_LEVEL || 'info';

function shouldLog(level) {
    return levels[level] <= levels[CURRENT];
}

module.exports = {
    error: (...args) => { if (shouldLog('error')) console.error('[ERROR]', ...args); },
    warn: (...args) => { if (shouldLog('warn')) console.warn('[WARN]', ...args); },
    info: (...args) => { if (shouldLog('info')) console.log('[INFO]', ...args); },
    debug: (...args) => { if (shouldLog('debug')) console.debug('[DEBUG]', ...args); },
};
