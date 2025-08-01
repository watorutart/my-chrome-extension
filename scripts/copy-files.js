#!/usr/bin/env node

import { copyFile, mkdir, access, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const distDir = join(projectRoot, 'dist');

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function copyManifest() {
  const manifestSrc = join(projectRoot, 'manifest.json');
  const manifestDest = join(distDir, 'manifest.json');
  
  try {
    await copyFile(manifestSrc, manifestDest);
    console.log('✅ manifest.json copied successfully');
  } catch (error) {
    console.error('❌ Failed to copy manifest.json:', error.message);
    process.exit(1);
  }
}

async function copyIcons() {
  const iconsDir = join(projectRoot, 'icons');
  const distIconsDir = join(distDir, 'icons');
  
  // iconsディレクトリが存在するかチェック
  if (!(await fileExists(iconsDir))) {
    console.log('ℹ️ Icons directory not found, skipping icon copy');
    return;
  }
  
  try {
    const files = await readdir(iconsDir);
    const pngFiles = files.filter(file => file.endsWith('.png'));
    
    if (pngFiles.length === 0) {
      console.log('ℹ️ No PNG icon files found, skipping icon copy');
      return;
    }
    
    // dist/iconsディレクトリを作成
    await mkdir(distIconsDir, { recursive: true });
    
    // PNGファイルをコピー
    for (const file of pngFiles) {
      const src = join(iconsDir, file);
      const dest = join(distIconsDir, file);
      await copyFile(src, dest);
      console.log(`✅ ${file} copied successfully`);
    }
  } catch (error) {
    console.error('❌ Failed to copy icons:', error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    // distディレクトリが存在することを確認
    await mkdir(distDir, { recursive: true });
    
    // ファイルをコピー
    await copyManifest();
    await copyIcons();
    
    console.log('🎉 All files copied successfully');
  } catch (error) {
    console.error('❌ Copy operation failed:', error.message);
    process.exit(1);
  }
}

main();