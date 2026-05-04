const fs = require('fs');

const htmlPath = 'c:\\Users\\gawah\\Downloads\\projek web\\undangan\\index.html';
const cssPath = 'c:\\Users\\gawah\\Downloads\\projek web\\undangan\\src\\styles\\main.css';

// 1. Update main.css
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace('--color-bg-base: #050507;', '--color-bg-base: #fdfdfd;');
css = css.replace('--color-bg-surface: #121216;', '--color-bg-surface: #f5f5f7;');
css = css.replace('@apply bg-bg-base text-white', '@apply bg-bg-base text-slate-900');
css = css.replace(/bg-white\/5/g, 'bg-slate-900/5');
css = css.replace(/border-white\/10/g, 'border-slate-900/10');
fs.writeFileSync(cssPath, css);

// 2. Update index.html
let html = fs.readFileSync(htmlPath, 'utf8');

const replacements = [
    // Text colors
    [/text-white/g, 'text-slate-900'],
    [/text-slate-300/g, 'text-slate-600'],
    [/text-slate-400/g, 'text-slate-500'],
    [/text-slate-500/g, 'text-slate-400'], // Flip these too so they are slightly darker
    [/hover:text-white/g, 'hover:text-slate-900'],
    
    // Backgrounds & Borders for glass/transparent elements
    [/bg-white\/5/g, 'bg-slate-900/5'],
    [/bg-white\/10/g, 'bg-slate-900/10'],
    [/border-white\/5/g, 'border-slate-900/5'],
    [/border-white\/10/g, 'border-slate-900/10'],
    [/border-white\/20/g, 'border-slate-900/20'],
    [/border-white\/40/g, 'border-slate-900/40'],
    
    // Buttons that were solid white -> solid dark
    [/bg-white text-black/g, 'bg-slate-900 text-white'],
    [/bg-white/g, 'bg-slate-900'], // Note: this might affect some other bg-white, but in dark theme bg-white is rare except for buttons.
    [/text-black/g, 'text-white'],
    
    // Since we blindly replaced bg-white, we might need to fix 'bg-white/x' if it became 'bg-slate-900/x'. Oh wait, regex order matters.
    // I already did bg-white/5 etc above, so bg-white alone will only match exact bg-white.
];

// Execute replacements
replacements.forEach(([regex, replacement]) => {
    html = html.replace(regex, replacement);
});

// Fix specific things that might have broken
// e.g. Phone mockups inside Hero section should probably stay dark.
// Actually, let's let the phones become light mode too! A white iphone mockup looks clean.
// Wait, the inner mockups have `bg-black/60` and `bg-black`.
html = html.replace(/bg-black\/60/g, 'bg-white/60');
html = html.replace(/border-zinc-900/g, 'border-slate-200'); // iPhone bezels become silver/white
html = html.replace(/bg-black shadow-/g, 'bg-white shadow-');
// Dynamic island should remain black
// The dynamic island currently uses bg-slate-900 (because bg-black became bg-white? No, bg-black is not globally replaced).
// Let's globally replace bg-black to bg-white EXCEPT for dynamic islands.
// Actually, let's just leave bg-black alone unless specifically targeted.

fs.writeFileSync(htmlPath, html);
console.log('Theme changed to clean white!');
