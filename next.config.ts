import type { NextConfig } from 'next'

const config: NextConfig = {
  // keep Next.js from writing its own helper files into the project
  agentRules: false,
  devIndicators: false,
  turbopack: { root: process.cwd() },
}

export default config
