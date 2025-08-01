#!/usr/bin/env node

import { rmSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const distDir = join(projectRoot, 'dist');

function main() {
  try {
    // dist/ディレクトリを削除
    rmSync(distDir, { recursive: true, force: true });
    console.log('🗑️ Cleaned dist/ directory');
    
    // dist/ディレクトリを再作成
    mkdirSync(distDir, { recursive: true });
    console.log('📁 Created dist/ directory');
    
    console.log('✅ Clean operation completed successfully');
  } catch (error) {
    console.error('❌ Clean operation failed:', error.message);
    process.exit(1);
  }
}

main();