const fs = require('fs');

let c = fs.readFileSync('src/student/student-onboarding.jsx', 'utf8');
c = c.replace(/<Button variant="primary" type="button" onClick=\{\(\) => inputRef\.current\.click\(\)\}>inputRef\.current\.click\(\)\}/g, '<Button variant="outline" type="button" onClick={() => inputRef.current.click()}>');
c = c.replace(/<Button variant="primary" type="button" onClick=\{handleLogin\} disabled=\{submitting\} onMouseEnter=\{\(\) => setLoginHov\(true\)\} onMouseLeave=\{\(\) => setLoginHov\(false\)\}/g, '<Button variant="primary" type="button" onClick={handleLogin} disabled={submitting}>');
c = c.replace(/<Button variant="primary" type="button" onClick=\{handleLogin\} disabled=\{submitting\}>setLoginHov\(true\)\} onMouseLeave=\{\(\) => setLoginHov\(false\)\}/g, '<Button variant="primary" type="button" onClick={handleLogin} disabled={submitting}>');
c = c.replace(/<Button variant="primary" type="button" onClick=\{\(\) => inputRef\.current\.click\(\)\}>inputRef\.current\.click\(\)\}/g, '<Button variant="outline" type="button" onClick={() => inputRef.current.click()}>');
fs.writeFileSync('src/student/student-onboarding.jsx', c);

let cl = fs.readFileSync('src/company/company-login.jsx', 'utf8');
cl = cl.replace(/<Button variant="primary" type="button" onClick=\{handleSubmit\} disabled=\{submitting\}>\s*setSubmitHov\(false\)\}/g, '<Button variant="primary" type="button" onClick={handleSubmit} disabled={submitting}>');
fs.writeFileSync('src/company/company-login.jsx', cl);

let co = fs.readFileSync('src/company/company-onboarding.jsx', 'utf8');
co = co.replace(/<Button variant="primary" type="button" onClick=\{\(\) => inputRef\.current\.click\(\)\}>inputRef\.current\.click\(\)\}/g, '<Button variant="outline" type="button" onClick={() => inputRef.current.click()}>');
co = co.replace(/<Button variant="primary" type="button" onClick=\{e => \{ e\.preventDefault\(\); onSwitchToLogin && onSwitchToLogin\(\); \}\}>onSwitchToLogin && onSwitchToLogin\(\)\}/g, '<Button variant="primary" type="button" onClick={e => { e.preventDefault(); onSwitchToLogin && onSwitchToLogin(); }}>');
co = co.replace(/<Button variant="outline" onClick=\{back\}>\s*setBackHov\(false\)\}/g, '<Button variant="outline" onClick={back}>');
co = co.replace(/<Button variant="primary" type="button" onClick=\{next\} disabled=\{submitting\}>\s*setNextHov\(false\)\}/g, '<Button variant="primary" type="button" onClick={next} disabled={submitting}>');
fs.writeFileSync('src/company/company-onboarding.jsx', co);

console.log("Done");
