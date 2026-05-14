/**
 * Common Utils Module based on the native common_utils_bridge C library.
 *
 * This module provides a collection of common utilities organized into namespaces.
 * It is designed as a stateless, singleton-like utility library.
 *
 * Features:
 * - `crypto`: Hashing (MD5, HMAC-MD5), symmetric encryption (AES),
 *             and asymmetric encryption (RSA).
 * - `fs`: File system operations, such as converting files to/from Base64.
 * - `codec`: Data encoding and decoding functions (Hex, Base64, UTF-8, etc.).
 * - `random`: Generation of cryptographically secure random bytes and simple
 *           random strings.
 *
 * Usage:
 * import dxCommonUtils from './dxCommonUtils.js';
 * const md5Hash = dxCommonUtils.crypto.md5('hello');
 *
 * Doc/Demo: https://github.com/DejaOS/DejaOS
 */
import { commonUtils as commonUtilsNative } from './libvbar-m-dxcommonutils.so'

const dxCommonUtils = {};

// ----------- Constants & Enums -------------------
dxCommonUtils.AES_MODE = {
    ECB: 'ECB',
    CBC: 'CBC',
    CFB: 'CFB',
    OFB: 'OFB',
    CTR: 'CTR'
};

dxCommonUtils.AES_KEY_SIZE = {
    BITS_128: 128,
    BITS_192: 192,
    BITS_256: 256
};

dxCommonUtils.AES_PADDING = {
    PKCS7: 'PKCS7',
    NONE: 'NoPadding'
};

dxCommonUtils.RSA_KEY_SIZE = {
    BITS_1024: 1024,
    BITS_2048: 2048,
    BITS_4096: 4096
};

// ----------- Crypto Namespace -------------------
dxCommonUtils.crypto = {};
dxCommonUtils.crypto.aes = {};
dxCommonUtils.crypto.rsa = {};

/**
 * Calculates MD5 hash of the input string.
 * @param {string|ArrayBuffer|Uint8Array} data - The data to hash. If a string is provided, it will be treated as UTF-8.
 * @returns {string} MD5 hash in hexadecimal format.
 */
dxCommonUtils.crypto.md5 = function (data) {
    const buffer = _normalizeDataToBuffer(data, false, 'Data');
    return commonUtilsNative.md5(buffer);
}

/**
 * Calculates HMAC-MD5 hash using the provided key.
 * @param {string|ArrayBuffer|Uint8Array} data - The data to hash. If a string is provided, it will be treated as UTF-8.
 * @param {string|ArrayBuffer|Uint8Array} key - The secret key for HMAC. If a string is provided, it will be treated as UTF-8.
 * @returns {string} HMAC-MD5 hash in hexadecimal format.
 */
dxCommonUtils.crypto.hmacMd5 = function (data, key) {
    const dataBuffer = _normalizeDataToBuffer(data, false, 'Data');
    const keyBuffer = _normalizeDataToBuffer(key, false, 'Key');
    return commonUtilsNative.hmacMd5(dataBuffer, keyBuffer);
}

/**
 * Calculates a hash of the input data using the specified algorithm.
 * @param {string|ArrayBuffer|Uint8Array} data - The data to hash. If a string is provided, it will be treated as UTF-8.
 * @param {string} [hashAlgorithm='SHA-256'] - The hash algorithm to use (e.g., 'SHA-256', 'MD5', 'SHA1', 'SHA-384', 'SHA-512').
 * @returns {string} The hash in hexadecimal format.
 */
dxCommonUtils.crypto.hash = function (data, hashAlgorithm = 'SHA-256') {
    const buffer = _normalizeDataToBuffer(data, false, 'Data');
    return commonUtilsNative.hash(buffer, hashAlgorithm);
}

/**
 * Encrypts data using AES encryption.
 * @param {string|ArrayBuffer|Uint8Array} data - The data to encrypt. If a string is provided, it will be treated as UTF-8.
 * @param {string|ArrayBuffer|Uint8Array} key - The encryption key. Can be a hex string, an ArrayBuffer, or a Uint8Array.
 * @param {object} options - Encryption options.
 * @param {string} [options.mode='CBC'] - The AES mode, from dxCommonUtils.AES_MODE.
 * @param {number} [options.keySize=256] - The key size in bits (128, 192, or 256), from dxCommonUtils.AES_KEY_SIZE.
 * @param {string|ArrayBuffer|Uint8Array} [options.iv] - The initialization vector (required for non-ECB modes). This is ignored if useSalt is true.
 * @param {string} [options.padding='PKCS7'] - The padding scheme, from dxCommonUtils.AES_PADDING. Defaults to PKCS7.
 * @param {boolean} [options.useSalt=false] - If true, generates an OpenSSL-compatible salted ciphertext. The provided 'key' is used as a password (UTF-8 string) to derive the actual key and IV.
 * @returns {string} The encrypted data as a Base64 string.
 */
dxCommonUtils.crypto.aes.encrypt = function (data, key, options = {}) {
    // Set default options, including PKCS7 padding by default
    const finalOptions = Object.assign({
        mode: dxCommonUtils.AES_MODE.CBC,
        keySize: 256,
        padding: dxCommonUtils.AES_PADDING.PKCS7,
        useSalt: false // Default to false for backward compatibility
    }, options);

    let keyBuffer;
    if (finalOptions.useSalt) {
        // In salted mode, a string key is treated as a password (UTF-8).
        keyBuffer = _normalizeDataToBuffer(key, false, 'Key');
    } else {
        // In non-salted mode, a string key is treated as a raw key in hex format.
        keyBuffer = _normalizeHexInput(key, 'Key');

        // Key length must be validated for non-salted keys.
        const expectedKeyLength = finalOptions.keySize / 8;
        if (keyBuffer.byteLength !== expectedKeyLength) {
            throw new Error(`Key length must be ${expectedKeyLength} bytes for ${finalOptions.keySize}-bit AES`);
        }
    }

    // Validate mode and keySize
    if (!Object.values(dxCommonUtils.AES_MODE).includes(finalOptions.mode)) {
        throw new Error("options.mode must be one of dxCommonUtils.AES_MODE values");
    }
    if (!Object.values(dxCommonUtils.AES_KEY_SIZE).includes(finalOptions.keySize)) {
        throw new Error("options.keySize must be one of dxCommonUtils.AES_KEY_SIZE values");
    }

    // Validate padding
    if (finalOptions.padding !== undefined) {
        if (typeof finalOptions.padding !== 'string' || !Object.values(dxCommonUtils.AES_PADDING).includes(finalOptions.padding)) {
            throw new Error("options.padding must be one of dxCommonUtils.AES_PADDING values");
        }
        if (finalOptions.padding === dxCommonUtils.AES_PADDING.NONE) {
            const dataBuffer = _normalizeDataToBuffer(data, false, 'Data');
            if (dataBuffer.byteLength % 16 !== 0) {
                throw new Error("Data length must be a multiple of 16 bytes when using NoPadding");
            }
        }
    }

    const ivBuffer = (finalOptions.iv && !finalOptions.useSalt) ? _normalizeHexInput(finalOptions.iv) : null;
    const dataBuffer = _normalizeDataToBuffer(data, false, 'Data');

    const encrypted = commonUtilsNative.aesEncrypt(dataBuffer, keyBuffer, { ...finalOptions, iv: ivBuffer });
    if (encrypted === null) {
        throw new Error("AES encryption failed. Check parameters.");
    }
    return dxCommonUtils.codec.arrayBufferToBase64(encrypted);
};

/**
 * Decrypts data using AES encryption.
 * Note: This function automatically handles OpenSSL's "Salted__" format if present in the encrypted data.
 * @param {string|ArrayBuffer|Uint8Array} encryptedData - The encrypted data. If a string, it is assumed to be Base64.
 * @param {string|ArrayBuffer|Uint8Array} key - The decryption key. If a string, it will be treated as a password (UTF-8) for salted data, or as a hex string for non-salted data.
 * @param {object} options - Decryption options.
 * @param {string} [options.mode='CBC'] - The AES mode, from dxCommonUtils.AES_MODE.
 * @param {number} [options.keySize=256] - The key size in bits (128, 192, or 256), from dxCommonUtils.AES_KEY_SIZE. This is also used for key derivation in "Salted__" format.
 * @param {string|ArrayBuffer|Uint8Array} [options.iv] - The initialization vector (required for non-ECB modes and non-salted data). If a string, it must be Hex.
 * @param {string} [options.padding='PKCS7'] - The padding scheme, from dxCommonUtils.AES_PADDING. Defaults to PKCS7.
 * @returns {ArrayBuffer|null} The decrypted data as an ArrayBuffer. Returns null on decryption failure (e.g., bad key or padding).
 */
dxCommonUtils.crypto.aes.decrypt = function (encryptedData, key, options = {}) {
    // Set default options, including PKCS7 padding by default
    const finalOptions = Object.assign({
        mode: dxCommonUtils.AES_MODE.CBC,
        keySize: 256,
        padding: dxCommonUtils.AES_PADDING.PKCS7
    }, options);

    // Validate mode and keySize
    if (!Object.values(dxCommonUtils.AES_MODE).includes(finalOptions.mode)) {
        throw new Error("options.mode must be one of dxCommonUtils.AES_MODE values");
    }
    if (!Object.values(dxCommonUtils.AES_KEY_SIZE).includes(finalOptions.keySize)) {
        throw new Error("options.keySize must be one of dxCommonUtils.AES_KEY_SIZE values");
    }

    // Validate padding
    if (finalOptions.padding !== undefined) {
        if (typeof finalOptions.padding !== 'string' || !Object.values(dxCommonUtils.AES_PADDING).includes(finalOptions.padding)) {
            throw new Error("options.padding must be one of dxCommonUtils.AES_PADDING values");
        }
    }

    const encryptedDataBuffer = _normalizeDataToBuffer(encryptedData, true); // true for base64

    // Auto-detect if the data is in OpenSSL's "Salted__" format
    let isSalted = false;
    if (encryptedDataBuffer.byteLength >= 16) {
        const header = new Uint8Array(encryptedDataBuffer, 0, 8);
        // "Salted__" in ASCII: 83 97 108 116 101 100 95 95
        const saltedHeader = new Uint8Array([83, 97, 108, 116, 101, 100, 95, 95]);
        isSalted = header.every((value, index) => value === saltedHeader[index]);
    }

    let keyBuffer;
    if (isSalted) {
        // If data is salted, a string key is treated as a password (UTF-8).
        keyBuffer = _normalizeDataToBuffer(key, false, 'Key');
    } else {
        // If data is not salted, a string key is treated as a raw key in hex format.
        keyBuffer = _normalizeHexInput(key, 'Key');

        // Key length must be validated for non-salted keys.
        const expectedKeyLength = finalOptions.keySize / 8;
        if (keyBuffer.byteLength !== expectedKeyLength) {
            throw new Error(`Key length must be ${expectedKeyLength} bytes for ${finalOptions.keySize}-bit AES`);
        }
    }

    const ivBuffer = finalOptions.iv ? _normalizeHexInput(finalOptions.iv) : null;

    return commonUtilsNative.aesDecrypt(encryptedDataBuffer, keyBuffer, { ...finalOptions, iv: ivBuffer });
};

/**
 * Convenience method for AES-256-CBC encryption with automatic IV generation.
 * The key is treated as a Hex string. The plaintext data is treated as a UTF-8 string.
 * @param {string} data - The UTF-8 data to encrypt.
 * @param {string|ArrayBuffer|Uint8Array} key - The encryption key (32 bytes). If a string, it must be Hex.
 * @returns {{encrypted: string, iv: string}} Object containing Base64 encrypted data and the generated IV as a hex string.
 */
dxCommonUtils.crypto.aes.encryptWithRandomIV = function (data, key) {
    if (typeof data !== 'string') {
        throw new Error('Data must be a UTF-8 string for this convenience function.');
    }

    const keyBuffer = _normalizeHexInput(key, 'Key');
    if (keyBuffer.byteLength !== 32) {
        throw new Error('Key must be 32 bytes for AES-256');
    }

    // 1. Generate 16 random bytes, returned directly as a hex string.
    const ivHex = dxCommonUtils.random.getBytes(16);

    // 2. Encrypt using the main AES function.
    const encrypted = dxCommonUtils.crypto.aes.encrypt(data, keyBuffer, {
        mode: 'CBC',
        keySize: 256,
        iv: ivHex
    });

    // 3. Return the encrypted data and the hex-encoded IV.
    return {
        encrypted: encrypted,
        iv: ivHex
    };
}

/**
 * Generates a new RSA key pair.
 * @param {number} [bits=2048] - Key size in bits: 1024, 2048, or 4096.
 * @returns {object} Object containing privateKey and publicKey in PEM format.
 */
dxCommonUtils.crypto.rsa.generateKeyPair = function (bits = 2048) {
    if (![1024, 2048, 4096].includes(bits)) {
        throw new Error('RSA key size must be 1024, 2048, or 4096 bits');
    }
    return commonUtilsNative.generateRsaKeyPair(bits);
}

/**
 * Encrypts data using RSA public key.
 * @param {string|ArrayBuffer|Uint8Array} data - The data to encrypt. If a string is provided, it will be treated as UTF-8.
 * @param {string} publicKey - PEM formatted RSA public key.
 * @returns {string} Base64 encoded encrypted data.
 */
dxCommonUtils.crypto.rsa.encrypt = function (data, publicKey) {
    const dataBuffer = _normalizeDataToBuffer(data, false, 'Data');

    if (typeof publicKey !== 'string') {
        throw new Error('Public key must be a PEM string');
    }
    if (!publicKey.includes('-----BEGIN PUBLIC KEY-----')) {
        throw new Error('Public key must be in PEM format');
    }
    return commonUtilsNative.rsaEncrypt(dataBuffer, publicKey);
}

/**
 * Decrypts RSA encrypted data using private key.
 * @param {string} encryptedData - Base64 encoded encrypted data.
 * @param {string} privateKey - PEM formatted RSA private key.
 * @returns {ArrayBuffer|null} The decrypted data as an ArrayBuffer. Returns null on decryption failure.
 */
dxCommonUtils.crypto.rsa.decrypt = function (encryptedData, privateKey) {
    if (typeof encryptedData !== 'string') {
        throw new Error('Encrypted data must be a Base64 string');
    }
    if (typeof privateKey !== 'string') {
        throw new Error('Private key must be a PEM string');
    }
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        throw new Error('Private key must be in PEM format');
    }

    // Decode the Base64 input to an ArrayBuffer before passing to native code.
    const encryptedBuffer = dxCommonUtils.codec.base64ToArrayBuffer(encryptedData);

    // Pass the privateKey string directly, as the C layer expects a PEM string.
    const decryptedBuffer = commonUtilsNative.rsaDecrypt(encryptedBuffer, privateKey);
    if (!decryptedBuffer) {
        // Return null instead of throwing to match AES behavior
        return null;
    }

    return decryptedBuffer; // Return the raw ArrayBuffer
};

/**
 * Creates a digital signature for data using an RSA private key.
 * This is the core function needed for standards like JWT (RS256/RS384/RS512).
 * @param {string|ArrayBuffer|Uint8Array} data - The data to sign. If a string, it will be treated as UTF-8.
 * @param {string} privateKey - The PEM formatted RSA private key.
 * @param {string} [hashAlgorithm='SHA-256'] - The hash algorithm to use (e.g., 'SHA-256', 'SHA-384', 'SHA-512').
 * @returns {string} The signature as a Base64 encoded string.
 */
dxCommonUtils.crypto.rsa.sign = function (data, privateKey, hashAlgorithm = 'SHA-256') {
    const dataBuffer = _normalizeDataToBuffer(data, false, 'Data');
    if (typeof privateKey !== 'string' || !privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        throw new Error('Private key must be a PEM string');
    }
    return commonUtilsNative.rsaSign(dataBuffer, privateKey, hashAlgorithm);
};

/**
 * Verifies a digital signature using an RSA public key.
 * This is the counterpart to `rsa.sign` and is used to validate signatures like those in JWT.
 * @param {string|ArrayBuffer|Uint8Array} data - The original, unsigned data.
 * @param {string|ArrayBuffer|Uint8Array} signature - The signature to verify. If a string, it must be Base64 encoded.
 * @param {string} publicKey - The PEM formatted RSA public key.
 * @param {string} [hashAlgorithm='SHA-256'] - The hash algorithm used for signing (e.g., 'SHA-256', 'SHA-384', 'SHA-512').
 * @returns {boolean} True if the signature is valid, otherwise false.
 */
dxCommonUtils.crypto.rsa.verify = function (data, signature, publicKey, hashAlgorithm = 'SHA-256') {
    const dataBuffer = _normalizeDataToBuffer(data, false, 'Data');
    // The C layer expects a raw ArrayBuffer, so we decode the Base64 signature here in JS.
    const signatureBuffer = _normalizeDataToBuffer(signature, true, 'Signature');
    if (typeof publicKey !== 'string' || !publicKey.includes('-----BEGIN PUBLIC KEY-----')) {
        throw new Error('Public key must be a PEM string');
    }
    return commonUtilsNative.rsaVerify(dataBuffer, signatureBuffer, publicKey, hashAlgorithm);
};

/**
 * Parses a PEM formatted X.509 certificate and returns its details.
 * @param {string} pemString - The certificate content in PEM format.
 * @returns {object} An object containing certificate details:
 *                   - serialNumber (string)
 *                   - issuer (string)
 *                   - subject (string)
 *                   - validFrom (string)
 *                   - validTo (string)
 *                   - publicKey (string, in PEM format)
 */
dxCommonUtils.crypto.parsePEM = function (pemString) {
    if (typeof pemString !== 'string' || !pemString.includes('-----BEGIN CERTIFICATE-----')) {
        throw new Error('Input must be a PEM formatted certificate string');
    }
    return commonUtilsNative.parsePEMCertificate(pemString);
};

/**
 * Verifies if a certificate was signed by a given Certificate Authority (CA).
 * @param {string} certPEM - The certificate to verify, in PEM format.
 * @param {string} caCertPEM - The CA's certificate, in PEM format.
 * @returns {boolean} True if the certificate is signed by the CA.
 * @throws {Error} If the native verification fails due to parsing errors or signature mismatch.
 */
dxCommonUtils.crypto.verifyCertificate = function (certPEM, caCertPEM) {
    if (typeof certPEM !== 'string' || !certPEM.includes('-----BEGIN CERTIFICATE-----')) {
        throw new Error('Input certPEM must be a PEM formatted certificate string');
    }
    if (typeof caCertPEM !== 'string' || !caCertPEM.includes('-----BEGIN CERTIFICATE-----')) {
        throw new Error('Input caCertPEM must be a PEM formatted certificate string');
    }
    return commonUtilsNative.verifyCertificate(certPEM, caCertPEM);
};

// =====================================================================================
// == FS (File System) Namespace =====================================================
// =====================================================================================
dxCommonUtils.fs = {};

/**
 * Reads the entire content of a file and returns it as a Base64 encoded string.
 * @memberof dxCommonUtils.fs
 * @param {string} filePath - The path to the file.
 * @returns {string} The Base64 encoded content of the file.
 */
dxCommonUtils.fs.fileToBase64 = function (filePath) {
    if (typeof filePath !== 'string' || filePath.length === 0) {
        throw new Error("filePath must be a non-empty string.");
    }
    return commonUtilsNative.fileToBase64(filePath);
}

/**
 * Decodes a Base64 string and writes the binary data to a file.
 * This will overwrite the file if it already exists.
 * @memberof dxCommonUtils.fs
 * @param {string} filePath - The path to the file to be written.
 * @param {string} base64String - The Base64 encoded data.
 * @returns {boolean} Returns true on success.
 */
dxCommonUtils.fs.base64ToFile = function (filePath, base64String) {
    if (typeof filePath !== 'string' || filePath.length === 0) {
        throw new Error("filePath must be a non-empty string.");
    }
    if (typeof base64String !== 'string') {
        throw new Error("base64String must be a string.");
    }
    return commonUtilsNative.base64ToFile(filePath, base64String);
}

/**
 * Calculates the MD5 hash of a file.
 * @memberof dxCommonUtils.fs
 * @param {string} filePath - The path to the file.
 * @returns {string} MD5 hash of the file in hexadecimal format.
 */
dxCommonUtils.fs.fileMd5 = function (filePath) {
    if (typeof filePath !== 'string' || filePath.length === 0) {
        throw new Error("filePath must be a non-empty string.");
    }
    return commonUtilsNative.fileMd5(filePath);
}

// =====================================================================================
// == Random Namespace ===============================================================
// =====================================================================================
dxCommonUtils.random = {};

/**
 * Generates cryptographically secure random bytes.
 * @param {number} length - Number of bytes to generate.
 * @returns {string} Random bytes as a hex string.
 */
dxCommonUtils.random.getBytes = function (length) {
    if (typeof length !== 'number' || length <= 0) {
        throw new Error('Length must be a positive number');
    }
    return commonUtilsNative.generateRandomBytes(length);
}

/**
 * Generates a non-cryptographically secure random string from a given charset.
 * @param {number} length - The length of the string to generate.
 * @param {string} [charset] - The set of characters to use. Defaults to alphanumeric.
 * @returns {string} The generated random string.
 */
dxCommonUtils.random.getStr = function (length, charset) {
    if (typeof length !== 'number' || length <= 0) {
        throw new Error('Length must be a positive number');
    }
    const charSet = charset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charSetLength = charSet.length;
    for (let i = 0; i < length; i++) {
        result += charSet.charAt(Math.floor(Math.random() * charSetLength));
    }
    return result;
}

// ----------- Codec Namespace -------------------
dxCommonUtils.codec = {};

/**
 * Hexadecimal to byte array eg: 313233616263->[49,50,51,97,98,99]
 * @param {string} str A hexadecimal string in lowercase with no space in between
 * @returns {number[]} Digital numbers
 */
dxCommonUtils.codec.hexToBytes = function (str) {
    if (str === undefined || str === null || (typeof str) != 'string' || str.length < 1) {
        throw new Error("dxCommonUtils.codec.hexToBytes:'str' parameter should not be empty")
    }
    if (!/^[0-9a-fA-F]+$/.test(str) || str.length % 2 !== 0) {
        throw new Error("dxCommonUtils.codec.hexToBytes: 'str' parameter must be a valid hex string with an even length");
    }
    let regex = /.{2}/g;
    let arr = str.match(regex);
    return arr.map(item => parseInt(item, 16));
}
/**
 * Byte array to hexadecimal eg: [49,50,51,97,98,99] ->313233616263
 * @param {number[]} numbers Numeric array
 * @returns {string} A hexadecimal string in lowercase with no space in between
 */
dxCommonUtils.codec.bytesToHex = function (numbers) {
    const hexArray = numbers.map(num => num.toString(16).padStart(2, '0').toLowerCase());
    const hexString = hexArray.join('');
    return hexString;
}
/**
 * Hexadecimal to string conversion eg: 313233616263->123abc
 * @description WARNING: This function only works for single-byte character sets (like ASCII).
 * For multi-byte characters (like Chinese), please use `codec.utf8HexToStr`.
 * @param {string} str The hexadecimal string to be converted
 * @returns {string} The real string
 */
dxCommonUtils.codec.hexToStr = function (str) {
    let regex = /.{2}/g;
    let arr = str.match(regex);
    arr = arr.map(item => String.fromCharCode(parseInt(item, 16)));
    return arr.join("");
}
/**
 * Convert a string to a UTF-8 encoded hexadecimal string
 * @param {string} str 
 * @returns {string}
 */
dxCommonUtils.codec.strToUtf8Hex = function (str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if (code < 0x80) {
            bytes.push(code);
        } else if (code < 0x800) {
            bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
        } else if (code < 0xd800 || code >= 0xe000) {
            bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
        } else {
            i++;
            code = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
            bytes.push(
                0xf0 | (code >> 18),
                0x80 | ((code >> 12) & 0x3f),
                0x80 | ((code >> 6) & 0x3f),
                0x80 | (code & 0x3f)
            );
        }
    }
    return dxCommonUtils.codec.bytesToHex(bytes);
}
/**
 * Convert the hexadecimal string of utf-8 passed over to a string
 * @param {string} hex Hexadecimal string
 * @returns {string} The real string
 */
dxCommonUtils.codec.utf8HexToStr = function (hex) {
    let array = dxCommonUtils.codec.hexToBytes(hex)
    var out, i, len, c;
    var char2, char3;
    out = "";
    len = array.length;
    i = 0;
    while (i < len) {
        c = array[i++];
        switch (c >> 4) {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                out += String.fromCharCode(c);
                break;
            case 12: case 13:
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }
    return out;
}
/**
 * Convert string to hexadecimal eg: 123abc ->313233616263
 * @description WARNING: This function only works for single-byte character sets (like ASCII).
 * For multi-byte characters (like Chinese), please use `codec.strToUtf8Hex`.
 * @param {string} str The string to be converted
 * @returns {string} Hexadecimal string
 */
dxCommonUtils.codec.strToHex = function (str) {
    if (str === undefined || str === null || typeof (str) != "string") {
        return null
    }
    let val = "";
    for (let i = 0; i < str.length; i++) {
        val += str.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return val
}

/**
 * Convert small format to decimal eg: 001001->69632
 * @param {string} hexString A hexadecimal string in lowercase with no space in between
 * @returns {number} Decimal number
 */
dxCommonUtils.codec.leToDecimal = function (hexString) {
    let reversedHexString = hexString
        .match(/.{2}/g)
        .reverse()
        .join("");
    let decimal = parseInt(reversedHexString, 16);
    return decimal;
}

/**
 * Convert decimal numbers to hexadecimal small format strings
 * @param {number} decimalNumber Decimal digit
 * @param {number} byteSize Generate the number of bytes, defaults to 2
 * @returns {string} Hexadecimal small format string
 */
dxCommonUtils.codec.decimalToLeHex = function (decimalNumber, byteSize) {
    if (decimalNumber === undefined || decimalNumber === null || (typeof decimalNumber) != 'number') {
        throw new Error("dxCommonUtils.codec.decimalToLeHex:'decimalNumber' parameter should be number")
    }
    if (byteSize === undefined || byteSize === null || (typeof byteSize) != 'number' || byteSize <= 0) {
        byteSize = 2
    }
    const littleEndianBytes = [];
    for (let i = 0; i < byteSize; i++) {
        littleEndianBytes.push(decimalNumber & 0xFF);
        decimalNumber >>= 8;
    }
    const littleEndianHex = littleEndianBytes
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
    return littleEndianHex;
}

/**
 * Convert a hexadecimal string to an ArrayBuffer
 * @param {string} hexString The hexadecimal string to be converted
 * @returns {ArrayBuffer} Converted ArrayBuffer
 */
dxCommonUtils.codec.hexToArrayBuffer = function (hexString) {
    return dxCommonUtils.codec.hexToUint8Array(hexString).buffer;
}

/**
 * Convert hexadecimal string to Uint8Array
 * @param {string} hexString The hexadecimal string to be converted
 * @returns {Uint8Array} Uint8Array object
 */
dxCommonUtils.codec.hexToUint8Array = function (hexString) {
    if (hexString === undefined || hexString === null || (typeof hexString) != 'string' || hexString.length <= 0) {
        throw new Error("dxCommonUtils.codec.hexToUint8Array:'hexString' parameter should not be empty")
    }
    if (!/^[0-9a-fA-F]+$/.test(hexString) || hexString.length % 2 !== 0) {
        throw new Error("dxCommonUtils.codec.hexToUint8Array: 'hexString' parameter must be a valid hex string with an even length");
    }
    let byteString = hexString.match(/.{1,2}/g);
    let byteArray = byteString.map(function (byte) {
        return parseInt(byte, 16);
    });
    let buffer = new Uint8Array(byteArray);
    return buffer;
}

/**
 * Convert ArrayBuffer to hexadecimal string format
 * @param {ArrayBuffer} buffer 
 * @returns {string} A hexadecimal string in lowercase with no space in between
 */
dxCommonUtils.codec.arrayBufferToHex = function (buffer) {
    return dxCommonUtils.codec.uint8ArrayToHex(new Uint8Array(buffer))
}
/**
 * Convert Uint8Array to hexadecimal string format
 * @param {Uint8Array} array 
 * @returns {string} A hexadecimal string in lowercase with no space in between
 */
dxCommonUtils.codec.uint8ArrayToHex = function (array) {
    let hexString = '';
    for (let i = 0; i < array.length; i++) {
        const byte = array[i].toString(16).padStart(2, '0');
        hexString += byte;
    }
    return hexString
}

/**
 * Decodes a Base64 string into an ArrayBuffer.
 * This implementation is robust and handles padding correctly.
 * @memberof dxCommonUtils.codec
 * @param {string} b64 - The Base64 encoded string.
 * @returns {ArrayBuffer} The decoded data as an ArrayBuffer.
 */
dxCommonUtils.codec.base64ToArrayBuffer = function (b64) {
    if (typeof b64 !== 'string') {
        throw new Error("Input must be a Base64 string.");
    }

    // First, clean up any whitespace from the input string.
    const b64_clean = b64.replace(/\s+/g, "");

    // Regex inspired by the js-base64 library to validate the structure of the string.
    // This provides a fast failure for malformed strings.
    const b64re = /^(?:[A-Za-z0-9+/]{4})*?(?:[A-Za-z0-9+/]{2}(?:==)?|[A-Za-z0-9+/]{3}=?)?$/;
    if (!b64re.test(b64_clean)) {
        throw new Error("Input is not a valid Base64 string (malformed).");
    }

    const B64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const len = b64_clean.length;

    // This calculation correctly determines the output byte length
    let byte_len = len * 3 / 4;
    if (b64_clean.slice(-2) === '==') {
        byte_len -= 2;
    } else if (b64_clean.slice(-1) === '=') {
        byte_len -= 1;
    }

    const arr = new Uint8Array(byte_len);
    let j = 0;

    for (let i = 0; i < len; i += 4) {
        // Get the index of each base64 character.
        // It will be -1 for '=' or any other invalid character.
        const c1 = B64_MAP.indexOf(b64_clean[i]);
        const c2 = B64_MAP.indexOf(b64_clean[i + 1]);
        const c3 = B64_MAP.indexOf(b64_clean[i + 2]);
        const c4 = B64_MAP.indexOf(b64_clean[i + 3]);

        // Reconstruct the original 3 bytes from the 4 base64 character indices.
        const b1 = (c1 << 2) | (c2 >> 4);
        const b2 = ((c2 & 15) << 4) | (c3 >> 2);
        const b3 = ((c3 & 3) << 6) | c4;

        // Write the first byte, which is always present.
        arr[j++] = b1;

        // Write the second byte if the third base64 character was not a padding character.
        if (c3 !== -1) {
            arr[j++] = b2;
        }

        // Write the third byte if the fourth base64 character was not a padding character.
        if (c4 !== -1) {
            arr[j++] = b3;
        }
    }
    return arr.buffer;
}

/**
 * Encodes an ArrayBuffer into a Base64 string.
 * This implementation is robust and handles padding correctly.
 * @memberof dxCommonUtils.codec
 * @param {ArrayBuffer} buffer - The ArrayBuffer to encode.
 * @returns {string} The Base64 encoded string.
 */
dxCommonUtils.codec.arrayBufferToBase64 = function (buffer) {
    const B64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    let b64 = "";

    for (let i = 0; i < len; i += 3) {
        const b1 = bytes[i];
        const b2 = bytes[i + 1];
        const b3 = bytes[i + 2];

        const c1 = b1 >> 2;
        const c2 = ((b1 & 3) << 4) | (b2 >> 4);
        const c3 = ((b2 & 15) << 2) | (b3 >> 6);
        const c4 = b3 & 63;

        b64 += B64_MAP[c1];
        b64 += B64_MAP[c2];

        if (i + 1 >= len) {
            b64 += "==";
        } else {
            b64 += B64_MAP[c3];
            if (i + 2 >= len) {
                b64 += "=";
            } else {
                b64 += B64_MAP[c4];
            }
        }
    }
    return b64;
}

/**
 * Calculates the BCC (Block Check Character / XOR Checksum) of the input data.
 * @memberof dxCommonUtils.codec
 * @param {string|ArrayBuffer|Uint8Array} data - The data to calculate the checksum for. If a string, it will be treated as UTF-8.
 * @returns {number} The calculated 8-bit BCC value (0-255).
 */
dxCommonUtils.codec.bcc = function (data) {
    const buffer = _normalizeDataToBuffer(data, false, 'Data');
    return commonUtilsNative.calculateBcc(buffer);
}

/**
 * Get disk space usage
 * @returns {object} 
 *          -total: The total disk space in MB.
 *          -used: The used disk space in MB.
 *          -free: The available disk space in MB.
 */
dxCommonUtils.getDiskStats = function () {
    return commonUtilsNative.getDiskStats();
}

/**
 * @private
 * Internal helper to normalize various data inputs into an ArrayBuffer.
 * This function is crucial for ensuring that the native C layer receives data in a consistent format.
 * @param {string|ArrayBuffer|Uint8Array} data The input data.
 * @param {boolean} [isBase64=false] - If the input is a string, specifies if it's Base64 encoded. Defaults to false (UTF-8).
 * @param {string} [paramName='Input'] - The name of the parameter for error messages.
 * @returns {ArrayBuffer}
 */
function _normalizeDataToBuffer(data, isBase64 = false, paramName = 'Input') {
    if (typeof data === 'string') {
        if (isBase64) {
            return dxCommonUtils.codec.base64ToArrayBuffer(data);
        } else {
            // Treat as a UTF-8 string by converting to hex and then to ArrayBuffer.
            return dxCommonUtils.codec.hexToArrayBuffer(dxCommonUtils.codec.strToUtf8Hex(data));
        }
    } else if (data instanceof ArrayBuffer) {
        return data;
    } else if (data instanceof Uint8Array) {
        // Correctly handle views on larger ArrayBuffers by creating a copy of the viewed section.
        // If it's not a view, slice() will create a copy of the buffer.
        return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    } else {
        throw new Error(`${paramName} must be a string, ArrayBuffer, or Uint8Array`);
    }
}

/**
 * @private
 * Internal helper to normalize crypto inputs, converting Hex strings to ArrayBuffer.
 * @param {string|ArrayBuffer|Uint8Array} data The input data.
 * @param {string} paramName The name of the parameter for error messages.
 * @returns {ArrayBuffer}
 */
function _normalizeHexInput(data, paramName = 'Input') {
    if (typeof data === 'string') {
        return dxCommonUtils.codec.hexToArrayBuffer(data);
    } else if (data instanceof ArrayBuffer) {
        return data;
    } else if (data instanceof Uint8Array) {
        return data.buffer;
    } else {
        throw new Error(`${paramName} must be a hex string, ArrayBuffer, or Uint8Array`);
    }
}

/**
 * Internal helper to convert an ArrayBuffer to a UTF-8 string.
 * This is a workaround for environments that lack a built-in TextDecoder.
 * @param {ArrayBuffer} buffer - The ArrayBuffer to convert.
 * @returns {string} The UTF-8 string.
 */
function _arrayBufferToUtf8String(buffer) {
    if (!buffer || buffer.byteLength === 0) {
        return "";
    }
    // Use the existing, environment-safe codec functions
    const hex = dxCommonUtils.codec.arrayBufferToHex(buffer);
    return dxCommonUtils.codec.utf8HexToStr(hex);
}

/**
 * Gets the native common utils client object.
 * @returns {Object} The native client object.
 */
dxCommonUtils.getNative = function () {
    return utils;
}

export default dxCommonUtils;
