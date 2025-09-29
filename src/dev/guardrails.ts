const FORBIDDEN = [
  /free\srobux/i, /robux\sgenerator/i, /robux\smin(ing)?/i,
  /off[-\s]?platform\s(trade|payout|cash|casino|gambl)/i
];

function scanText(node: Node, hits: {node: Element, text: string}[]){
  if(node.nodeType===Node.TEXT_NODE){
    const t=node.textContent||"";
    if(FORBIDDEN.some(rx=>rx.test(t))) hits.push({node: (node.parentElement as Element), text: t.trim()});
  } else node.childNodes.forEach(n=>scanText(n, hits));
}

function assertAssets(){
  const badImgs = Array.from(document.querySelectorAll('img'))
    .filter(img=>{
      const s=(img.getAttribute('src')||'').toLowerCase();
      return (s.includes('logo')||s.includes('icon')) && !s.endsWith('/official_logo.png') && !s.endsWith('/app_icon.png');
    });
  if(badImgs.length){
    console.error('Non-canonical logo/icon detected:', badImgs.map(i=>i.getAttribute('src')));
    throw new Error('Brand guardrail tripped: replace with /official_logo.png or /app_icon.png');
  }
  const badLinks = Array.from(document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]'))
    .filter(l=>!/(official_logo.png|app_icon.png)/.test(l.getAttribute('href')||''));
  if(badLinks.length){
    console.error('Non-canonical favicons detected:', badLinks.map(l=>l.getAttribute('href')));
  }
}

export function runGuardrails(){
  const hits:any=[];
  scanText(document.body, hits);
  if(hits.length){
    console.error('Forbidden phrases found:', hits.slice(0,10));
    throw new Error('Content guardrail tripped: remove unsafe messaging.');
  }
  assertAssets();
  // Optional: highlight issues in red outline for quick fixes
  hits.forEach(h=>{ (h.node as HTMLElement).style.outline='3px solid red'; });
}