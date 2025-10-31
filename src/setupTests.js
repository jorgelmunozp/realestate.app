import '@testing-library/jest-dom';

// polyfills comunes en jsdom
if (!window.scrollTo) window.scrollTo = jest.fn();

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(q => ({
      matches: false, media: q, onchange: null,
      addListener: jest.fn(), removeListener: jest.fn(),
      addEventListener: jest.fn(), removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  });
}

if (!global.ResizeObserver) {
  global.ResizeObserver = class {
    observe(){} unobserve(){} disconnect(){}
  };
}

