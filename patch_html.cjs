const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const metaTags = `    <meta name="theme-color" content="#ffffff" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="CropSentinel" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />`;

html = html.replace('<title>', metaTags + '\n    <title>');
fs.writeFileSync('index.html', html);
