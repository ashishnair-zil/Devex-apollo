import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const exports = [];
fs.readdirSync(__dirname + '/').forEach(async (file) => {
    if (file.match(/\.js$/) !== null && file !== 'index.js') {
        const name = file.replace('.js', '');

        const jsonObj = await import(`./${file}`);

        exports[name] = jsonObj.default;
    }
});

export default exports;