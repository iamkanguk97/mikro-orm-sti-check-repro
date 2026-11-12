// 모든 경우가 같이 쓰는 도우미.
// 엔티티 목록을 받아서 MikroORM을 켜 보고, 결과를 보기 좋게 출력합니다.
import 'reflect-metadata';
import { createRequire } from 'node:module';
import { MikroORM } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';

const version = createRequire(import.meta.url)('@mikro-orm/core/package.json').version;

export async function run(title: string, entities: unknown[]) {
  console.log(`\n=== ${title} ===`);
  console.log(`MikroORM ${version} 켜는 중...\n`);

  let orm: MikroORM;
  try {
    // DB에 실제로 연결하지는 않고(connect: false), 엔티티를 읽는 단계까지만 합니다.
    orm = await MikroORM.init({ driver: SqliteDriver, dbName: ':memory:', entities, connect: false } as never);
  } catch (e) {
    const err = e as Error;
    console.log('❌ MikroORM이 켜지다가 멈췄습니다.\n');
    console.log('오류 메시지:');
    console.log(`  ${err.message}\n`);
    console.log('오류가 난 곳 (위에서부터 가까운 순서):');
    for (const line of (err.stack ?? '').split('\n').slice(1, 4)) {
      console.log(`  ${line.trim().replace(/\(.*node_modules\//, '(node_modules/')}`);
    }
    console.log('\n→ 모두 node_modules/@mikro-orm/core 안입니다. 이 저장소의 코드가 아니라 MikroORM 안에서 멈춘 것입니다.');
    console.log('→ 멈춘 줄을 보려면: npm run source');
    return;
  }

  console.log('✅ 정상적으로 켜졌습니다.\n');
  // 켜졌다면, 실제로 만들어질 테이블 SQL을 보여 줍니다. 규칙(check)이 들어갔는지 확인용입니다.
  const sql = await orm.schema.getCreateSchemaSQL();
  console.log('만들어질 테이블 SQL:');
  console.log(`  ${sql.trim().split('\n')[0]}`);
}
