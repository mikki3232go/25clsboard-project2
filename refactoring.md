## /list 라우트를 TanStack Query로 리팩터링하는 단계별 가이드 (코드 미변경 안내)

아래는 현재 동작을 유지하면서 TanStack Query를 도입해 `/list` 데이터를 클라이언트에서 선언적 데이터 패칭으로 전환하는 가이드입니다. 실제 코드 변경 없이 예시 코드와 단계만 정리합니다.

---

### 1) 패키지 설치

```bash
npm i @tanstack/react-query @tanstack/query-core
```

선택 사항 (개발 편의):
```bash
npm i -D @tanstack/eslint-plugin-query
```

---

### 2) 전역 Provider 구성 (App Router)

`app` 디렉터리 기준으로 React Query의 `QueryClientProvider`를 한 번만 감싸야 합니다. 두 가지 접근 중 하나를 선택하세요.

- 접근 A: 기존 `app/SessionProvider.js`에 Query Provider를 추가하고 `app/layout.js`에서 한 번만 래핑
- 접근 B: 별도 `app/QueryProvider.js`를 만들고 `app/layout.js`에서 `QueryProvider`로 래핑

예시(`QueryProvider.js`):
```jsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

`app/layout.js`에서:
```jsx
// ...기존 코드
import QueryProvider from "@/QueryProvider"; // 경로는 실제 위치에 맞게 조정

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

---

### 3) 서버 라우트 준비 (데이터 API)

현재 `app/list/page.js`는 서버 컴포넌트에서 DB로 직접 접근합니다. React Query로 전환하려면 클라이언트가 호출할 API가 필요합니다. 이미 비슷한 API가 있다면 재사용하고, 없다면 예시처럼 `/api/list`를 둡니다.

예시(`app/api/list/route.js`):
```js
import { connectDB } from "@/util/database";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await connectDB;
  const db = client.db("board");
  const posts = await db.collection("post").find().toArray();
  return NextResponse.json(posts);
}
```

주의: 실제 코드에선 ObjectId 직렬화 문제를 피하기 위해 `_id`를 문자열로 변환해 주는 처리를 추가하는 것을 권장합니다.

---

### 4) 쿼리 키와 fetcher 유틸 만들기

공유 가능한 쿼리 키와 fetcher를 만들어 중복을 줄입니다.

예시(`app/lib/queries/listQuery.js`):
```js
export const listQueryKey = ["posts", "list"]; // or ["postList"]

export async function fetchPostList() {
  const res = await fetch("/api/list", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch post list");
  return res.json();
}
```

---

### 5) `/list` 페이지 클라이언트화 및 useQuery 적용

현재 `app/list/page.js`는 서버 컴포넌트입니다. React Query는 클라이언트에서 동작하므로 렌더 책임을 클라이언트 컴포넌트로 위임합니다.

권장 구조:
- `app/list/page.js`: 서버 컴포넌트 (껍데기) → 클라이언트 컴포넌트 로드
- `app/list/ListClient.js`: 클라이언트 컴포넌트에서 `useQuery` 사용

예시(`app/list/ListClient.js`):
```jsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { listQueryKey, fetchPostList } from "@/lib/queries/listQuery";
import ListItem from "./Listitem";

export default function ListClient() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: listQueryKey,
    queryFn: fetchPostList,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  if (isLoading) return <div className="list-bg">로딩중...</div>;
  if (isError) return <div className="list-bg">에러: {String(error?.message || "")}</div>;

  return (
    <div className="list-bg">
      {data?.map((item) => (
        <ListItem key={item._id} item={item} />
      ))}
    </div>
  );
}
```

`app/list/page.js`는 다음처럼 단순 위임만 수행:
```jsx
import ListClient from "./ListClient";
export default function ListPage() {
  return <ListClient />;
}
```

---

### 6) 삭제 기능을 Mutation으로 전환 (옵션)

`Listitem.js`의 삭제 버튼은 `fetch` 후 새로고침을 수행합니다. React Query의 `useMutation`과 `queryClient.invalidateQueries` 또는 낙관적 업데이트를 사용하면 UX가 개선됩니다.

예시(`app/list/ListClient.js` 내부):
```jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/post/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제 실패");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listQueryKey });
    },
  });
}
```

이후 `ListItem`에서 `onClick`으로 직접 fetch하지 않고 `useDeletePost().mutate(item._id)`를 호출하도록 연결합니다.

---

### 7) SSR/Prefetch + Hydration (선택)

첫 페인트를 더 빠르게 하려면 서버에서 미리 데이터를 가져와 하이드레이션할 수 있습니다.

예시(서버):
```jsx
// app/list/page.js (서버)
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ListClient from "./ListClient";
import { listQueryKey, fetchPostList } from "@/lib/queries/listQuery";

export default async function Page() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({ queryKey: listQueryKey, queryFn: fetchPostList });
  const state = dehydrate(queryClient);
  return (
    <HydrationBoundary state={state}>
      <ListClient />
    </HydrationBoundary>
  );
}
```

주의: 서버에서 fetch 시 절대 경로 사용 또는 `fetch` 옵션/환경에 따라 내부 호출 경로를 조정하세요.

---

### 8) 캐시/리패치 전략 권장값

- **staleTime**: 30s~2m (리스트) / 디테일은 더 길게 가능
- **gcTime**: 5m 이상
- **refetchOnWindowFocus**: 리스트는 true 기본값으로 두어도 무방. 자주 변동되면 유지, 아니면 false
- **keepPreviousData**: 페이지네이션 시 유용

예시:
```js
useQuery({
  queryKey: listQueryKey,
  queryFn: fetchPostList,
  staleTime: 60_000,
  refetchOnWindowFocus: true,
});
```

---

### 9) 에러/로딩 UX

- 로딩 상태: 스켈레톤 컴포넌트로 대체 권장
- 에러 상태: 재시도 버튼 + `retry` 옵션 조정

```js
useQuery({ queryKey: listQueryKey, queryFn: fetchPostList, retry: 2 });
```

---

### 10) 타입스크립트(선택)

- 쿼리 결과 타입을 명시하고, `_id` 직렬화 타입을 문자열로 맞춥니다.
- API 응답에서 MongoDB ObjectId를 문자열로 변환해 일관성 유지 권장.

```ts
interface PostItem { _id: string; title: string; content: string; author?: string }
const { data } = useQuery<PostItem[]>({ queryKey: listQueryKey, queryFn: fetchPostList });
```

---

### 11) 점진적 전환 팁

- 우선 `/list`에만 도입 → 문제없으면 `/detail/[id]`, 작성/수정/삭제를 차례로 마이그레이션
- 기존 서버 컴포넌트 데이터 패칭과 공존 가능. 최종적으로는 클라이언트 패칭 + 하이드레이션 조합으로 통일 권장

---

### 12) 체크리스트

- [ ] 패키지 설치 완료
- [ ] Query Provider 전역 적용
- [ ] `/api/list` 라우트 준비 또는 기존 API 재사용
- [ ] `listQueryKey`, `fetchPostList` 유틸 생성
- [ ] `ListClient` 작성 및 `useQuery` 적용
- [ ] (옵션) `useMutation`으로 삭제 기능 개선
- [ ] (옵션) SSR Prefetch + Hydration 적용
- [ ] (옵션) 스켈레톤/에러 UX 개선

---

부담 없이 일부 단계만 적용해도 됩니다. 실제 반영 시 파일 경로와 import 경로를 프로젝트 구조에 맞게 조정하세요.
