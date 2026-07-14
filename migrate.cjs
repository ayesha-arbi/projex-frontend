const fs = require('fs');
const path = require('path');

function migrateFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add components import if not there
  if (!content.includes('import { Button')) {
    content = content.replace(/import \{.*?\} from ["'].\/assets\/tokens\.js["'];?/, match => {
      return match + '\nimport { Button, Input, Select, Textarea, Card, Label, Badge, Avatar, Text } from "../components.jsx";';
    });
    content = content.replace(/import \{.*?\} from ["']\.\.\/assets\/tokens\.js["'];?/, match => {
      return match + '\nimport { Button, Input, Select, Textarea, Card, Label, Badge, Avatar, Text } from "../components.jsx";';
    });
  }

  // 2. Remove inline Label, Input, Select, Textarea if they exist
  const removeComponent = (name) => {
    const startRegex = new RegExp(`function ${name}\\(\\{.*?\\}\\) \\{`, 's');
    const match = content.match(startRegex);
    if (match) {
      const startIdx = match.index;
      let openBrackets = 0;
      let i = startIdx + match[0].length;
      openBrackets = 1;
      while (i < content.length && openBrackets > 0) {
        if (content[i] === '{') openBrackets++;
        if (content[i] === '}') openBrackets--;
        i++;
      }
      content = content.slice(0, startIdx) + content.slice(i);
    }
  };

  ['Label', 'Input', 'Select', 'Textarea'].forEach(removeComponent);

  // 3. Replace <button> with <Button> for standard CTAs
  // This is a bit tricky, but we can look for specific button texts
  content = content.replace(/<button[^>]*>([\s\S]*?)<\/button>/g, (match, inner) => {
    if (inner.includes('Back') || inner.includes('Cancel')) {
      return `<Button variant="outline" onClick={${match.match(/onClick=\{([^}]+)\}/)?.[1] || 'undefined'}}>${inner.trim()}</Button>`;
    }
    if (inner.includes('Continue') || inner.includes('Next') || inner.includes('Create') || inner.includes('Sign In') || inner.includes('Login') || inner.includes('Save') || inner.includes('Submit') || inner.includes('Upload')) {
      let typeMatch = match.match(/type=["']([^"']+)["']/);
      let typeStr = typeMatch ? ` type="${typeMatch[1]}"` : '';
      let onClickMatch = match.match(/onClick=\{([^}]+)\}/);
      let onClickStr = onClickMatch ? ` onClick={${onClickMatch[1]}}` : '';
      let disabledMatch = match.match(/disabled=\{([^}]+)\}/);
      let disabledStr = disabledMatch ? ` disabled={${disabledMatch[1]}}` : '';
      return `<Button variant="primary"${typeStr}${onClickStr}${disabledStr}>${inner.trim()}</Button>`;
    }
    return match;
  });

  // 4. Update box-shadows to the smoother, premium one used in components.jsx
  content = content.replace(/boxShadow:\s*["'][^"']*rgba\(12,\s*35,\s*64,\s*0\.06\)["']/g, 'boxShadow: "0 10px 40px rgba(12,35,64,0.06)"');

  // 5. Replace card divs with <Card>
  // A typical card div in these files has something like: background: C.white, borderRadius: 16
  // This is too hard to reliably regex, so we leave it as is, or target specific ones.
  // Actually, we can replace `border: "1px solid " + C.border` with just better styles or let it be.
  
  fs.writeFileSync(filePath, content);
  console.log(`Migrated ${filePath}`);
}

const files = [
  'src/student/student-onboarding.jsx',
  'src/company/company-onboarding.jsx',
  'src/company/company-login.jsx',
  'src/company/Companydashboard.jsx',
  'src/student/dashboard/StudentDashboard.jsx',
  'src/student/dashboard/UploadProjectTab.jsx',
  'src/company/Browseprojectstab.jsx'
];

files.forEach(migrateFile);
