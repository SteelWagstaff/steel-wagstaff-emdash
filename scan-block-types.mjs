import { execSync } from 'child_process';

const allTypes = {};
const embedSamples = {};
let count = 0;
let cursor = null;

do {
  const flag = cursor ? `--cursor "${cursor}"` : '';
  const out = execSync(`npx emdash content list posts --json --limit 100 ${flag}`, { encoding: 'utf8' });
  const page = JSON.parse(out);

  for (const item of page.items) {
    const raw = execSync(`npx emdash content get posts ${item.id} --raw --json`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const d = JSON.parse(raw);
    for (const b of (d.data.content ?? [])) {
      allTypes[b._type] = (allTypes[b._type] || 0) + 1;
      const key = `${b._type}:${b.provider || ''}`;
      if ((b._type === 'embed' || b._type === 'htmlBlock') && !embedSamples[key]) {
        embedSamples[key] = { url: b.url, provider: b.provider, htmlSnip: (b.html || '').slice(0, 200) };
      }
    }
    count++;
    if (count >= 40) break;
  }
  cursor = page.nextCursor ?? null;
  if (count >= 40) break;
} while (cursor);

console.log('Sampled', count, 'posts');
console.log('Block types:', JSON.stringify(allTypes, null, 2));
console.log('Embed samples:', JSON.stringify(embedSamples, null, 2));
