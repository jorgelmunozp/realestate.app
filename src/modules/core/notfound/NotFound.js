import { Link } from "react-router-dom";

export function NotFound(){
  return (
    <main style={{minHeight:"60vh",display:"grid",placeItems:"center",padding:"32px"}}>
      <div style={{textAlign:"center"}}>
        <h1 style={{fontSize:"64px",margin:0}}>404</h1>
        <p style={{margin:"8px 0 16px"}}>La página que buscas no existe.</p>
        <Link to="/" style={{padding:"10px 16px",borderRadius:"12px",border:"1px solid #ccc",display:"inline-block"}}>
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
export default NotFound;
