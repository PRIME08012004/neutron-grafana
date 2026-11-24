const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
fs.copyFileSync(path.join(root, 'plugin.json'), path.join(dist, 'plugin.json'));
fs.mkdirSync(path.join(dist, 'img'), { recursive: true });
fs.copyFileSync(path.join(root, 'img', 'logo.svg'), path.join(dist, 'img', 'logo.svg'));
