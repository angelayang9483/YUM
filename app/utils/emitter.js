// emitter.js
const listeners = {};

export function on(eventName, callback) {
  if (!listeners[eventName]) listeners[eventName] = [];
  listeners[eventName].push(callback);
  // return an unsubscribe function
  return () => {
    listeners[eventName] = listeners[eventName].filter(fn => fn !== callback);
  };
}

export function emit(eventName, payload) {
  (listeners[eventName] || []).forEach(fn => {
    try { fn(payload); }
    catch (e) { console.error(`Error in listener for ${eventName}:`, e); }
  });
}
