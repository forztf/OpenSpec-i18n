#!/usr/bin/env node

import { execFileSync } from 'child_process';
import { existsSync, rmSync, cpSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const runTsc = (args = []) => {
  const tscPath = require.resolve('typescript/bin/tsc');
  execFileSync(process.execPath, [tscPath, ...args], { stdio: 'inherit' });
};

console.log('🔨 Building OpenSpec...\n');

// Clean dist directory
if (existsSync('dist')) {
  console.log('Cleaning dist directory...');
  rmSync('dist', { recursive: true, force: true });
}

// Run TypeScript compiler (use local version explicitly)
console.log('Compiling TypeScript...');
try {
  runTsc(['--version']);
  runTsc();
  
  // Copy i18n translation files
  console.log('Copying i18n translation files...');
  if (existsSync('src/core/i18n/en')) {
    cpSync('src/core/i18n/en', 'dist/core/i18n/en', { recursive: true });
  }
  if (existsSync('src/core/i18n/zh')) {
    cpSync('src/core/i18n/zh', 'dist/core/i18n/zh', { recursive: true });
  }
  
  console.log('\n✅ Build completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed!');
  process.exit(1);
}
