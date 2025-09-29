import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import Mentor from "../pages/Mentor";

export default function ChatDock({open,onClose}:{open:boolean;onClose:()=>void}){
  const closeBtn = useRef<HTMLButtonElement>(null);
  useEffect(()=>{ document.body.style.overflow = open ? "hidden" : ""; if(open) setTimeout(()=>closeBtn.current?.focus(), 0); },[open]);
  if(!open) return null;
  return createPortal(
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="surface modal" role="dialog" aria-modal="true" aria-labelledby="mentor-title" onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:12}}>
          <h2 id="mentor-title" style={{margin:0}}>Robux Mentor</h2>
          <button ref={closeBtn} className="btn" style={{marginLeft:"auto"}} onClick={onClose}>Close</button>
        </div>
        <div style={{padding:"0 12px 12px"}}>
          <Mentor/>
          <p className="muted" style={{marginTop:8}}>Official links only; we refuse "free Robux" requests for safety.</p>
        </div>
      </div>
    </div>,
    document.body
  );
}