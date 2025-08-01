/**
 * @type {import('next').NextConfig}
 */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isStaticExport = 'false';

const nextConfig = {
  trailingSlash: true,
  env: {
    BUILD_STATIC_EXPORT: isStaticExport,
  },
  async rewrites() {
    return [
      {
        source: '/api/uploads/:path*',
        destination: 'http://localhost:3000/uploads/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '*',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}',
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Fix CKEditor duplicated modules
    config.resolve.alias = {
      ...config.resolve.alias,
      '@ckeditor/ckeditor5-utils': path.resolve(__dirname, 'node_modules/@ckeditor/ckeditor5-utils'),
      '@ckeditor/ckeditor5-core': path.resolve(__dirname, 'node_modules/@ckeditor/ckeditor5-core'),
      '@ckeditor/ckeditor5-engine': path.resolve(__dirname, 'node_modules/@ckeditor/ckeditor5-engine'),
      '@ckeditor/ckeditor5-ui': path.resolve(__dirname, 'node_modules/@ckeditor/ckeditor5-ui'),
      '@ckeditor/ckeditor5-theme-lark': path.resolve(__dirname, 'node_modules/@ckeditor/ckeditor5-theme-lark'),
    };

    return config;
  },
  ...(isStaticExport === 'true' && {
    output: 'export',
  }),
};

export default nextConfig;
