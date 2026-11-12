// [경우 3] 피해 가는 방법
// 같은 규칙을 vin 칸 위가 아니라 Car 클래스 맨 위에 붙였습니다.
// 어느 칸 것인지(property)는 적지 않고, 이름(name)은 직접 적었습니다.
// → 정상적으로 켜지고, 규칙도 테이블 SQL에 제대로 들어갑니다.
import { Check, Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { run } from '../run.ts';

@Entity({ discriminatorColumn: 'type', discriminatorMap: { car: 'Car', truck: 'Truck' } })
class Vehicle {
  @PrimaryKey({ type: 'number' }) id!: number;
  @Property({ type: 'string' }) type!: string;
}

@Check({ name: 'car_vin_check', expression: 'length(vin) = 17' }) // ← 클래스 맨 위에 붙인 규칙
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

await run('경우 3: 클래스 위에 @Check (피해 가는 방법)', [Vehicle, Car, Truck]);
