/**
 * コードブロックのコピー機能を管理するクラス
 */
class CodeBlock {
  constructor(element) {
    this.element = element;
    
    const copyButton = element.querySelector('.code-block__copy-button');
    const codeElement = element.querySelector('.code-block__code');

    if (!copyButton || !codeElement) {
      throw new Error('コードブロック要素が見つかりません');
    }

    this.copyButton = copyButton;
    this.codeElement = codeElement;
    this.originalButtonText = this.copyButton.textContent || 'コピー';

    // HTMLコンテンツを自動的にエスケープして表示
    this.processCodeContent();
    this.init();
  }

  /**
   * コードコンテンツを処理してエスケープ表示
   */
  processCodeContent() {
    console.log('CodeBlock: processCodeContent() started');
    
    // 元のHTMLコンテンツを取得
    const originalHtml = this.codeElement.innerHTML;
    console.log('CodeBlock: Original HTML:', originalHtml);
    
    // HTMLタグが含まれているかチェック
    const hasHtmlTags = this.containsHtmlTags(originalHtml);
    console.log('CodeBlock: Contains HTML tags:', hasHtmlTags);
    
    if (hasHtmlTags) {
      // HTMLタグを含む場合、きれいにフォーマットしてエスケープ
      const formattedHtml = this.formatHtml(originalHtml);
      console.log('CodeBlock: Formatted HTML:', formattedHtml);
      this.codeElement.textContent = formattedHtml;
      console.log('CodeBlock: HTML has been escaped and displayed');
    } else {
      console.log('CodeBlock: No HTML tags found, keeping original content');
    }
  }

  /**
   * HTMLタグが含まれているかチェック
   */
  containsHtmlTags(content) {
    // より直接的にHTMLタグの存在をチェック
    const trimmedContent = content.trim();
    console.log('CodeBlock: Checking content length:', trimmedContent.length);
    console.log('CodeBlock: Content preview:', trimmedContent.substring(0, 100));
    
    // HTMLタグのパターンを検出
    const hasOpenTag = trimmedContent.includes('<') && trimmedContent.includes('>');
    
    // DOM要素も確認
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const hasElements = tempDiv.children.length > 0;
    
    console.log('CodeBlock: Has open/close tags:', hasOpenTag);
    console.log('CodeBlock: Has DOM elements:', hasElements);
    console.log('CodeBlock: tempDiv children count:', tempDiv.children.length);
    
    return hasElements || hasOpenTag;
  }

  /**
   * HTMLをきれいにフォーマット
   */
  formatHtml(html) {
    // 一時的なdiv要素を作成してHTMLを解析
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // HTMLを整形してテキストとして返す
    return this.prettifyHtml(tempDiv, 0).trim();
  }

  /**
   * HTMLを整形する再帰関数
   */
  prettifyHtml(element, indent) {
    const indentStr = '  '.repeat(indent);
    let result = '';
    
    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const elem = node;
        const tagName = elem.tagName.toLowerCase();
        const attributes = this.getAttributesString(elem);
        
        // 開始タグ
        result += indentStr + `<${tagName}${attributes}>`;
        
        // 子要素がある場合
        if (elem.children.length > 0) {
          result += '\n';
          result += this.prettifyHtml(elem, indent + 1);
          result += indentStr + `</${tagName}>\n`;
        } else if (elem.textContent && elem.textContent.trim()) {
          // テキストコンテンツがある場合
          result += elem.textContent.trim() + `</${tagName}>\n`;
        } else {
          // 空要素の場合
          result += `</${tagName}>\n`;
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim()) {
        // テキストノード（空白以外）
        result += indentStr + node.textContent.trim() + '\n';
      }
    }
    
    return result;
  }

  /**
   * 要素の属性を文字列として取得
   */
  getAttributesString(element) {
    const attributes = Array.from(element.attributes);
    if (attributes.length === 0) return '';
    
    return ' ' + attributes
      .map(attr => `${attr.name}="${attr.value}"`)
      .join(' ');
  }

  /**
   * 初期化
   */
  init() {
    this.copyButton.addEventListener('click', this.handleCopyClick.bind(this));
  }

  /**
   * コピーボタンクリック処理
   */
  async handleCopyClick() {
    try {
      // コードテキストを取得
      const codeText = this.getCodeText();
      
      // クリップボードにコピー
      await this.copyToClipboard(codeText);
      
      // 成功フィードバック
      this.showCopySuccess();
      
    } catch (error) {
      console.error('コピーに失敗しました:', error);
      this.showCopyError();
    }
  }

  /**
   * コードテキストを取得
   */
  getCodeText() {
    return this.codeElement.textContent || '';
  }

  /**
   * クリップボードにテキストをコピー
   */
  async copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      // Clipboard APIを使用（HTTPS環境）
      await navigator.clipboard.writeText(text);
    } else {
      // fallback: execCommandを使用
      await this.fallbackCopyTextToClipboard(text);
    }
  }

  /**
   * フォールバック用のコピー処理
   */
  async fallbackCopyTextToClipboard(text) {
    return new Promise((resolve, reject) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // スクリーン外に配置
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          resolve();
        } else {
          reject(new Error('execCommand failed'));
        }
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(textArea);
      }
    });
  }

  /**
   * コピー成功時のフィードバック表示
   */
  showCopySuccess() {
    this.copyButton.textContent = 'コピー完了!';
    this.copyButton.classList.add('code-block__copy-button--copied');
    this.copyButton.disabled = true;

    // 2秒後に元に戻す
    setTimeout(() => {
      this.copyButton.textContent = this.originalButtonText;
      this.copyButton.classList.remove('code-block__copy-button--copied');
      this.copyButton.disabled = false;
    }, 2000);
  }

  /**
   * コピー失敗時のフィードバック表示
   */
  showCopyError() {
    this.copyButton.textContent = 'コピー失敗';
    
    // 2秒後に元に戻す
    setTimeout(() => {
      this.copyButton.textContent = this.originalButtonText;
    }, 2000);
  }

  /**
   * コードブロック要素を破棄
   */
  destroy() {
    this.copyButton.removeEventListener('click', this.handleCopyClick.bind(this));
  }
}

/**
 * ページ内のすべてのコードブロックを初期化
 */
function initCodeBlocks() {
  console.log('CodeBlock: initCodeBlocks() called');
  const codeBlocks = document.querySelectorAll('.code-block');
  console.log('CodeBlock: Found', codeBlocks.length, 'code blocks');
  
  codeBlocks.forEach((element, index) => {
    try {
      console.log(`CodeBlock: Initializing code block ${index + 1}`);
      new CodeBlock(element);
    } catch (error) {
      console.error(`CodeBlock: 初期化に失敗しました (block ${index + 1}):`, error);
    }
  });
}

/**
 * DOMContentLoaded時の自動初期化
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCodeBlocks);
} else {
  initCodeBlocks();
}