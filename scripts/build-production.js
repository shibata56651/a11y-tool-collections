const fs = require('fs');
const path = require('path');
const PathConfig = require('./path-config');

const pathConfig = new PathConfig();

function processDirectory(sourceDir, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const items = fs.readdirSync(sourceDir);

  items.forEach(item => {
    const sourcePath = path.join(sourceDir, item);
    const outputPath = path.join(outputDir, item);
    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      // ディレクトリの場合は再帰処理（除外リストを拡張）
      if (!['node_modules', '.git', 'scripts', 'build', 'demo', '.npm', '.cache', 'src'].includes(item)) {
        processDirectory(sourcePath, outputPath);
      }
    } else if (stat.isFile()) {
      // 除外するファイル名のリスト
      const excludedFiles = [
        'CLAUDE.md',
        'README.md',
        'biome.json',
        'package-lock.json',
        'package.json',
        'ssi-server.js',
        'tsconfig.json',
        '.gitignore',
        '.gitattributes',
        '.prettierrc.json',
        '.stylelintrc.json',
        '.htaccess'
      ];
      
      // ファイル名が除外リストに含まれている場合はスキップ
      if (excludedFiles.includes(item)) {
        return;
      }
      
      const ext = path.extname(item).toLowerCase();
      
      if (ext === '.html') {
        // HTMLファイルの処理
        let content = fs.readFileSync(sourcePath, 'utf8');
        
        // SSIインクルードの処理（ソースディレクトリをベースにする）
        content = processSSI(content, sourceDir);
        
        // 環境に応じてbaseタグを挿入
        const baseTag = pathConfig.generateBaseTag();
        if (content.includes('<head>') && !content.includes('<base')) {
          content = content.replace('<head>', `<head>\n  ${baseTag}`);
        }
        
        // HTMLファイル内のパスを環境に応じて変換
        content = pathConfig.processHtmlPaths(content);
        
        fs.writeFileSync(outputPath, content, 'utf8');
        console.log(`Processed HTML: ${outputPath}`);
        
      } else if (ext === '.css') {
        // CSSファイルの処理
        let content = fs.readFileSync(sourcePath, 'utf8');
        
        // CSS内のパスを環境に応じて変換
        content = pathConfig.processCssPaths(content);
        
        fs.writeFileSync(outputPath, content, 'utf8');
        console.log(`Processed CSS: ${outputPath}`);
        
      } else {
        // その他のファイルはそのままコピー
        fs.copyFileSync(sourcePath, outputPath);
      }
    }
  });
}

function processSSI(content, basePath) {
  return content.replace(/<!--#include\s+file="([^"]+)"\s*-->/g, (match, filePath) => {
    try {
      // ルート相対パスの場合は sourceDir をベースにする
      const fullPath = filePath.startsWith('/') 
        ? path.join(__dirname, '..', filePath)
        : path.resolve(basePath, filePath);
      const includeContent = fs.readFileSync(fullPath, 'utf8');
      console.log(`SSI: Included ${filePath} from ${fullPath}`);
      return includeContent;
    } catch (error) {
      console.warn(`SSI Warning: ${filePath} not found at ${error.path || 'unknown path'}`);
      return `<!-- Error: ${filePath} not found -->`;
    }
  });
}

// ビルド実行
const sourceDir = path.join(__dirname, '..');
// 環境に応じて出力ディレクトリを決定
const outputDirName = process.env.BUILD_ENV === 'demo' ? 'demo' : 'build';
const outputDir = path.join(__dirname, '..', outputDirName);

console.log('Starting production build...');
console.log(`Source: ${sourceDir}`);
console.log(`Output: ${outputDir}`);

// 出力ディレクトリをクリーン
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true });
}

// ビルド処理実行
processDirectory(sourceDir, outputDir);

console.log('Production build completed!');
console.log(`Files built to: ${outputDir}`);