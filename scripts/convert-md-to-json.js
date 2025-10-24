#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 处理字符串内容，移除不必要的转义
 * 注意：JSON.stringify 会自动处理必要的转义，我们只需要保持原始内容
 * @param {string} str - 原始字符串
 * @returns {string} - 处理后的字符串
 */
function processStringContent(str) {
  // 不需要手动转义，JSON.stringify 会自动处理
  // 只需要保持原始内容即可
  return str;
}

/**
 * 将markdown文件转换为JSON格式
 * @param {string} mdFilePath - markdown文件路径
 * @param {string} jsonFilePath - 输出的JSON文件路径
 */
function convertMdToJson(mdFilePath, jsonFilePath) {
  try {
    console.log(`正在转换: ${basename(mdFilePath)} -> ${basename(jsonFilePath)}`);
    
    // 读取markdown文件内容
    const mdContent = readFileSync(mdFilePath, 'utf-8');
    
    // 按行分割内容
    const lines = mdContent.split(/\r?\n/);
    
    // 处理每一行并创建JSON对象
    const jsonContent = {
      content: lines.map(line => processStringContent(line))
    };
    
    // 写入JSON文件
    writeFileSync(jsonFilePath, JSON.stringify(jsonContent, null, 2), 'utf-8');
    
    console.log(`✅ 转换成功: ${basename(jsonFilePath)}`);
    
  } catch (error) {
    console.error(`❌ 转换失败 ${basename(mdFilePath)}:`, error.message);
    process.exit(1);
  }
}

/**
 * 扫描目录并转换所有markdown文件
 * @param {string} templatesDir - 模板目录路径
 * @param {string} languageCode - 语言代码（用于日志显示）
 */
function convertAllMdFiles(templatesDir, languageCode = '') {
  try {
    const langInfo = languageCode ? ` (${languageCode})` : '';
    console.log(`🔍 扫描目录${langInfo}: ${templatesDir}`);
    
    // 检查目录是否存在
    try {
      if (!statSync(templatesDir).isDirectory()) {
        throw new Error(`目录不存在: ${templatesDir}`);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`⚠️  目录不存在${langInfo}: ${templatesDir}`);
        return 0;
      }
      throw error;
    }
    
    // 读取目录中的所有文件
    const files = readdirSync(templatesDir);
    const mdFiles = files.filter(file => extname(file).toLowerCase() === '.md');
    
    if (mdFiles.length === 0) {
      console.log(`⚠️  未找到markdown文件${langInfo}`);
      return 0;
    }
    
    console.log(`📄 找到 ${mdFiles.length} 个markdown文件${langInfo}`);
    
    // 转换每个markdown文件
    mdFiles.forEach(mdFile => {
      const mdFilePath = join(templatesDir, mdFile);
      const jsonFileName = basename(mdFile, '.md') + '.json';
      const jsonFilePath = join(templatesDir, jsonFileName);
      
      convertMdToJson(mdFilePath, jsonFilePath);
    });
    
    console.log(`🎉 转换完成${langInfo}! 共处理 ${mdFiles.length} 个文件`);
    return mdFiles.length;
    
  } catch (error) {
    console.error(`❌ 转换过程出错${languageCode ? ` (${languageCode})` : ''}:`, error.message);
    throw error;
  }
}

/**
 * 扫描所有语言目录并转换markdown文件
 * @param {string} i18nDir - i18n目录路径
 */
function convertAllLanguages(i18nDir) {
  try {
    console.log(`🌍 扫描i18n目录: ${i18nDir}`);
    
    // 检查i18n目录是否存在
    if (!statSync(i18nDir).isDirectory()) {
      throw new Error(`i18n目录不存在: ${i18nDir}`);
    }
    
    // 读取所有语言目录
    const items = readdirSync(i18nDir);
    const languageDirs = items.filter(item => {
      const itemPath = join(i18nDir, item);
      try {
        return statSync(itemPath).isDirectory() && item !== 'index.ts';
      } catch {
        return false;
      }
    });
    
    if (languageDirs.length === 0) {
      console.log('⚠️  未找到语言目录');
      return;
    }
    
    console.log(`🗣️  找到 ${languageDirs.length} 个语言目录: ${languageDirs.join(', ')}`);
    
    let totalProcessed = 0;
    let processedLanguages = 0;
    
    // 处理每个语言目录
    languageDirs.forEach(langDir => {
      const templatesDir = join(i18nDir, langDir, 'templates');
      console.log(`\n📁 处理语言: ${langDir}`);
      
      try {
        const processed = convertAllMdFiles(templatesDir, langDir);
        totalProcessed += processed;
        if (processed > 0) {
          processedLanguages++;
        }
      } catch (error) {
        console.error(`❌ 处理语言 ${langDir} 时出错:`, error.message);
        // 继续处理其他语言，不退出整个程序
      }
    });
    
    console.log(`\n🏁 总结: 处理了 ${processedLanguages} 个语言目录，转换了 ${totalProcessed} 个文件`);
    
  } catch (error) {
    console.error('❌ 扫描语言目录时出错:', error.message);
    process.exit(1);
  }
}

// 主函数
function main() {
  console.log('🚀 开始Markdown到JSON转换...');
  
  // 定义项目路径
  const projectRoot = join(__dirname, '..');
  const i18nDir = join(projectRoot, 'src', 'core', 'i18n');
  
  console.log(`📂 项目根目录: ${projectRoot}`);
  console.log(`🌍 i18n目录: ${i18nDir}`);
  
  // 执行转换
  convertAllLanguages(i18nDir);
}

// 如果直接运行此脚本，则执行主函数
if (process.argv[1] && process.argv[1].endsWith('convert-md-to-json.js')) {
  main();
}

export { convertMdToJson, convertAllMdFiles, convertAllLanguages };