// MikroORM이 엔티티마다 규칙을 처리할 때, 지금 누구를 보고 있는지 엿봅니다.
// MikroORM 코드는 고치지 않고, 멈추는 함수(initCheckConstraints)가 불릴 때마다 한 줄씩 출력만 끼워 넣습니다.
import { MetadataDiscovery } from '@mikro-orm/core';

// biome-ignore lint: 내부 함수를 엿보기 위해 any 사용
const proto = MetadataDiscovery.prototype as any;
const original = proto.initCheckConstraints;

proto.initCheckConstraints = function (meta: any) {
  const rules = meta.checks.map((c: any) => c.property ?? '(칸 지정 없음)');
  const hasVin = 'vin' in meta.properties;
  console.log(`[엿보기] ${meta.className.padEnd(7)} 붙은 규칙의 칸: ${JSON.stringify(rules)}  /  vin 칸이 있나? ${hasVin ? '있음' : '없음 ← 여기서 멈춤'}`);
  return original.call(this, meta);
};

// 경우 1을 그대로 실행합니다.
await import('./cases/1-bug.ts');
