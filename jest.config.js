module.exports = {
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest'               // Asegura que Jest use Babel para transformar el código JS y JSX
  },
  testEnvironment: 'jsdom',                       // Usa jsdom para simular el navegador en las pruebas
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',  // Simula archivos de estilo
  },
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],  // Para configuraciones globales o mocks
};
