import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const docsDir = join(process.cwd(), 'docs');
const assetsDir = join(docsDir, 'assets');
const retainedRevisions = execFileSync(
  'git',
  ['log', '-4', '--format=%H', '--', 'docs/assets'],
  { encoding: 'utf8' },
).split(/\r?\n/).filter(Boolean);

if (existsSync(assetsDir)) {
  for (const entry of readdirSync(assetsDir)) {
    rmSync(join(assetsDir, entry), { recursive: true, force: true });
  }
} else {
  mkdirSync(assetsDir, { recursive: true });
}

const trackedAssets = new Map();
for (const revision of retainedRevisions) {
  const paths = execFileSync(
    'git',
    ['ls-tree', '-r', '--name-only', revision, 'docs/assets'],
    { encoding: 'utf8' },
  ).split(/\r?\n/).filter(Boolean);

  for (const path of paths) {
    if (!trackedAssets.has(basename(path))) trackedAssets.set(basename(path), `${revision}:${path}`);
  }
}

for (const [name, source] of trackedAssets) {
  const target = join(assetsDir, name);
  mkdirSync(dirname(target), { recursive: true });
  const content = execFileSync('git', ['show', source]);
  writeFileSync(target, content);
}

console.log(`已从最近 ${retainedRevisions.length} 个版本保留 ${trackedAssets.size} 个兼容资源`);
