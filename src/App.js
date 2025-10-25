// import logo from './logo.svg';
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./services/store/store.js";
import { AppRouter } from './routers/AppRouter';
import './App.scss';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Cargando sesi&oacute;n...</div>} persistor={persistor}>
        <AppRouter />
      </PersistGate>
    </Provider>
  );
}

export default App;
