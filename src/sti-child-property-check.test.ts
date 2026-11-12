import 'reflect-metadata';
import { Check, Entity, PrimaryKey, Property, ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { MikroORM } from '@mikro-orm/sqlite';

// Single table inheritance: Car and Truck share the `vehicle` table.
@Entity({ discriminatorColumn: 'type', discriminatorMap: { car: 'Car', truck: 'Truck' } })
class Vehicle {

  @PrimaryKey()
  id!: number;

  @Property()
  type!: string;

}

@Entity()
class Car extends Vehicle {

  // Property-level check on a property that only Car has.
  @Check({ expression: 'length(vin) = 17' })
  @Property({ nullable: true })
  vin?: string;

}

@Entity()
class Truck extends Vehicle {

  // Truck has no `vin` property.
  @Property({ nullable: true })
  payload?: number;

}

test('property-level @Check on an STI child-only property', async () => {
  // Currently throws: TypeError: Cannot read properties of undefined (reading 'fieldNames')
  //   at MetadataDiscovery.initCheckConstraints
  const orm = await MikroORM.init({
    dbName: ':memory:',
    entities: [Vehicle, Car, Truck],
    metadataProvider: ReflectMetadataProvider,
  });

  const sql = await orm.schema.getCreateSchemaSQL();
  expect(sql).toContain('check (length(vin) = 17)');

  await orm.close(true);
});
