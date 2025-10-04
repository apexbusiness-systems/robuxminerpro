// Canonical bans (precise; avoid hitting brand strings like "RobuxMinerPro")
const FORBIDDEN = [
  /\bfree\s+robux\b/i,
  /\brobux(?:\W+|_)?generator\b/i,
  /\boff(?:[-\s])?platform\b.*\b(trade|payout|cash|casino|gambl\w*)\b/i
];

function isVisible(el: Element){
  const style = (el as HTMLElement).ownerDocument.defaultView!.getComputedStyle(el as HTMLElement);
  if(style.display==='none' || style.visibility==='hidden' || style.opacity==='0') return false;
  // skip aria-hidden containers
  if((el as HTMLElement).closest('[aria-hidden="true"]')) return false;
  return (el as HTMLElement).offsetParent !== null || (el as HTMLElement).matches('body,html');
}
function scanText(node: Node, hits: {node: Element, text: string}[]){
  // skip non-content containers
  if(node instanceof Element && node.matches('script,style,noscript,template')) return;
  if(node.nodeType===Node.TEXT_NODE){
    const parent = node.parentElement as Element | null;
    const t=(node.textContent||"").trim();
    if(parent && isVisible(parent) && t && FORBIDDEN.some(rx=>rx.test(t))){
      hits.push({node: parent, text: t});
    }
  } else node.childNodes.forEach(n=>scanText(n, hits));
}

function assertAssets(){
  const badImgs = Array.from(document.querySelectorAll('img'))
    .filter(img=>{
      const s=(img.getAttribute('src')||'').toLowerCase();
      return (/(logo|icon)/.test(s)) &&
             !/\/assets\/official_logo\.svg$/.test(s) &&
             !/\/assets\/app_icon\.svg$/.test(s);
    });
  if(badImgs.length){
    console.error('Non-canonical logo/icon detected:', badImgs.map(i=>i.getAttribute('src')));
    throw new Error('Brand guardrail tripped: replace with src/assets/official_logo.svg or src/assets/app_icon.svg');
  }
  const badLinks = Array.from(document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]'))
    .filter(l=>!/(official_logo\.svg|app_icon\.svg)$/.test(l.getAttribute('href')||''));
  if(badLinks.length){
    console.error('Non-canonical favicons detected:', badLinks.map(l=>l.getAttribute('href')));
  }
}

export function runGuardrails(){
  const hits:any[]=[];
  scanText(document.body, hits);
  if(hits.length){
    console.error('Forbidden phrases found:', hits.slice(0,10));
    throw new Error('Content guardrail tripped: remove unsafe messaging.');
  }
  assertAssets();
}