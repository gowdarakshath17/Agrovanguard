const fs = require('fs');
const meta = JSON.parse(fs.readFileSync('metadata.json', 'utf8'));
if (!meta.requestFramePermissions.includes('geolocation')) {
  meta.requestFramePermissions.push('geolocation');
}
fs.writeFileSync('metadata.json', JSON.stringify(meta, null, 2));
