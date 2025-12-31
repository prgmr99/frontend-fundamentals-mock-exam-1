# Copilot Instructions - 토스 적금 계산기

## 프로젝트 개요

React + TypeScript + Vite 기반의 적금 계산기 애플리케이션입니다. 토스 스타일 UI 라이브러리(`tosslib`)를 사용하며, TanStack Query로 데이터를 관리합니다.

## 🎯 토스 과제 핵심 준비 사항

토스는 **"UI 형태와 코드 형태의 1:1 매핑"**과 **"책임 단위의 추상화"**를 중요하게 평가합니다.

### 1. Props 설계의 확장성 (최우선 숙지)

**❌ 나쁜 예**: 고정된 필터 로직

```typescript
<ProductsList minAmount={10000} maxAmount={50000} term={12} />
// 새로운 필터 조건 추가 시 컴포넌트 수정 필요
```

**✅ 좋은 예**: 함수 배열로 조합 가능한 설계

```typescript
<ProductsList
  filters={[
    x => filteredByAmount(x, amount),
    x => filteredByTerm(x, term)
  ]}
/>
// 컴포넌트 수정 없이 필터 조합만으로 확장
```

**핵심**: Props를 "값"이 아닌 "함수" 또는 "전략"으로 받아 책임 분리 ([ProductsList.tsx#L11-L12](src/domain/savings/components/ProductsList.tsx#L11-L12), [getSavingProductsQueryOptions.ts#L16](src/domain/savings/queries/getSavingProductsQueryOptions.ts#L16))

### 2. 컴포넌트 인터페이스의 도메인 최적화

**❌ 나쁜 예**: 원시 타입 그대로 전달

```typescript
<AmountInput value="1000000" onChange={(e) => setValue(e.target.value)} />
```

**✅ 좋은 예**: 도메인에 맞는 타입으로 추상화

```typescript
<AmountInput
  value={1000000}  // number
  onChange={(value: number) => setValue(value)}  // 숫자 직접 전달
/>
// 내부에서 toLocaleString() 처리 캡슐화
```

**핵심**: 컴포넌트 사용자는 도메인 로직만 신경 쓰고, 표현 로직은 컴포넌트 내부에서 처리 ([AmountInput.tsx#L9-L13](src/components/AmountInput.tsx#L9-L13))

### 3. 컴포넌트 합성 패턴 (Compound Components)

**네임스페이스 활용으로 관련 컴포넌트 그룹화**:

```typescript
ProductsList.Loading  // 로딩 상태
ProductsList.Empty    // 빈 상태
CalculateResult.Content  // 실제 콘텐츠

<Tab>
  <Tab.Item />  // 하위 컴포넌트
</Tab>
```

**핵심**: UI 구조와 코드 구조를 1:1 매핑하여 직관성 확보 ([ProductsList.tsx#L50-L53](src/domain/savings/components/ProductsList.tsx#L50-L53))

### 4. 커스텀 훅의 인터페이스 설계

**부분 업데이트 지원하는 상태 관리**:

```typescript
const [state, setState] = useSavingStates();
setState({ targetAmount: 100 }); // 일부만 업데이트
setState({ monthlyAmount: 50 }); // 나머지 상태 유지
```

**튜플 반환으로 useState와 동일한 사용성**:

```typescript
const [filters, setSavingStates] = useSavingStates(); // 구조분해 가능
const [view, setView] = useView();
```

**핵심**: React의 기본 API와 일관된 인터페이스로 학습 비용 제로화 ([useSavingStates.ts#L3-L15](src/domain/savings/hooks/useSavingStates.ts#L3-L15))

### 5. 선언적 상태 처리

**조건부 렌더링을 Suspense로 위임**:

```typescript
<Suspense fallback={<ProductsList.Loading />}>
  <ProductsList />  // 로딩 로직 없음
</Suspense>
```

**early return으로 예외 상태 명확히**:

```typescript
if (savingProducts.length === 0) {
  return <Empty />;  // 빈 상태를 최상위에서 처리
}
// 정상 케이스만 아래 코드에서 다룸
```

**핵심**: 각 계층이 하나의 책임만 가지도록 분리 ([ProductsList.tsx#L22-L24](src/domain/savings/components/ProductsList.tsx#L22-L24))

### 6. 비즈니스 로직과 UI 로직 분리

**순수 함수로 비즈니스 로직 추출**:

```typescript
// logics/calculator.ts - 순수 함수
export const calculateFinalAmount = (monthlyAmount, annualRate, months) => {
  return Math.floor(monthlyAmount * months * (1 + (annualRate / 100) * 0.5));
};

// components/ - UI만 담당
const { finalAmount } = calculateSavingsResult(goal, product);
```

**핵심**: 테스트 가능하고 재사용 가능한 로직 분리 ([calculator.ts](src/domain/savings/logics/calculator.ts))

### 7. JSDoc으로 "왜(Why)" 문서화

**구현(How)이 아닌 의도(Why) 작성**:

```typescript
/**
 * view(적금 상태 / 계산 결과) 상태 관리 훅
 *
 * why:
 * 1. Tab 컴포넌트와 연동되는 상태를 별도의 훅으로 분리하여 관리
 * 2. 관리 방식이 지금은 메모리로 관리하지만, 다양한 방식으로 변경 가능
 */
const useView = () => { ... }
```

**핵심**: 코드만으로 알 수 없는 설계 의도를 명시 ([SavingsCalculatorPage.tsx#L12-L20](src/pages/SavingsCalculatorPage.tsx#L12-L20))

### ⚡ 과제 당일 체크리스트

1. ✅ Props는 값이 아닌 "전략(함수)"으로 받아 확장성 확보했는가?
2. ✅ 컴포넌트 인터페이스가 도메인 언어로 추상화되어 있는가?
3. ✅ UI 구조와 코드 구조가 1:1로 매핑되는가? (합성 패턴)
4. ✅ 순수 함수로 비즈니스 로직이 분리되어 있는가?
5. ✅ 조건부 로직이 선언적으로 처리되는가? (Suspense, early return)
6. ✅ 커스텀 훅이 React의 기본 API와 일관된 인터페이스를 제공하는가?
7. ✅ 설계 의도(Why)가 JSDoc으로 문서화되어 있는가?

## 핵심 아키텍처

### Domain-Driven 폴더 구조

도메인별로 폴더를 나누고, 각 도메인 내부에 관련 로직을 응집시킵니다.

```
src/domain/savings/
  ├── components/      # 도메인 전용 컴포넌트
  ├── hooks/          # 도메인 비즈니스 로직 훅
  ├── logics/         # 순수 함수(calculator, filters)
  └── queries/        # React Query 옵션 정의
```

- `logics/`: 순수 함수로 작성된 비즈니스 로직 (예: `calculator.ts`, `filters.ts`)
- `queries/`: React Query의 `queryOptions`를 반환하는 함수만 정의 ([getSavingProductsQueryOptions.ts](src/domain/savings/queries/getSavingProductsQueryOptions.ts))
- `hooks/`: 상태 관리 및 비즈니스 로직을 캡슐화한 커스텀 훅

### React Query 패턴

- `queryOptions` 함수를 별도 파일로 분리하여 타입 안정성과 재사용성 확보
- `select` 옵션에서 필터링/정렬 로직 수행 (예: [getSavingProductsQueryOptions.ts#L14-L23](src/domain/savings/queries/getSavingProductsQueryOptions.ts#L14-L23))
- `useSuspenseQuery`로 로딩 상태를 Suspense로 위임 ([ProductsList.tsx#L18](src/domain/savings/components/ProductsList.tsx#L18))

### 필터링 및 정렬 패턴

필터와 정렬 함수를 배열로 받아 조합 가능하도록 설계:

```typescript
// filters는 함수 배열로 전달하여 동적 조합
filters={[x => filteredByAmount(x, amount), x => filteredByTerm(x, term)]}
```

## 개발 워크플로우

### 시작하기

```bash
yarn dev  # Vite 개발 서버 + Hono API 서버 동시 실행
```

### 주요 의존성

- **tosslib**: 토스 디자인 시스템 컴포넌트 라이브러리 (로컬 패키지)
  - `ListRow`, `Tab`, `NavigationBar`, `SelectBottomSheet` 등 사용
  - `http` 유틸리티로 API 호출 ([savingsApi.ts](src/api/savingsApi.ts))
- **nuqs**: URL Query State 관리 라이브러리
  - `useQueryState`로 URL과 React 상태 동기화
  - Props Drilling 없이 컴포넌트 간 상태 공유
  - 새로고침/URL 공유 시에도 상태 유지 ([useProductSelection.ts](src/domain/savings/hooks/useProductSelection.ts))
- **@emotion/react**: CSS-in-JS (jsxImportSource 설정됨)
- **Yarn 4.6.0**: 패키지 매니저 (packageManager 필드 확인)

### Import 경로

tsconfig.json의 `baseUrl: "src"` 설정으로 절대 경로 import 사용:

```typescript
import { useSavingStates } from 'domain/savings/hooks/useSavingStates';
import { savingsApi } from 'api/savingsApi';
```

## 코딩 컨벤션

### URL Query State 관리 (nuqs)

컴포넌트 간 상태 공유는 `useQueryState`로 URL에 저장:

```typescript
// useProductSelection.ts
import { useQueryState } from 'nuqs';

export function useProductSelection() {
  const [selectedProductId, setSelectedProductId] = useQueryState('productId');
  return [selectedProductId, setSelectedProductId] as const;
}

// 숫자 타입 파싱
import { parseAsInteger } from 'nuqs';
const [amount, setAmount] = useQueryState('amount', parseAsInteger.withDefault(null));
```

**장점**: Props Drilling 없이 상태 공유, 새로고침/URL 공유 시 상태 유지

### 커스텀 훅 설계

상태 관리 훅은 설정자와 함께 튜플로 반환:

```typescript
const [filters, setSavingStates] = useSavingStates();
// 부분 업데이트 지원
setSavingStates({ targetAmount: 1000000 });
```

### JSDoc 주석 스타일

주요 훅과 함수에는 목적(why)을 설명하는 JSDoc 작성 ([SavingsCalculatorPage.tsx#L12-L20](src/pages/SavingsCalculatorPage.tsx#L12-L20) 참고)

### 숫자 포맷팅

한국 원화 표시는 `formatKrNumber` 유틸리티 사용 ([formatKrNumbers.ts](src/utils/formatKrNumbers.ts))

### 컴포넌트 하위 컴포넌트 패턴

`ProductsList.Loading`, `ProductsList.Empty`처럼 관련 컴포넌트를 네임스페이스로 그룹화

## API 통합

### Mock API 서버

- `server.mjs`: Hono 기반 개발용 API 서버
- `/api/savings-products` 엔드포인트 제공
- Vite 설정에서 `/api` 경로만 devServer로 라우팅 ([vite.config.mts#L10-L12](vite.config.mts#L10-L12))

### API 레이어

`src/api/` 폴더에 도메인별 API 클라이언트 정의:

```typescript
export const savingsApi = {
  getProducts: async (): Promise<SavingsProduct[]> => {
    return await http.get<SavingsProduct[]>('/api/savings-products');
  },
};
```

## 주의사항

- **Suspense 경계**: 비동기 컴포넌트는 항상 Suspense로 감싸고 fallback UI 제공
- **null vs undefined**: 숫자 초기값은 `null` 사용 ([useSavingStates.ts#L5](src/domain/savings/hooks/useSavingStates.ts#L5))
- **이자 계산 로직**: 단리 계산 방식 사용 (`1 + rate * 0.5`) ([calculator.ts#L6](src/domain/savings/logics/calculator.ts#L6))
