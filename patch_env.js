import fs from 'fs';

function addEnv(file) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        if (!content.includes('VITE_LEADS_API_KEY')) {
            content += '\nVITE_LEADS_API_KEY="your-api-key-here"';
            fs.writeFileSync(file, content);
        }
    }
}

addEnv('.env.example');
addEnv('.env.ci');
