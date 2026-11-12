// [경우 1] 버그 재현
// Car에만 있는 vin 칸 바로 위에 @Check를 붙입니다. (MikroORM 문서에 나오는 정상적인 사용법)
// → MikroORM이 켜지다가 멈춥니다.
import { Check, Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { run } from '../run.ts';

// 부모. Car와 Truck은 이 부모의 테이블 "vehicle" 하나를 같이 씁니다. (STI)
// type 칸에 'car' / 'truck'을 적어서 어떤 자식인지 구분합니다.
@Entity({ discriminatorColumn: 'type', discriminatorMap: { car: 'Car', truck: 'Truck' } })
class Vehicle {
  @PrimaryKey({ type: 'number' }) id!: number;
  @Property({ type: 'string' }) type!: string;
}

// 자식 1: vin 칸이 있음
@Entity()
class Car extends Vehicle {
  @Check({ expression: 'length(vin) = 17' }) // ← vin 칸 바로 위에 붙인 규칙
  @Property({ type: 'string', nullable: true })
  vin?: string;
}

// 자식 2: vin 칸이 없음
@Entity()
class Truck extends Vehicle {
  @Property({ type: 'number', nullable: true })
  payload?: number;
}

await run('경우 1: vin 칸 위에 @Check', [Vehicle, Car, Truck]);
