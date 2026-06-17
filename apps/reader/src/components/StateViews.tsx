import type { ReactElement, ReactNode } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";

function Centered({ children }: { children: ReactNode }): ReactElement {
  return (
    <View className="flex-1 items-center justify-center bg-paper px-8 py-24 dark:bg-[#14110E]">
      {children}
    </View>
  );
}

export function LoadingView(): ReactElement {
  return (
    <Centered>
      <ActivityIndicator color="#B23A24" />
      <Text className="mt-4 font-sans text-sm text-ink-muted dark:text-[#8C8475]">
        불러오는 중…
      </Text>
    </Centered>
  );
}

export function NotFoundView({ label }: { label: string }): ReactElement {
  return (
    <Centered>
      <Text className="font-serif text-2xl text-ink dark:text-[#ECE6DA]">{label}</Text>
      <Text className="mt-2 text-center font-sans text-sm text-ink-muted dark:text-[#8C8475]">
        이 날짜의 호가 아직 게시되지 않았습니다.
      </Text>
    </Centered>
  );
}

export function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}): ReactElement {
  return (
    <Centered>
      <Text className="font-serif text-2xl text-ink dark:text-[#ECE6DA]">불러오지 못했어요</Text>
      <Text className="mt-2 text-center font-sans text-sm text-ink-muted dark:text-[#8C8475]">
        {message}
      </Text>
      <Pressable onPress={onRetry} accessibilityRole="button" className="mt-5 border-b border-accent">
        <Text className="pb-0.5 font-sans text-sm text-accent">다시 시도</Text>
      </Pressable>
    </Centered>
  );
}

export function EmptyView(): ReactElement {
  return (
    <View className="py-16">
      <Text className="text-center font-serif text-base text-ink-muted dark:text-[#8C8475]">
        뉴스가 적은 날은 항목 수가 적을 수 있습니다.
      </Text>
    </View>
  );
}
