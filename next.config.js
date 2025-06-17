/** 
 * next.config.js
 * 
 * Remove experimental.appDir as it is no longer needed in Next.js 13.5+
 */

const nextConfig = {
  // Add any other Next.js config here if needed
  reactStrictMode: true,
<<<<<<< HEAD
  experimental: {
    appDir: false
  }
}
=======
  swcMinify: true,
};
>>>>>>> parent of f83f07f (Update next.config.js)

module.exports = nextConfig;
