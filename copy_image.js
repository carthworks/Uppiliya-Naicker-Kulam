const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'images', 'uppliakulam.png');
const dest = path.join(__dirname, 'public', 'images', 'uppliakulam.png');

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log('Successfully copied uppliakulam.png to public/images/');
