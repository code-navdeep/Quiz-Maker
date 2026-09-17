// `prisma generate` writes this project's absolute folder path into the
// generated client (the generator output and the schema location). The client
// ships unpacked inside the app, so that path would be readable by anyone who
// installs it. Replace it with a relative one, then refuse to continue if this
// machine's path is still anywhere in the client folder.
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
const clientDir = path.join(root, 'electron', 'prisma-client');

for (const name of ['index.js', 'edge.js', 'wasm.js']) {
  const file = path.join(clientDir, name);
  const text = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, text.split(root).join('.'));
}

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

const needles = [root, os.homedir()];
const leaks = listFiles(clientDir).filter((file) => {
  const bytes = fs.readFileSync(file);
  return needles.some((needle) => bytes.includes(needle));
});

if (leaks.length > 0) {
  console.error(`scrub-prisma-paths: this machine's folder path (${needles.join(' or ')}) is still in:`);
  for (const file of leaks) console.error(`  ${path.relative(root, file)}`);
  console.error('These files ship inside the app. Stopping before anything is packaged.');
  process.exit(1);
}

console.log('scrub-prisma-paths: generated client contains no local folder paths');
