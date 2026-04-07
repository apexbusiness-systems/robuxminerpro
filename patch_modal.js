import fs from 'fs';

const file = 'src/components/LeadCaptureModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const search = `
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
`;

const replace = `
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const apiKey = import.meta.env.VITE_LEADS_API_KEY;
        if (apiKey) {
          headers['Authorization'] = \`Bearer \${apiKey}\`;
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
`;

content = content.replace(search, replace);
fs.writeFileSync(file, content);
