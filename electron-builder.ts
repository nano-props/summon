import type { Configuration } from 'electron-builder'
import { execaSync } from 'execa'

function commitHash(): string {
  try {
    return execaSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: import.meta.dirname }).stdout.trim()
  } catch {
    return ''
  }
}

const config: Configuration = {
  appId: 'nano.summon',
  productName: 'Summon',
  icon: 'icons/summon.png',
  extraMetadata: {
    summonBuild: {
      commit: commitHash(),
    },
  },
  directories: {
    output: 'dist',
  },
  files: ['src/**/*', '!src/**/*.test.ts', 'dist-renderer/**/*', 'icons/**/*', 'package.json', '!**/*.map'],
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
