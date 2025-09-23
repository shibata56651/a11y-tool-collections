// パス設定管理
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class PathConfig {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production' && !process.env.BUILD_ENV;
    // 環境別baseURL設定
    if (process.env.BUILD_ENV === 'demo') {
      // .envファイルからディレクトリ名を取得（デフォルトは tmp-yours）
      const demoDir = process.env.DEMO_DIRECTORY_NAME || 'tmp-yours';
      this.baseUrl = `/${demoDir}/`;
    } else if (process.env.BUILD_ENV === 'production') {
      // 本番環境用（必要に応じて.envから取得）
      const prodDir = process.env.PRODUCTION_DIRECTORY_NAME || '';
      this.baseUrl = prodDir ? `/${prodDir}/` : '/';
    } else {
      this.baseUrl = '/'; // ローカル開発用
    }
  }

  // baseタグのHTMLを生成
  generateBaseTag() {
    return `<base href="${this.baseUrl}">`;
  }

  // パスを環境に応じて変換
  convertPath(filePath, isAbsolute = false) {
    if (this.isDevelopment) {
      // 開発環境：ルート相対パス
      return filePath.startsWith('/') ? filePath : `/${filePath}`;
    } else {
      // プロダクション環境：絶対パス
      return isAbsolute ? `${this.baseUrl}${filePath.replace(/^\//, '')}` : filePath;
    }
  }

  // HTMLファイル内のパスを一括変換
  processHtmlPaths(content) {
    let processed = content;

    if (this.isDevelopment) {
      // 開発環境：相対パスをルート相対パスに変換
      processed = processed.replace(
        /(?:src|href)="(?!http|https|#|mailto|tel)([^"]*\.(?:css|js|jpg|jpeg|png|gif|svg|ico))"/gi,
        (match, path) => {
          const cleanPath = path.replace(/^\.\.\//, '').replace(/^\.\//, '');
          return match.replace(path, `/${cleanPath}`);
        }
      );
    } else {
      // プロダクション環境：ルート相対パスをbaseURLに変換（アセットファイル）
      processed = processed.replace(
        /(?:src|href)="\/([^"]*\.(?:css|js|jpg|jpeg|png|gif|svg|ico))"/gi,
        (match, path) => {
          const newPath = this.baseUrl.endsWith('/') ? `${this.baseUrl}${path}` : `${this.baseUrl}/${path}`;
          return match.replace(`/${path}`, newPath);
        }
      );
      
      // demo環境：HTMLページへのリンク（絶対パス /xxx/ や /xxx/xxx/ など）をbaseURLに変換
      if (process.env.BUILD_ENV === 'demo') {
        processed = processed.replace(
          /href="\/([^"#]*?)(?:\/)?"/gi,
          (match, path) => {
            // アセットファイル、外部リンク、ハッシュリンクは除外
            if (!/\.(css|js|jpg|jpeg|png|gif|svg|ico)$/i.test(path) && 
                !path.includes('http') && 
                !path.includes('mailto') && 
                !path.includes('tel')) {
              const cleanPath = path === '' ? '' : path; // ルートパスの場合は空文字
              const newPath = cleanPath === '' ? 
                this.baseUrl : 
                (this.baseUrl.endsWith('/') ? `${this.baseUrl}${cleanPath}/` : `${this.baseUrl}/${cleanPath}/`);
              return `href="${newPath}"`;
            }
            return match;
          }
        );
      }
    }

    return processed;
  }

  // CSSファイル内のパスを変換
  processCssPaths(content) {
    let processed = content;

    if (this.isDevelopment) {
      // 開発環境：相対パスをルート相対パスに変換
      processed = processed.replace(
        /url\(["']?(?!http|https|data:)([^"')]*\.(?:jpg|jpeg|png|gif|svg|ico))["']?\)/gi,
        (match, path) => {
          const cleanPath = path.replace(/^\.\.\//, '').replace(/^\.\//, '');
          return match.replace(path, `/${cleanPath}`);
        }
      );
    } else {
      // プロダクション環境：ルート相対パスを絶対パスに変換
      processed = processed.replace(
        /url\(["']?\/([^"')]*\.(?:jpg|jpeg|png|gif|svg|ico))["']?\)/gi,
        (match, path) => {
          const newPath = this.baseUrl.endsWith('/') ? `${this.baseUrl}${path}` : `${this.baseUrl}/${path}`;
          return match.replace(`/${path}`, newPath);
        }
      );
    }

    return processed;
  }
}

module.exports = PathConfig;