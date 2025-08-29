/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
    // Fix for client reference manifest issues
    serverMinification: false,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    // Additional optimizations for production builds
    optimizeCss: true,
  },
  // Add build optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  // Handle font loading issues
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Font-Loading',
            value: 'optional',
          },
        ],
      },
    ]
  },
  webpack: (config, { isServer, dev, webpack }) => {
    if (isServer) {
      config.externals.push('@prisma/client')
    }
    
    // Handle client component manifest issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    // Fix for client reference manifest
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Create a vendor chunk for better caching
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      }

      // Ensure proper manifest generation
      config.plugins.push(
        new webpack.ids.HashedModuleIdsPlugin({
          hashFunction: 'xxhash64',
        })
      )
    }
    
    return config
  },
}

export default nextConfig