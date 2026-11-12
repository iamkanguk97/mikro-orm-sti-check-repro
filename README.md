# Reproduction: property-level `@Check` on an STI child-only property crashes `MikroORM.init()`

Based on [mikro-orm/reproduction](https://github.com/mikro-orm/reproduction).

## Run

```bash
npm install
npm test
```

The single test lives in [`src/sti-child-property-check.test.ts`](src/sti-child-property-check.test.ts).
It currently **fails**, and that failure is the bug. CI on this repo fails on purpose.

## What happens

With single table inheritance, `Car` and `Truck` share one table. Only `Car` has `vin`, and `vin` has a property-level `@Check`:

```ts
@Entity()
class Car extends Vehicle {
  @Check({ expression: 'length(vin) = 17' })
  @Property({ nullable: true })
  vin?: string;
}

@Entity()
class Truck extends Vehicle {
  @Property({ nullable: true })
  payload?: number;
}
```

`MikroORM.init()` throws before discovery finishes:

```
TypeError: Cannot read properties of undefined (reading 'fieldNames')
 ❯ MetadataDiscovery.initCheckConstraints node_modules/@mikro-orm/core/metadata/MetadataDiscovery.js
```

The check (with `property: 'vin'`) ends up in the `checks` of `Vehicle`, `Car`, and `Truck`.
`initCheckConstraints` then reads `meta.properties[check.property].fieldNames` for each of them,
and `Truck` has no `vin` property:

```js
const fieldNames = check.property ? meta.properties[check.property].fieldNames : [];
```

## Expected

`MikroORM.init()` succeeds and the `vehicle` table gets the check, as it does without inheritance.

## Notes

- Removing the `@Check` line makes `init()` succeed.
- A class-level `@Check({ name: 'car_vin_check', expression: 'length(vin) = 17' })` on `Car` works as a workaround.
- A class-level `@Check` that sets `property: 'vin'` crashes the same way, so the trigger is the property binding, not where the decorator sits.
- Guarding the lookup (`meta.properties[check.property]?.fieldNames ?? []`) makes the test pass locally. That may not be the right fix — skipping the check for entities that lack the property might be better.

## Versions

| Package | Versions tried | Result |
|---|---|---|
| `@mikro-orm/core` | 6.6.17, 7.2.8, 7.2.9-dev.25 (`next`) | crash on all |
| Driver | `@mikro-orm/sqlite` | |
| Node.js | 24.22.1 | |

## `study/`

[`study/`](study/) holds my own notes and scripts (in Korean) that I used to understand the bug.
It is not part of the reproduction and can be ignored.
