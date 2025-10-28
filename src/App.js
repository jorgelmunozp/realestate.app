import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./services/store/store.js";
import { AppRouter } from './routers/AppRouter';
import './App.scss';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Cargando sesión...</div>} persistor={persistor}>
        <AppRouter />
      </PersistGate>
    </Provider>
  );
}

export default App;
