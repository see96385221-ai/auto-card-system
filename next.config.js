/** @type {import('next').NextConfig} */
const nextConfig = {
- experimental: { appDir: true },
- images: { unoptimized: true }
+ images: {
+   unoptimized: true
+ },
+ typescript: {
+   ignoreBuildErrors: false
+ },
+ eslint: {
+   ignoreDuringBuilds: true
+ }
}

module.exports = nextConfig
