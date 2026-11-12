// [경우 4] 붙인 "자리"가 아니라 "property"가 원인이라는 확인
// 경우 3처럼 클래스 맨 위에 붙였지만, property: 'vin'을 적어서 "vin 칸 것"이라고 알려 줬습니다.
// → 경우 1과 똑같이 멈춥니다.
import { Check, Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { run } from '../run.ts';

@Entity({ discriminatorColumn: 'type', discriminatorMap: { car: 'Car', truck: 'Truck' } })
class Vehicle {
  @PrimaryKey({ type: 'number' }) id!: number;
  @Property({ type: 'string' }) type!: string;
}

// @Check의 타입에는 property가 없지만, MikroORM 내부는 이 값을 그대로 씁니다.
@Check({ property: 'vin', expression: 'length(vin) = 17' } as never) // ← 클래스 위 + property
@Entity()
class Car extends Vehicle {
  @Property({ type: 'string', nullable: true })
  vin?: string;
}

@Entity()
class Truck extends Vehicle {
  @Property({ type: 'number', nullable: true })
  payload?: number;
}

await run('경우 4: 클래스 위에 @Check + property 적음', [Vehicle, Car, Truck]);
