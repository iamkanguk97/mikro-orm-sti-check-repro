// [경우 2] 비교용
// 경우 1에서 @Check 한 줄만 지웠습니다. 나머지는 똑같습니다.
// → 정상적으로 켜집니다. 즉 경우 1이 멈춘 원인은 @Check 한 줄입니다.
import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { run } from '../run.ts';

@Entity({ discriminatorColumn: 'type', discriminatorMap: { car: 'Car', truck: 'Truck' } })
class Vehicle {
  @PrimaryKey({ type: 'number' }) id!: number;
  @Property({ type: 'string' }) type!: string;
}

@Entity()
class Car extends Vehicle {
  // (여기 있던 @Check를 지움)
  @Property({ type: 'string', nullable: true })
  vin?: string;
}

@Entity()
class Truck extends Vehicle {
  @Property({ type: 'number', nullable: true })
  payload?: number;
}

await run('경우 2: @Check 없음 (비교용)', [Vehicle, Car, Truck]);
