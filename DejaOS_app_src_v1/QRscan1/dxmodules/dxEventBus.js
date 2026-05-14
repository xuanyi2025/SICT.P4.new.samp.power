/**
 * dxEventBus - Multi-threaded Event Bus with RPC for DejaOS.
 *
 * This module provides a multi-threaded event bus for communication between the main thread
 * and workers in the QuickJS environment. It uses the main thread as a message relay,
 * enabling full-duplex event notifications across all threads.
 * 
 * It also includes a thread-safe RPC (Remote Procedure Call) module built on top of the event bus,
 * providing a clean and powerful interface for safe function calls between threads.
 *
 * Event Bus Features:
 * - Communication between workers via the main thread.
 * - Main-to-worker, worker-to-main, and main-to-main communication.
 * - Dynamic creation and termination of event-aware workers.
 *
 * RPC Features:
 * - Bidirectional calls: main-to-worker, worker-to-main, and worker-to-worker.
 * - Modern, Promise-based asynchronous API.
 * - Built-in timeout handling for calls.
 *
 * Usage (Event Bus):
 * // In main thread
 * import dxEventBus from './dxmodules/dxEventBus.js';
 * dxEventBus.newWorker('my_worker', '/app/code/src/worker.js');
 * dxEventBus.fire('some_topic', { data: 123 });
 *
 * // In worker.js
 * import dxEventBus from './dxmodules/dxEventBus.js';
 * dxEventBus.on('some_topic', (data) => { log.info(data); });
 *
 * Usage (RPC):
 * // 1. Initialize RPC in each thread.
 * // In main thread:
 * const rpc = dxEventBus.rpcInit();
 *
 * // In worker.js (this is done automatically for workers created with newWorker)
 * // you can access it via dxEventBus.rpc
 * const rpc = dxEventBus.rpc;
 *
 * // 2. Register a function on the callee side
 * rpc.register('add', ({ a, b }) => a + b);
 *
 * // 3. Make a remote call from the caller side
 * // a) Using async/await (recommended)
 * async function performRpcCall() {
 *   try {
 *      const result = await rpc.call('my_worker', 'add', { a: 5, b: 10 });
 *      log.info('RPC Result:', result); // 15
 *   } catch(e) {
 *      log.error(e)
 *   }
 * }
 *
 * // b) Using Promise .then/.catch
 * rpc.call('my_worker', 'add', { a: 5, b: 10 })
 *   .then(result => {
 *     log.info('RPC Result:', result);
 *   })
 *   .catch(error => {
 *     log.error('RPC Error:', error.message);
 *   });
 *
 * // 4. Send a fire-and-forget notification
 * rpc.notify('my_worker', 'logMessage', { message: 'Hello from main!' });
 * 
 * Note: In a worker script, accessing `dxEventBus.rpc` directly at the top level might fail
 * because the RPC module initializes after the worker script loads. To safely register
 * RPC functions, wrap your registration code in `std.setTimeout`:
 * 
 * std.setTimeout(() => {
 *     const rpc = dxEventBus.rpc;
 *     rpc.register('add', async ({ a, b }) => {
 *          // ... implementation
 *     });
 * }, 1000);
 */
import std from './dxStd.js'
import * as os from "os";

const bus = {}
const all = {}
const subs = {}
const isMain = (os.Worker.parent === undefined)
bus.id = isMain ? '__main' : null
bus.debug = false
/**
 * Creates and registers a new worker on the event bus. Must be called from the main thread.
 * @param {string} id - A unique identifier for the worker. Cannot be empty or duplicated.
 * @param {string} file - The absolute path to the worker's script file.
 * @throws {Error} If id is invalid, the file doesn't exist, or not called from the main thread.
 */
bus.newWorker = function (id, file) {
    if (!id) {
        throw new Error("eventbus newWorker:'id' should not be empty")
    } if (!file) {
        throw new Error("eventbus newWorker:'file' should not be empty")
    }
    if (!isMain) {
        throw new Error("eventbus newWorker should be invoke in main thread")
    }
    if (!std.exist(file)) {
        throw new Error("eventbus newWorker: file not found:" + file)
    }
    if (all[id]) {
        throw new Error("eventbus newWorker: worker already exists:" + id)
    }
    let content = std.loadFile(file) + '\n' + `
import __bus from '/app/code/dxmodules/dxEventBus.js'
import __std from '/app/code/dxmodules/dxStd.js'
__bus.id='${id}'
__bus.os.Worker.parent.onmessage = function (e) {
    if(!e.data){
        return
    }
    e = e.data
    if (!e || !e.topic) {
        return
    }
    let fun = __bus.handlers[e.topic]
    if (fun) {
        try {            
            if (__bus.debug){
                const now = Date.now();
                const sent =e.ts || 0;
                __std.err.puts(\`[dxEventBus] worker '\${__bus.id}' received '\${e.topic}' at \${now}, delay=\${now - sent}ms\\n\`);
                __std.err.flush();
            }
            fun(e.data)
        } catch (err) {
            __std.err.puts(\`[dxEventBus] Error in worker '${id}' event handler for topic \${e.topic}: \${err.message || err}\\n\`);
            __std.err.flush();
        }
    }
}
__bus.rpc = __bus.rpcInit();
Object.keys(__bus.handlers).forEach(key => {
    __bus.os.Worker.parent.postMessage({ __sub: key, id: __bus.id })
})
    `
    let newfile = file + '_' + id + '.js'
    std.saveFile(newfile, content)
    let worker = new os.Worker(newfile)
    all[id] = worker
    worker.onmessage = function (data) {
        if (data.data) {
            if (data.data.__sub) {
                sub(data.data.__sub, data.data.id)
                return
            }
            if (data.data.__unsub) {
                unsub(data.data.__unsub, data.data.id);
                return;
            }
            //worker发送过来的数据再调用一次主线程的fire，要么主线程自己消费，要么转发到其它worker
            bus.fire(data.data.topic, data.data.data)
        }
    }
}
/**
 * Terminates a worker and cleans up all its resources from the event bus.
 * This removes the worker instance and all of its event subscriptions.
 * @param {string} id - The unique identifier of the worker to terminate.
 */
bus.delWorker = function (id) {
    if (!id || !all[id]) {
        return;
    }

    delete all[id];

    for (const topic in subs) {
        if (subs.hasOwnProperty(topic)) {
            const subscribers = subs[topic];
            for (let i = subscribers.length - 1; i >= 0; i--) {
                if (subscribers[i] === id) {
                    subscribers.splice(i, 1);
                }
            }
            if (subscribers.length === 0) {
                delete subs[topic];
            }
        }
    }
}
/**
 * Lists the IDs of all currently active workers.
 * @returns {string[]} An array of worker IDs.
 */
bus.listWorkers = function () {
    return Object.keys(all);
}
/**
 * Fires an event to notify all subscribers for a given topic.
 *
 * This is a fire-and-forget operation. Callbacks for subscribers in the main thread are
 * executed synchronously and sequentially. For subscribers in workers, the event is sent
 * asynchronously via `postMessage`.
 *
 * @param {string} topic - The event topic to fire.
 * @param {*} data - The data to pass to the event subscribers.
 */
bus.fire = function (topic, data) {
    if (!topic || (typeof topic) != 'string') {
        throw new Error("eventbus :'topic' should not be null");
    }
    let now;
    if (bus.debug) {
        now = Date.now();
        std.err.puts(`[dxEventBus] fire '${topic}' at ${now} from ${bus.id}\n`);
        std.err.flush();
    }
    if (isMain) {
        if (subs[topic] && subs[topic].length > 0) {
            for (let i = 0; i < subs[topic].length; i++) {
                const id = subs[topic][i]
                if (id === '__main') {
                    if (bus.handlers[topic]) {
                        try {
                            bus.handlers[topic](data)
                            if (bus.debug) {
                                let send = Date.now();
                                std.err.puts(`[dxEventBus] main handler for '${topic}' executed,at ${now}, delay=${send - now}ms\n`);
                                std.err.flush();
                            }
                        } catch (e) {
                            std.err.puts(`[dxEventBus] Error in main thread event handler for topic '${topic}': ${e.message || e}\n`);
                            std.err.flush();
                        }
                    }
                } else {
                    const worker = all[id]
                    if (worker) {
                        try {
                            if (bus.debug) {
                                std.err.puts(`[dxEventBus] posting '${topic}' to worker '${id}' at ${Date.now()}\n`);
                                std.err.flush();
                            }
                            worker.postMessage({ topic: topic, data: data, ts: Date.now() })
                        } catch (e) {
                            std.err.puts(`[dxEventBus] Error posting message to worker '${id}' for topic '${topic}': ${e.message || e}\n`);
                            std.err.flush();
                        }
                    }
                }
            }
        }
    } else {
        try {
            os.Worker.parent.postMessage({ topic: topic, data: data, ts: Date.now() })
        } catch (e) {
            std.err.puts(`[dxEventBus] Error in worker '${bus.id}' posting message for topic '${topic}': ${e.message || e}\n`);
            std.err.flush();
        }
    }
}


bus.handlers = {}
/**
 * Subscribes to an event topic.
 * @param {string} topic - The event topic to subscribe to.
 * @param {function} callback - The function to execute when the event is fired. It receives event data as its only argument.
 */
bus.on = function (topic, callback) {
    if (!topic || (typeof topic) != 'string') {
        throw new Error("The 'topic' should not be null");
    }
    if (!callback || (typeof callback) != 'function') {
        throw new Error("The 'callback' should be a function");
    }
    sub(topic, bus.id)
    this.handlers[topic] = callback
}
/**
 * Unsubscribes from an event topic.
 * @param {string} topic - The event topic to unsubscribe from.
 */
bus.off = function (topic) {
    if (!topic || (typeof topic) != 'string') {
        throw new Error("The 'topic' should not be null");
    }
    if (this.handlers[topic]) {
        delete this.handlers[topic];
    }
    unsub(topic, bus.id);
}
/**
 * Returns the ID of the current thread (either '__main' or the worker's assigned ID).
 * @returns {string|null} The ID of the current thread.
 * @note In a worker, if this function is called at the top level of the script before the
 * event bus has fully initialized, it may return `null`. It is reliable within event handlers.
 */
bus.getId = function () {
    return bus.id
}
function unsub(topic, id) {
    if (isMain) {
        if (subs[topic]) {
            const index = subs[topic].indexOf(id);
            if (index > -1) {
                subs[topic].splice(index, 1);
            }
            if (subs[topic].length === 0) {
                delete subs[topic];
            }
        }
    } else {
        if (id != null) {
            os.Worker.parent.postMessage({ __unsub: topic, id: id });
        }
    }
}
function sub(topic, id) {
    if (isMain) {
        if (!subs[topic]) {
            subs[topic] = []
        }
        if (!subs[topic].includes(id)) {
            subs[topic].push(id)
        }
    } else {
        if (id != null) {
            os.Worker.parent.postMessage({ __sub: topic, id: id })
        }
    }
}

/* -------------------- RPC LOGIC -------------------- */
// Internal unique ID generator for RPC
let _idCounter = 0;
function _genRequestId(prefix) {
    return `rpc_${prefix}_${Date.now()}_${_idCounter++}`;
}

// Singleton RPC instance per thread
let rpcInstance = null;

/**
 * Initializes the RPC system for the current thread.
 *
 * This function should be called once in the main thread. For workers created
 * via `bus.newWorker`, this is called automatically. The returned RPC object
 * is also available as `bus.rpc` after initialization.
 *
 * @returns {object} The RPC instance with `call` and `register` methods.
 */
bus.rpcInit = function () {
    if (rpcInstance) {
        return rpcInstance;
    }
    const myId = bus.id;
    if (!myId) {
        throw new Error("[dxRpc] rpcInit() failed: bus.id is not available. Ensure this function is called after the event bus has assigned an ID.");
    }

    const pending = new Map();
    const handlers = new Map();
    const myTopic = '__rpc__' + myId;

    const rpcMessageHandler = msg => {
        if (!msg) return;
        const { type, requestId, fn, args, result, error, from } = msg;

        // Handle responses for 'call'
        if (type === 'response') {
            const p = pending.get(requestId);
            if (!p) return;
            if (p.timer) {
                try { std.clearTimeout(p.timer); } catch (e) { }
                p.timer = null;
            }
            pending.delete(requestId);
            if (error) p.reject(new Error(error));
            else p.resolve(result);
            return;
        }

        // Handle incoming 'request' ('call') and 'notify'
        if (type === 'request' || type === 'notify') {
            const reply = (payload) => {
                if (!from) {
                    std.err.puts(`[dxRpc] Received request for '${fn}' without a 'from' field. Cannot reply.\n`);
                    std.err.flush();
                    return;
                }
                bus.fire('__rpc__' + from, {
                    ...payload,
                    type: 'response',
                    requestId,
                    to: from,
                });
            }

            const handler = handlers.get(fn);
            if (!handler) {
                if (type === 'request') { // Only reply if a response is expected
                    reply({ error: `function '${fn}' not registered in worker '${myId}'` });
                }
                return;
            }

            try {
                const res = handler(args);
                if (type === 'request') { // Only reply for 'call', not 'notify'
                    if (res instanceof Promise) {
                        res.then(r => {
                            reply({ result: r });
                        }).catch(err => {
                            let errorMsg;
                            if (err instanceof Error) {
                                errorMsg = `${err.name}: ${err.message}`;
                                if (err.stack) errorMsg += `\n${err.stack}`;
                            } else {
                                errorMsg = String(err);
                            }
                            reply({ error: errorMsg });
                        });
                    } else {
                        reply({ result: res });
                    }
                }
            } catch (err) {
                if (type === 'request') {
                    let errorMsg;
                    if (err instanceof Error) {
                        errorMsg = `${err.name}: ${err.message}`;
                        if (err.stack) errorMsg += `\n${err.stack}`;
                    } else {
                        errorMsg = String(err);
                    }
                    reply({ error: errorMsg });
                } else { // 'notify'
                    // For fire-and-forget calls, log errors locally
                    std.err.puts(`[dxEventBus] Error in notified RPC function '${fn}': ${err?.stack || err?.message || String(err)}\n`);
                    std.err.flush();
                }
            }
        }
    };

    bus.on(myTopic, rpcMessageHandler);

    /**
     * Makes a remote procedure call to another thread.
     * @param {string} targetId - The ID of the target thread ('__main' or worker ID).
     * @param {string} fn - The name of the function to call.
     * @param {object} [args={}] - The arguments to pass to the function.
     * @param {number} [timeout=5000] - Timeout in milliseconds.
     * @returns {Promise<any>} A promise that resolves with the result or rejects with an error.
     */
    function call(targetId, fn, args = {}, timeout = 5000) {
        if (!targetId || !fn) {
            return Promise.reject(new Error('targetId and fn required'));
        }
        const requestId = _genRequestId(myId);
        return new Promise((resolve, reject) => {
            pending.set(requestId, { resolve, reject });
            const timer = std.setTimeout(() => {
                if (pending.has(requestId)) {
                    pending.delete(requestId);
                    reject(new Error(`RPC timeout for '${fn}' on worker '${targetId}'`));
                }
            }, timeout);

            pending.get(requestId).timer = timer;

            bus.fire('__rpc__' + targetId, {
                type: 'request',
                requestId,
                fn,
                args,
                from: myId,
                to: targetId
            });
        });
    }

    /**
     * Sends a fire-and-forget notification to another thread.
     * Does not wait for a result.
     * @param {string} targetId - The ID of the target thread ('__main' or worker ID).
     * @param {string} fn - The name of the function to call.
     * @param {object} [args={}] - The arguments to pass to the function.
     */
    function notify(targetId, fn, args = {}) {
        if (!targetId || !fn) {
            // Silently ignore invalid calls for fire-and-forget
            return;
        }
        bus.fire('__rpc__' + targetId, {
            type: 'notify',
            fn,
            args,
            from: myId,
            to: targetId,
        });
    }

    /**
     * Registers a function to be callable by other threads.
     * @param {string} name - The name to register the function under.
     * @param {function} fn - The function to register.
     */
    function register(name, fn) {
        if (!name || typeof fn !== 'function') {
            throw new Error('register requires name and function');
        }
        handlers.set(name, fn);
    }

    rpcInstance = {
        call,
        notify,
        register,
        clear: () => {
            bus.off(myTopic);
            handlers.clear();
            pending.clear();
            rpcInstance = null;
        }
    };
    bus.rpc = rpcInstance; // also attach to bus for convenience
    return rpcInstance;
}
bus.os = os

if (isMain) {
    bus.rpcInit(); // Automatically initialize RPC for the main thread
}

export default bus
