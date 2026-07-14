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

  // Fix doubled Buttons and messy style blocks
  // 1. Remove `<Button...set...Hov(true)}...` lines if followed by another `<Button`
  content = content.replace(/<Button[^>]*>set[A-Za-z]+Hov\(true\)}[^\n]*\n\s*<Button/g, '<Button');

  // 2. Fix `<Button... >set...Hov(true)}... >`
  // We can just find `<Button` and replace any garbage `set[A-Za-z]+Hov(true)}... >` with just `>`
  content = content.replace(/(<Button[^>]*?)>set[A-Za-z]+Hov\(true\)\}[^>]*>/g, '$1>');

  // 3. Same for `onMouseEnter={e => { e.currentTarget.style...`
  content = content.replace(/(<Button[^>]*?)>onMouseEnter=\{e => \{ e\.currentTarget\.style[^>]*>/g, '$1>');

  // 4. Same for `inputRef.current.click()}`
  content = content.replace(/(<Button[^>]*?)>inputRef\.current\.click\(\)\}[^>]*>/g, '$1>');

  // 5. Same for `onSwitchToLogin && onSwitchToLogin()}`
  content = content.replace(/(<Button[^>]*?)>onSwitchToLogin && onSwitchToLogin\(\)\}[^>]*>/g, '$1>');

  // 6. Fix `style={{...}}` blocks inside Buttons since we don't need them mostly, but we can just leave them if they are valid.
  // The esbuild error said: "Unexpected closing "div" tag does not match opening "Button" tag". This is because the above replacements left broken tags.
  // Let's do a more brutal fix for student-onboarding and company-onboarding

  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});
