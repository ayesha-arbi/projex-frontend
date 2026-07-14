const fs = require('fs');

const files = [
  'src/student/student-onboarding.jsx',
  'src/company/company-onboarding.jsx',
  'src/company/company-login.jsx',
  'src/company/Companydashboard.jsx',
  'src/student/dashboard/StudentDashboard.jsx',
  'src/student/dashboard/UploadProjectTab.jsx',
  'src/company/Browseprojectstab.jsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add components import
  if (!content.includes('import { Button')) {
    content = content.replace(/import \{.*?\} from ["'].\/assets\/tokens\.js["'];?/, match => {
      return match + '\nimport { Button, Input, Select, Textarea, Card, Label, Badge, Avatar, Text } from "../components.jsx";';
    });
    content = content.replace(/import \{.*?\} from ["']\.\.\/assets\/tokens\.js["'];?/, match => {
      return match + '\nimport { Button, Input, Select, Textarea, Card, Label, Badge, Avatar, Text } from "../components.jsx";';
    });
  }

  // 2. Remove inline definitions
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

  // 3. Update box-shadows
  content = content.replace(/boxShadow:\s*["'][^"']*rgba\(12,\s*35,\s*64,\s*0\.06\)["']/g, 'boxShadow: "0 10px 40px rgba(12,35,64,0.06)"');

  // 4. Safely replace <button> tags with <Button> by removing messy inline hover logic
  // Target specific known buttons from the codebase

  // "Back" button
  content = content.replace(/<button type="button" onClick=\{back\}[^>]*>[\s\S]*?<\/button>/g, '<Button variant="outline" onClick={back} style={{ flex: 1 }}><ArrowLeft size={15} strokeWidth={2} /> Back</Button>');
  content = content.replace(/<button onClick=\{back\}[^>]*>[\s\S]*?<\/button>/g, '<Button variant="outline" onClick={back} style={{ flex: 1 }}><ArrowLeft size={15} strokeWidth={2} /> Back</Button>');

  // "Upload Photo" / "Change Photo" / "Upload Logo" / "Change Logo"
  content = content.replace(/<button type="button" onClick=\{\(\) => inputRef\.current\.click\(\)\}[^>]*>[\s\S]*?<\/button>/g, (match) => {
    if (match.includes("Logo")) return '<Button variant="outline" type="button" onClick={() => inputRef.current.click()}>{preview ? "Change Logo" : "Upload Logo"}</Button>';
    return '<Button variant="outline" type="button" onClick={() => inputRef.current.click()}>{preview ? "Change Photo" : "Upload Photo"}</Button>';
  });

  // "Sign in to Your Account" switch button
  content = content.replace(/<button onClick=\{e => \{ e\.preventDefault\(\); onSwitchToLogin && onSwitchToLogin\(\); \}\}[^>]*>[\s\S]*?<\/button>/g, '<Button variant="primary" onClick={e => { e.preventDefault(); onSwitchToLogin && onSwitchToLogin(); }}>Sign In to Your Account <ArrowRight size={15} strokeWidth={2} /></Button>');

  // Submit buttons
  content = content.replace(/<button type="button" onClick=\{next\} disabled=\{submitting\}[^>]*>[\s\S]*?<\/button>/g, '<Button variant="primary" onClick={next} disabled={submitting} style={{ flex: 2 }}>{submitting ? <><Loader2 size={15} style={{ animation: "spin 0.7s linear infinite" }} /> Creating account...</> : isLast ? <>Create My Account <GraduationCap size={16} strokeWidth={2} /></> : <>Continue <ArrowRight size={15} strokeWidth={2} /></>}</Button>');

  // Login submit button
  content = content.replace(/<button type="button" onClick=\{handleLogin\} disabled=\{submitting\}[^>]*>[\s\S]*?<\/button>/g, '<Button variant="primary" onClick={handleLogin} disabled={submitting} style={{ width: "100%" }}>{submitting ? <><Loader2 size={15} style={{ animation: "spin 0.7s linear infinite" }} /> Signing in...</> : <>Sign In <ArrowRight size={15} strokeWidth={2} /></>}</Button>');
  content = content.replace(/<button type="button" onClick=\{handleSubmit\} disabled=\{submitting\}[^>]*>[\s\S]*?<\/button>/g, '<Button variant="primary" onClick={handleSubmit} disabled={submitting} style={{ width: "100%" }}>{submitting ? <><Loader2 size={15} style={{ animation: "spin 0.7s linear infinite" }} /> Signing in...</> : <>Sign In <ArrowRight size={15} strokeWidth={2} /></>}</Button>');


  fs.writeFileSync(file, content);
  console.log(`Migrated ${file}`);
});
