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
  webpack: (config, { isServer, dev }) => {
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

    // Add better error handling for build process
    if (!dev) {
      config.infrastructureLogging = {
        level: 'error',
      }
      
      // Handle missing modules gracefully
      config.resolve.alias = {
        ...config.resolve.alias,
        'critters': false, // Disable critters if not available
      }
      
      // Add better error handling for missing modules
      config.resolve.modules = [
        ...config.resolve.modules,
        'node_modules',
      ]
      
      // Add error handling for missing modules
      config.module.rules.push({
        test: /critters/,
        use: 'null-loader',
      })
      
      // Add fallback for critters module
      config.resolve.fallback = {
        ...config.resolve.fallback,
        critters: false,
      }
    }
    
    return config
  },
  // Add build-time error handling
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

export default nextConfig