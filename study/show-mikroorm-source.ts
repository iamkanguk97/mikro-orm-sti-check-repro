// 설치된 MikroORM 안에서 실제로 멈추는 줄을 찾아 앞뒤와 함께 보여 줍니다.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const coreDir = dirname(require.resolve('@mikro-orm/core/package.json'));
const file = join(coreDir, 'metadata', 'MetadataDiscovery.js');
const lines = readFileSync(file, 'utf8').split('\n');

const start = lines.findIndex((l) => /^\s*initCheckConstraints\(meta\) \{/.test(l));
const bad = lines.findIndex((l, i) => i > start && l.includes('meta.properties[check.property].fieldNames'));

console.log(`파일: node_modules/@mikro-orm/core/metadata/MetadataDiscovery.js\n`);
for (let i = start; i <= bad + 3; i++) {
  const mark = i === bad ? '👉' : '  ';
  console.log(`${mark} ${String(i + 1).padStart(5)} | ${lines[i]}`);
}
console.log(`
👉 줄 설명:
   check.property 는 "이 규칙이 어느 칸 것인지" (예: 'vin')
   meta.properties   는 "지금 보고 있는 엔티티가 가진 칸 목록"

   Truck을 볼 때 meta.properties['vin'] 은 없습니다(undefined).
   그런데 "없으면 건너뛰기" 확인 없이 바로 .fieldNames 를 꺼내려고 해서 멈춥니다.
   → Cannot read properties of undefined (reading 'fieldNames')`);
