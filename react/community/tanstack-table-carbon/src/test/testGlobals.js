// NOTE: Polyfill ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

// NOTE: Polyfill IntersectionObserver
class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    // NOTE: Immediately trigger callback with mock entry
    this.callback([{ isIntersecting: true, target: {} }]);
  }
  unobserve() {}
  disconnect() {}
}
global.IntersectionObserver = IntersectionObserver;

// NOTE: Polyfill matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// NOTE: Optional: scrollTo
if (!window.scrollTo) {
  window.scrollTo = () => {};
}

// NOTE: Polyfill scrollIntoView for Carbon Dropdown
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// NOTE: Mock localStorage for tests
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
