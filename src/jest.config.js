// jest.config.js
module.exports = {
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest'  // Esto asegura que Jest use Babel para transformar el código JS y JSX
  },
  testEnvironment: 'jsdom',  // Usamos jsdom para simular el navegador en las pruebas
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',  // Esto es para simular archivos de estilo
  },
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],  // Si tienes configuraciones globales o mocks
};
