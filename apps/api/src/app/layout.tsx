import type { ReactNode } from "react";

export const metadata = {
  title: "daily-newx admin",
};

export default function RootLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
