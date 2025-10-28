import '@testing-library/jest-dom';

// al tope del test o en setupTests
if (!window.sessionStorage) {
  const mem = (() => {
    let s = {};
    return {
      getItem: k => (k in s ? s[k] : null),
      setItem: (k,v) => { s[k] = String(v); },
      removeItem: k => { delete s[k]; },
      clear: () => { s = {}; },
    };
  })();
  Object.defineProperty(window, 'sessionStorage', { value: mem });
}

// ---- Mock axios global que ya tienes ----
jest.mock('axios', () => {
  const handlers = { get:jest.fn(), post:jest.fn(), put:jest.fn(), patch:jest.fn(), delete:jest.fn(), request:jest.fn(), head:jest.fn(), options:jest.fn() };
  const interceptors = { request:{ use:jest.fn(), eject:jest.fn() }, response:{ use:jest.fn(), eject:jest.fn() } };
  const instance = Object.assign(() => Promise.resolve({}), { defaults:{}, interceptors, ...handlers });
  instance.create = jest.fn(() => instance);
  instance.isCancel = () => false;
  return instance;
});

// ---- Utilidades DOM ----
window.scrollTo = window.scrollTo || (() => {});

// ---- Location mock seguro (read-only en JSDOM) ----
const LOC = new URL('http://localhost/');
Object.defineProperty(window, 'location', {
  value: {
    ...window.location,
    href: LOC.href,
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  },
  writable: false,
});
