import {createRoot} from 'react-dom/client';
import { Suspense, lazy, useMemo, memo } from 'react';
import { TbSmartHome } from "react-icons/tb";
import { primaryColor } from "./global";
import './index.scss';

const background = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4NCjxzdmcgZmlsbD0iI2YzZjNmMyIgdmVyc2lvbj0iMS4xIiBpZD0iYmFja2dyb3VuZCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuc1hsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiANCgkgd2lkdGg9IjI5MHB4IiBoZWlnaHQ9IjM3MHB4IiB2aWV3Qm94PSIwIDAgNjAuMjA3IDYwLjIwNiIgeG1sU3BhY2U9InByZXNlcnZlIj4NCgk8Zz4NCgkJPHBhdGggZD0iTTUxLjc1MSwyMy40MzVWNS40NzRoLTcuMTA2djI1Ljk3NWgtNC4wODNWMTkuOTU4SDMwLjEwM3YtNy44NjJoLTkuMTk3djE4LjQ0MmgtMi4yODJ2LTUuNzQySDcuOTAydi03Ljg2MkgwdjcuODYydjUuNzQyDQoJCQl2MjQuMTk1aDE2LjM3MWgyLjI1M2gyLjI4Mmg3LjU2MWgxLjYzNmg1LjI2OGg1LjE5MWgxOS42NDVWMzguODI2di03LjM3N3YtOC4wMTVINTEuNzUxeiBNNC44NDMsMjYuODk5SDIuMjM5di02LjE4M2gyLjYwNFYyNi44OTkNCgkJCXogTTExLjA5MywzOC45Mkg4LjQ4OVYyOC40MzloMi42MDRWMzguOTJ6IE0xNS4zOSwzNC42MjNoLTIuNjA0di02LjE4NGgyLjYwNFYzNC42MjN6IE0yNS4xNTUsMjkuOTkxaC0yLjYwNHYtNi4xODNoMi42MDRWMjkuOTkxeg0KCQkJTTI1LjE1NSwyMS4xMDRoLTIuNjA0VjE0LjkyaDIuNjA0VjIxLjEwNHogTTI5LjU4MywzOC42MzJoLTIuNjA0VjMyLjQ1aDIuNjA0VjM4LjYzMnogTTM0LjQsMjkuOTkxaC0yLjYwNHYtNi4xODNIMzQuNFYyOS45OTF6DQoJCQlNNDkuMTEzLDM1LjU0aC0yLjYwNHYtNi4xODRoMi42MDRWMzUuNTR6IE00OS4xMTMsMjQuMTk1aC0yLjYwNHYtNi4xODNoMi42MDRWMjQuMTk1eiBNNDkuMTEzLDEzLjg4NWgtMi42MDRWNy43MDNoMi42MDRWMTMuODg1eg0KCQkJTTU0LjU4Miw0MC43NzloLTIuNjA0VjMwLjNoMi42MDRWNDAuNzc5eiIvPg0KCTwvZz4NCjwvc3ZnPg=='

const preloadApp = import('./App.js');
const App = lazy(() => preloadApp);

const MemoLogo = memo(TbSmartHome);                // Memorized logo to avoid re-renders

const redirect = sessionStorage.redirect;
if (redirect) {
  delete sessionStorage.redirect;
  if (redirect !== window.location.pathname + window.location.search + window.location.hash) {
    window.history.replaceState(null, "", redirect);
  }
}

// Fallback suspense
const FallbackView = memo(() => {
  const bg = useMemo( () => ({ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "100vw", backgroundImage: `url(${background})`, backgroundRepeat:"no-repeat", backgroundSize:"cover", backgroundPosition:"center" }), [] );
  const style = useMemo( () => ({ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "100vw", animation: "splash 0.75s linear infinite" }), [] );
  return <div style={bg}><div style={style}><MemoLogo size={120} strokeWidth={1} color={primaryColor} /></div></div>;
});

const root = createRoot(document.getElementById('root'));
root.render( <Suspense fallback={<FallbackView />}><App /></Suspense> );