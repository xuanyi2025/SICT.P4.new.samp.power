import { mapClass } from './libvbar-m-dxmap.so'
/**
 * In-memory Key-Value Store Module (dxMap)
 *
 * Features:
 * - Provides a topic-based, in-memory key-value storage.
 * - Thread-safe: Data can be safely accessed and modified from multiple JavaScript threads.
 * - Supports storing various data types (string, number, boolean, object, array) by automatically serializing/deserializing them.
 *
 * Usage:
 * - First, get a map instance for a specific topic using `map.get('myTopic')`.
 * - Then, use the instance's methods (`put`, `get`, `has`, `del`, etc.) to manage data within that topic.
 *
 * @example
 * import map from 'dxMap';
 *
 * // Get an instance for the 'user' topic
 * const userMap = map.get('user');
 *
 * // Put some data
 * userMap.put('name', 'John Doe');
 * userMap.put('age', 30);
 * userMap.put('isActive', true);
 * userMap.put('roles', ['admin', 'editor']);
 *
 * // Get data
 * const name = userMap.get('name'); // "John Doe"
 *
 * // Check if a key exists
 * const hasAge = userMap.has('age'); // true
 *
 * // Delete a key
 * userMap.del('isActive');
 *
 * // Get all keys for the topic
 * const allKeys = userMap.keys(); // ['name', 'age', 'roles']
 *
 * Doc/Demo: https://github.com/DejaOS/DejaOS
 */
const mapObj = new mapClass();

const map = {
    /**
     * Gets a map instance for a given topic name.
     * Each topic is a separate namespace for keys.
     * @param {string} name - The name of the topic. Must not be null or empty.
     * @returns {{keys: (function(): string[]), get: (function(string): *), has: (function(string): boolean), put: (function(string, *): boolean), del: (function(string): boolean), destroy: (function(): boolean)}} An object with methods to interact with the map for the specified topic.
     * @throws {Error} If the name is null or empty.
     */
    get: function (name) {
        if (!name || name.length == 0) {
            throw new Error("dxMap.get:name should not be null or empty")
        }
        //第一次put会自动创建实例
        return {
            /**
             * Retrieves all keys within the current topic.
             * @returns {string[]} An array of all keys for the topic. Returns an empty array if the topic is empty or does not exist.
             */
            keys: function () {
                let all = mapObj.keys(name)
                return all == null ? [] : all
            },
            /**
             * Retrieves the value associated with a key within the current topic.
             * The returned value will be deserialized to its original type (number, boolean, object, array, or string).
             * @param {string} key - The key to retrieve. Must not be null or empty.
             * @returns {*} The value associated with the key, or `undefined` if the key does not exist.
             * @throws {Error} If the key is null or empty.
             */
            get: function (key) {
                if (!key || key.length < 1) {
                    throw new Error("The 'key' parameter cannot be null or empty")
                }
                // put空字符串，get会是null
                let value = mapObj.get(name, key)
                // C layer returns null if not found. JS layer should propagate this.
                if (value === null) {
                    return undefined; // Return undefined for non-existent keys, a common JS pattern.
                }
                return _parseString(value)
            },
            /**
             * Checks if a key exists within the current topic.
             * @param {string} key - The key to check. Must not be null or empty.
             * @returns {boolean} `true` if the key exists, `false` otherwise.
             * @throws {Error} If the key is null or empty.
             */
            has: function (key) {
                if (!key || key.length < 1) {
                    throw new Error("The 'key' parameter cannot be null or empty")
                }
                return mapObj.has(name, key)
            },
            /**
             * Inserts or updates a key-value pair within the current topic.
             * The value will be automatically serialized.
             * If `value` is `null` or `undefined`, the key will be deleted.
             * @param {string} key - The key to set. Must not be null or empty.
             * @param {*} value - The value to associate with the key. Supported types: string, number, boolean, object, array. Functions are not supported.
             * @returns {boolean} Returns `true` on success.
             * @throws {Error} If the key is null or empty, or if the value is a function.
             */
            put: function (key, value) {
                if (!key || key.length < 1) {
                    throw new Error("The 'key' parameter cannot be null or empty")
                }
                // Implement "set null/undefined to delete" logic.
                if (value === null || value === undefined) {
                    return mapObj.delete(name, key);
                }
                return mapObj.insert(name, key, _stringifyValue(value))
            },
            /**
             * Deletes a key-value pair from the current topic.
             * @param {string} key - The key to delete. Must not be null or empty.
             * @returns {boolean} `true` if the key was found and deleted, `false` otherwise.
             * @throws {Error} If the key is null or empty.
             */
            del: function (key) {
                if (!key || key.length < 1) {
                    throw new Error("The 'key' parameter cannot be null or empty")
                }
                return mapObj.delete(name, key)
            },
            /**
             * Destroys the entire topic, deleting all its keys and freeing associated memory.
             * After calling destroy, the instance should not be used anymore.
             * @returns {boolean} Returns `true` on success.
             */
            destroy: function () {
                return mapObj.destroy(name)
            },
        }
    }

}
/**
 * Serializes a value into a string with a type prefix.
 * @private
 * @param {*} value - The value to serialize.
 * @returns {string} The serialized string.
 */
function _stringifyValue(value) {
    const type = typeof value
    if (type === 'string') {
        return value
    }
    if (type === 'number') {
        return '#n#' + value
    }
    if (type === 'boolean') {
        return '#b#' + value
    }
    if (type === 'object') {
        // 如果是对象，进一步判断是否为数组
        if (Array.isArray(value)) {
            return '#a#' + JSON.stringify(value);
        }// else if (value === null) { 前面已经规避了null的情况
        return '#o#' + JSON.stringify(value)
    }
    if (type === 'function') {
        throw new Error("The 'value' parameter should not be function")
    }
}
/**
 * Deserializes a string with a type prefix back to its original value.
 * @private
 * @param {string} str - The string to deserialize.
 * @returns {*} The deserialized value.
 */
function _parseString(str) {
    if (str.startsWith('#n#')) {
        // 解析数字
        const numberStr = str.substring(3);
        return numberStr.includes('.') ? parseFloat(numberStr) : parseInt(numberStr, 10);
    } else if (str.startsWith('#b#')) {
        // 解析布尔值
        return str.substring(3) === 'true';
    } else if (str.startsWith('#a#')) {
        // 解析数组
        return JSON.parse(str.substring(3));
    } else if (str.startsWith('#o#')) {
        // 解析对象
        return JSON.parse(str.substring(3));
    } else {
        // 默认情况下，将字符串返回
        return str;
    }
}
export default map;

