import type { NextConfig } from 'next';

// GitHub Pages project sites are served from `/<repo>/`.
// For `jonasWard.github.io/garden-spline/`, the base path is `/garden-spline`.
const BASE_PATH = '/garden-spline';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: BASE_PATH,
  assetPrefix: `${BASE_PATH}/`,
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
