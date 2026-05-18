import type { Configuration } from 'electron-builder'

const config: Configuration = {
  appId: 'nano.summon',
  productName: 'Summon',
  icon: 'icons/summon.png',
  directories: {
    output: 'dist',
  },
  files: ['src/**/*', 'dist-renderer/**/*', 'icons/**/*', 'package.json', '!**/*.map'],
  mac: {
    category: 'public.app-category.utilities',
    target: [
      { target: 'dmg', arch: ['arm64', 'x64'] },
      { target: 'dir', arch: ['arm64', 'x64'] },
    ],
    identity: null,
    hardenedRuntime: false,
    artifactName: '${productName}-${version}-${arch}.${ext}',
    extendInfo: {
      LSUIElement: true,
    },
  },
}

export default config
