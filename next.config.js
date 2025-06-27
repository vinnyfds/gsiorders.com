/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // ensures static export
  distDir: "out", // matches SOURCE_DIR in your workflow
};

module.exports = nextConfig;
