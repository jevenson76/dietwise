import '@testing-library/jest-dom';

// Mock Capacitor plugins
jest.mock('@capacitor/camera', () => ({
  Camera: {
    getPhoto: jest.fn(() => Promise.resolve({
      webPath: 'mock-photo-path',
      format: 'jpeg'
    }))
  }
}));

jest.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    schedule: jest.fn(() => Promise.resolve()),
    getPending: jest.fn(() => Promise.resolve({ notifications: [] })),
    cancel: jest.fn(() => Promise.resolve())
  }
}));

// Mock Chart.js
jest.mock('chart.js/auto', () => ({
  Chart: class MockChart {
    constructor() {}
    destroy() {}
    update() {}
  },
  defaults: {
    locale: 'en-US'
  }
}));

// Mock Google Gemini AI
jest.mock('@google/genai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: jest.fn(() => Promise.resolve({
        response: {
          text: () => 'Mock AI response for meal suggestions'
        }
      }))
    }))
  }))
}));

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({
    redirectToCheckout: jest.fn(() => Promise.resolve()),
    confirmCardPayment: jest.fn(() => Promise.resolve({ paymentIntent: { status: 'succeeded' } }))
  }))
}));

// Mock barcode scanner
jest.mock('@zxing/library', () => ({
  BrowserMultiFormatReader: jest.fn(() => ({
    decodeFromVideoDevice: jest.fn(() => Promise.resolve({
      text: '123456789012'
    }))
  }))
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock crypto.randomUUID
global.crypto = {
  randomUUID: jest.fn(() => 'mock-uuid-1234-5678-9012'),
  subtle: {}
};

// Mock window.navigator
Object.defineProperty(window, 'navigator', {
  value: {
    onLine: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
  },
  writable: true
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});