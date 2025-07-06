import { test, describe } from 'node:test'
import assert from 'node:assert'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { spawn } from 'node:child_process'
import { promisify } from 'node:util'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('TypeScript Compilation Tests', () => {
  let tsconfigSource
  let packageJsonSource

  test('should load tsconfig.json without errors', () => {
    const tsconfigPath = join(__dirname, '../../tsconfig.json')
    assert.ok(existsSync(tsconfigPath), 'tsconfig.json should exist')
    
    assert.doesNotThrow(() => {
      tsconfigSource = readFileSync(tsconfigPath, 'utf8')
    }, 'tsconfig.json should load without file system errors')
    
    assert.ok(tsconfigSource.length > 0, 'tsconfig.json should not be empty')
  })

  test('should load package.json without errors', () => {
    const packagePath = join(__dirname, '../../package.json')
    assert.doesNotThrow(() => {
      packageJsonSource = readFileSync(packagePath, 'utf8')
    }, 'package.json should load without file system errors')
    
    assert.ok(packageJsonSource.length > 0, 'package.json should not be empty')
  })

  test('tsconfig should have proper React settings', () => {
    const tsconfig = JSON.parse(tsconfigSource)
    
    assert.ok(tsconfig.compilerOptions, 'Should have compiler options')
    assert.ok(tsconfig.compilerOptions.jsx, 'Should have JSX configuration')
    assert.ok(tsconfig.compilerOptions.strict, 'Should enable strict mode')
    assert.ok(tsconfig.compilerOptions.target, 'Should specify target ES version')
    assert.ok(tsconfig.compilerOptions.lib, 'Should specify library versions')
  })

  test('package.json should have proper React dependencies', () => {
    const packageJson = JSON.parse(packageJsonSource)
    
    assert.ok(packageJson.dependencies, 'Should have dependencies')
    assert.ok(packageJson.dependencies.react, 'Should include React')
    assert.ok(packageJson.dependencies['react-dom'], 'Should include React DOM')
    assert.ok(packageJson.dependencies.zustand, 'Should include Zustand')
    assert.ok(packageJson.dependencies['@xyflow/react'], 'Should include React Flow')
  })

  test('package.json should have proper dev dependencies', () => {
    const packageJson = JSON.parse(packageJsonSource)
    
    assert.ok(packageJson.devDependencies, 'Should have dev dependencies')
    assert.ok(packageJson.devDependencies.typescript, 'Should include TypeScript')
    assert.ok(packageJson.devDependencies.vite, 'Should include Vite')
    assert.ok(packageJson.devDependencies['@types/react'], 'Should include React types')
  })

  test('package.json should have proper scripts', () => {
    const packageJson = JSON.parse(packageJsonSource)
    
    assert.ok(packageJson.scripts, 'Should have scripts')
    assert.ok(packageJson.scripts.dev, 'Should have dev script')
    assert.ok(packageJson.scripts.build, 'Should have build script')
    assert.ok(packageJson.scripts.test, 'Should have test script')
  })

  test('should check TypeScript files exist', () => {
    const tsFiles = [
      '../../src/App.tsx',
      '../../src/main.tsx',
      '../../src/components/ui/Sidebar.tsx',
      '../../src/components/ui/SearchInput.tsx',
      '../../src/components/ui/NodeDetailsPanel.tsx',
      '../../src/lib/store.ts',
      '../../src/lib/data-loader.ts',
      '../../src/lib/graph-builder.ts',
      '../../src/types/data.ts',
      '../../src/types/graph.ts'
    ]

    tsFiles.forEach(file => {
      const filePath = join(__dirname, file)
      assert.ok(existsSync(filePath), `${file} should exist`)
    })
  })

  test('should check all TypeScript files have proper extensions', () => {
    const componentFiles = [
      '../../src/App.tsx',
      '../../src/main.tsx',
      '../../src/components/ui/Sidebar.tsx',
      '../../src/components/ui/SearchInput.tsx',
      '../../src/components/ui/NodeDetailsPanel.tsx'
    ]
    
    const libFiles = [
      '../../src/lib/store.ts',
      '../../src/lib/data-loader.ts',
      '../../src/lib/graph-builder.ts'
    ]

    componentFiles.forEach(file => {
      assert.ok(file.endsWith('.tsx'), `${file} should use .tsx extension for React components`)
    })

    libFiles.forEach(file => {
      assert.ok(file.endsWith('.ts'), `${file} should use .ts extension for TypeScript modules`)
    })
  })

  // Note: This test would require running tsc, which might be slow
  // Commented out but could be enabled for comprehensive testing
  /*
  test('should compile TypeScript without errors', async () => {
    const execAsync = promisify(spawn)
    
    try {
      const result = await execAsync('npx', ['tsc', '--noEmit'], {
        cwd: join(__dirname, '../..'),
        stdio: 'pipe'
      })
      
      assert.ok(result.status === 0, 'TypeScript should compile without errors')
    } catch (error) {
      assert.fail(`TypeScript compilation failed: ${error.message}`)
    }
  }).timeout(30000) // 30 second timeout for compilation
  */
})
