import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 배포용: 최소한의 server.js + 필요한 node_modules 만 빌드 결과에 포함
  output: "standalone",
};

export default nextConfig;
