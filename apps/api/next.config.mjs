/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 린트는 CI 게이트에서 별도 수행. 모노레포 hoist 로 eslint-config-next 파서 해석이
  // 빌드 중 깨질 수 있어 빌드 단계에선 건너뛴다.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
