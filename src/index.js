import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';

const redirect = sessionStorage.redirect;
if (redirect) {
  delete sessionStorage.redirect;
  if (redirect !== window.location.pathname + window.location.search + window.location.hash) {
    window.history.replaceState(null, "", redirect);
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render( <App /> );