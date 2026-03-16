import fs from 'fs';

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

appContent = appContent.replace(
  /<ProtectedRoute>\s*<Dashboard \/>\s*<\/ProtectedRoute>/g,
  `<Dashboard />`
);

fs.writeFileSync('src/App.tsx', appContent);
