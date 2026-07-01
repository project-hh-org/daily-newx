import { useRouter, type Href } from "expo-router";

/**
 * 뒤로가기 히스토리가 있으면 pop(back), 없으면 fallback 경로로 navigate.
 * 크럼(‹)이 항상 새 스택을 쌓는 문제를 방지.
 */
export function useBackOr(): (fallback: Href) => void {
  const router = useRouter();
  return (fallback: Href): void => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate(fallback);
    }
  };
}
