# MikroORM 버그 재현: STI 자식 칸에 `@Check`를 붙이면 MikroORM이 멈춤

## 한 줄 요약

Car와 Truck이 **테이블 하나를 같이 쓰는데**(STI), **Car에만 있는 `vin` 칸 위에** `@Check`를 붙이면
`MikroORM.init()`이 아래 오류를 내며 멈춥니다. (v6, v7 모두)

```
Cannot read properties of undefined (reading 'fieldNames')
```

## 실행 방법

```bash
npm install
npm run case1    # 버그: vin 칸 위에 @Check → ❌ 멈춤
npm run case2    # 비교: @Check 한 줄만 지움 → ✅ 정상
npm run case3    # 피해 가는 방법: 클래스 위에 @Check → ✅ 정상
npm run case4    # 확인: 클래스 위지만 property: 'vin'을 적음 → ❌ 멈춤
npm run peek     # 경우 1에서 MikroORM이 누구를 볼 때 멈추는지 엿보기
npm run source   # MikroORM 안에서 멈추는 바로 그 줄 보기
```

## 읽는 순서 추천

1. `src/cases/1-bug.ts` — 엔티티 3개. 주석에 설명이 있습니다.
2. `npm run case1` → `npm run case2` — 차이는 `@Check` 한 줄뿐인데 결과가 갈립니다.
3. `npm run peek` — Vehicle, Car는 통과하고 **Truck에서** 멈추는 걸 봅니다.
4. `npm run source` — 멈추는 줄과 그 이유를 봅니다.
5. `npm run case3`, `case4` — "붙인 자리"가 아니라 "어느 칸 것인지(property)"가 원인임을 확인합니다.

## 무슨 일이 일어나나

1. Car와 Truck은 테이블 하나를 같이 쓰므로, MikroORM은 Car의 규칙을 Vehicle과 Truck에도 붙여 둡니다.
2. 그다음 엔티티마다 "이 규칙이 가리키는 칸(`vin`)의 DB 이름"을 찾습니다.
3. Truck에는 `vin` 칸이 없는데, MikroORM이 **"없으면 건너뛰기" 확인 없이** 바로 꺼내려다 멈춥니다.

```js
// node_modules/@mikro-orm/core/metadata/MetadataDiscovery.js (v7.2.8 기준 1790번째 줄)
const fieldNames = check.property ? meta.properties[check.property].fieldNames : [];
//                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Truck에서는 undefined
```

## 왜 문제인가

- 칸 위에 `@Check`를 붙이는 건 MikroORM 문서에 나오는 **정상적인 사용법**입니다.
- 그런데 앱이 **아예 켜지지 않고**, 오류 메시지에는 어느 엔티티·어느 칸·어떤 규칙 때문인지가 **전혀 나오지 않습니다.**

## 피해 가는 방법 (MikroORM이 고쳐지기 전까지)

규칙을 칸이 아니라 **클래스 위에** 붙이고, `property`는 적지 말고, `name`은 직접 적습니다.

```ts
@Check({ name: 'car_vin_check', expression: 'length(vin) = 17' })
@Entity()
class Car extends Vehicle {
  @Property({ type: 'string', nullable: true })
  vin?: string;
}
```

## 상태

- 2026-11-12 기준 MikroORM GitHub에 같은 이슈 없음. master 브랜치에도 같은 줄이 그대로 있음.
- 확인한 버전: `@mikro-orm/core` 6.6.17, 7.2.8 (이 저장소는 7.2.8)
