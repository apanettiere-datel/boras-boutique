import { defineCloudflareConfig } from '@opennextjs/cloudflare'

const config = defineCloudflareConfig({})

const openNextConfig = {
  ...config,
  buildCommand: 'npm run build:next',
}

export default openNextConfig
