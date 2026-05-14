/**
 * Barcode Module based on native barcode_bridge C library.
 * This module provides a singleton interface to barcode scanning functionality.
 *
 * Features:
 * - Initialize/deinitialize barcode scanner
 * - Set callback for barcode detection events
 * - Process barcode events through event loop
 * - Get native barcode client object
 *
 * Usage:
 * - Call `init()` once to initialize.
 * - Use `setCallbacks()` to register barcode detection handler.
 * - Call `loop()` periodically to process events (e.g. in setInterval).
 * - Call `deinit()` to clean up resources.
 *
 * Doc/Demo: https://github.com/DejaOS/DejaOS
 */
import { barcodeClass } from './libvbar-m-dxbarcode.so';
import log from './dxLogger.js'

let barcode = null;
const dxbarcode = {};

/**
 * Checks if the barcode client is initialized
 * @throws {Error} If barcode client is not initialized
 */
function checkBarcodeInitialized() {
    if (!barcode) {
        throw new Error('Barcode client is not initialized. Call init() first.');
    }
}

/**
 * Initializes the barcode client. Must be called before any other operation.
 * @example
 * dxbarcode.init();
 */
dxbarcode.init = function () {
    if (!barcode) {
        barcode = new barcodeClass();
    }
    barcode.init();
};

/**
 * Deinitializes the barcode client and releases resources.
 * @returns {void}
 * @example
 * dxbarcode.deinit();
 */
dxbarcode.deinit = function () {
    if (barcode) {
        barcode.deinit();
        barcode = null;
    }
};

/**
 * Sets the callback function for barcode detection events.
 * @param {object} callbacks - The callback functions.
 * @param {function(ArrayBuffer, number, number, number)} [callbacks.onBarcodeDetected] - The callback function to handle barcode detection.
 *   @param {ArrayBuffer} data - The barcode data as ArrayBuffer. This preserves binary data integrity and prevents encoding issues.
 *   @param {number} type - The barcode type identifier.
 *   @param {number} quality - The quality score of the decoded barcode.
 *   @param {number} timestamp - The timestamp when the barcode was detected.
 * @returns {void}
 * @example
 * dxbarcode.setCallbacks({
 *   onBarcodeDetected: function(data, type, quality, timestamp) {
 *     // data is now ArrayBuffer, convert to Uint8Array for processing
 *     let str = common.utf8HexToStr(common.arrayBufferToHexString(data))
 *     logger.info('Barcode data:', str);
 *     logger.info('Barcode type:', type);
 *     logger.info('Quality:', quality);
 *     logger.info('Timestamp:', timestamp);
 *   }
 * });
 */
dxbarcode.setCallbacks = function (callbacks) {
    checkBarcodeInitialized();
    if (!callbacks || !callbacks.onBarcodeDetected) {
        throw new Error('Callbacks must be an object with onBarcodeDetected function');
    }
    barcode.setCallback(callbacks.onBarcodeDetected);
};

/**
 * Processes events from the barcode event queue. Should be called periodically (e.g. in setInterval).
 * Handles barcode detection events and calls the registered callback function.
 * 
 * Note: The callback function will receive barcode data as ArrayBuffer to preserve data integrity,
 * especially for binary barcodes or those containing special characters.
 * 
 * @example
 * setInterval(() => {
 *   dxbarcode.loop();
 * }, 10); // Process events every 10ms
 */
dxbarcode.loop = function () {
    try {
        checkBarcodeInitialized();
        barcode.loop();
    } catch (e) {
        log.error('Error in barcode loop:', e);
    }
};

/**
 * Gets the native barcode client object.
 * @returns {Object|null} The native client object, or null if not initialized.
 */
dxbarcode.getNative = function () {
    return barcode;
};

export default dxbarcode;