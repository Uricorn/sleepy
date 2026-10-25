import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

async function files(dir, prefix = '') {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...await files(path.join(dir, entry.name), relative));
    else if (entry.name !== 'sw.js' && !relative.startsWith('voice/')) result.push('./' + relative);
  }
  return result.sort();
}
const assets = await files('dist');
const version = createHash('sha256');
for (const asset of assets) version.update(await readFile(path.join('dist', asset.slice(2))));
let sw = await readFile('public/sw.js', 'utf8');
sw = sw.replace('const CACHE_NAME = "sleepy-v1";', `const CACHE_NAME = "sleepy-${version.digest('hex').slice(0, 12)}";`);
sw = `self.__PRECACHE_MANIFEST__ = ${JSON.stringify(assets)};\n` + sw;
await writeFile('dist/sw.js', sw);
console.log(`Precached ${assets.length} fully local build assets.`);
