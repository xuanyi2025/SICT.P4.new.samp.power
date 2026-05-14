/**
 * dxLogger module.
 * A simple, static logger that replaces `console.log`.
 * It provides multi-level logging and can be viewed in the corresponding VSCode plugin during debugging.
 *
 * Features:
 * - Three log levels: DEBUG, INFO, ERROR. All levels are always enabled.
 * - Supports logging various JavaScript data types, including objects and errors.
 * - Non-blocking log output to avoid performance impact.
 *
 * Usage:
 * - Import the logger: `import log from './dxLogger.js'`
 * - Use the logging methods: `log.info('Application started');`, `log.error('An error occurred:', new Error('test'));`
 *
 * Doc/Demo: https://github.com/DejaOS/DejaOS
 */
const logger = {}
// The maximum length of the log message. In special cases, too long content can cause application crashes.
logger.max_length = 1024
import * as std from "std"
import dxMap from './dxMap.js'
let loggerMap = dxMap.get('__logger__')

/**
 * Enables or disables the debug mode for the logger.
 * When debug mode is enabled, output is flushed immediately after each log.
 * This is essential for seeing logs in real-time when the output is redirected
 * to a pipe (e.g., during VS Code debugging), but can impact performance and stability
 * on physical serial ports.
 *
 * @param {boolean} [isdebug=true] - Whether to enable or disable debug mode.
 * @example
 * // Enable debug mode for real-time logging
 * logger.setDebug(true);
 *
 * // Disable debug mode for production/stability testing
 * logger.setDebug(false);
 */
logger.setDebug = function (isdebug = true) {
    if (isdebug) {
        loggerMap.put('isdebug', true)
    } else {
        loggerMap.put('isdebug', false)
    }
}

/**
 * Logs a message at the DEBUG level.
 * @param {...*} data - The data to log. Can be multiple arguments of any type.
 * @example
 * logger.debug('User logged in:', { userId: 123 });
 */
logger.debug = function (...data) {
    log("DEBUG", data)
}

/**
 * Logs a message at the INFO level.
 * @param {...*} data - The data to log. Can be multiple arguments of any type.
 * @example
 * logger.info('Server started on port', 8080);
 */
logger.info = function (...data) {
    log("INFO", data)
}

/**
 * Logs a message at the ERROR level.
 * @param {...*} data - The data to log. Can be multiple arguments of any type.
 * @example
 * try {
 *   // ... some code that might fail
 * } catch (e) {
 *   logger.error('Operation failed:', e);
 * }
 */
logger.error = function (...data) {
    log("ERROR", data)
}
//-----------------------------------private----------------------
// Formats and prints the log message to standard output.
function log(level, messages) {
    let message = messages.map(msg => getContent(msg)).join(' ');
    //multi \n will cause vscode to not see the subsequent logs
    if (message.includes('\n\n')) {
        message = message.replace(/\n{2,}/g, '\n');
    }
    const content = `[${level} ${getTime()}]: ${message}`.trimEnd();
    try {
        if (content.length > logger.max_length) {
            std.puts(content.slice(0, logger.max_length - 3) + '...\n');
        } else {
            std.puts(content + '\n');
        }

        // The default behavior is to flush, which is suitable for real-time debugging (VSCode).
        // To disable flushing for stability testing on serial ports (MobaXterm),
        // explicitly call logger.setDebug(false).
        if (loggerMap.get('isdebug') !== false) {
            std.out.flush();
        }
    } catch (e) {
        // If even the fallback fails, there's nothing more we can do.
    }
}
// Converts any JavaScript value to a string for logging.
function getContent(message) {
    if (message === undefined) {
        return 'undefined'
    } else if (message === null) {
        return 'null'
    }
    if (typeof message === 'object') {
        if (Object.prototype.toString.call(message) === '[object Error]') {
            let errorString = message.message || 'Error';
            if (message.stack) {
                errorString += '\n' + message.stack;
            }
            return errorString;
        }
        return JSON.stringify(message)
    }
    return String(message);
}
// Generates a timestamp string in 'YYYY-MM-DD HH:mm:ss.ms' format.
function getTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}
if (globalThis && globalThis.console) {
    globalThis.console.log = logger.info
    globalThis.console.debug = logger.debug
    globalThis.console.error = logger.error
}
export default logger