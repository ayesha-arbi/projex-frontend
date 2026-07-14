const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
};

const files = [
  ...walk('src/student/dashboard'),
  ...walk('src/company')
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Token replacements
  content = content.replace(/C\.ink/g, 'C.navy');
  content = content.replace(/C\.off/g, 'C.cream');
  content = content.replace(/C\.blue/g, 'C.navy');
  content = content.replace(/C\.green/g, 'C.gold');
  content = content.replace(/C\.border2/g, 'C.border');
  
  // Font replacements
  content = content.replace(/'Plus Jakarta Sans'/g, "'Sora'");
  content = content.replace(/Plus Jakarta Sans/g, "Sora");
  content = content.replace(/'Instrument Serif'/g, "'Inter'");
  content = content.replace(/Instrument Serif/g, "Inter");

  // Specific Layout overrides
  content = content.replace(/background:\s*["']rgba\(3,62,102,0\.65\)["']/g, 'background: "rgba(255,255,255,0.12)"');
  
  // Specific role chips replacements to use Badge or fix styles
  // Actually, let's just make the old green transparent background golden.
  content = content.replace(/rgba\(163,\s*207,\s*62/g, 'rgba(176,141,87'); // approx gold rgb
  content = content.replace(/rgba\(3,\s*62,\s*102/g, 'rgba(12,35,64'); // approx navy rgb

  // Dashboard global style tag URL replacements
  // Just strip the old @import url entirely since it's already in index.css
  content = content.replace(/@import url\(['"]https:\/\/fonts\.googleapis\.com\/css2\?family=Plus\+Jakarta\+Sans[^;]+;\n?/g, '');
  
  fs.writeFileSync(file, content);
  console.log('Migrated layout tokens in:', file);
});
