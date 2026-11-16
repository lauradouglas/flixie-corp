/** Development-only typography stress checks; never loaded by production. */
export function applyTypographyQa() {
  const query = new URLSearchParams(location.search);
  const theme=query.get('qaTheme');
  if(theme==='light'||theme==='dark'){
    const style=document.createElement('style');style.textContent=`:root,.corporate-site,.flixie-web{color-scheme:${theme}!important;}`;document.head.append(style);
  }
  const appPrompt=query.get('qaAppPrompt');
  if(appPrompt==='ios'||appPrompt==='android')document.documentElement.dataset.flixieQaAppPrompt=appPrompt;
  if (query.get('qaTextScale') === '200') {
    document.documentElement.style.fontSize = '200%';
    document.documentElement.dataset.flixieQaTextScale = '200';
  }
  if (query.get('qaTextSpacing') === 'expanded') {
    const style = document.createElement('style');
    style.textContent = ':is(.corporate-site,.flixie-web) * { line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important; } :is(.corporate-site,.flixie-web) p { margin-bottom:2em !important; }';
    document.head.append(style);
    document.documentElement.dataset.flixieQaTextSpacing = 'expanded';
  }
}
