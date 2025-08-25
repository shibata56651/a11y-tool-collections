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

    this.init();
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
  const codeBlocks = document.querySelectorAll('.code-block');
  
  codeBlocks.forEach((element) => {
    try {
      new CodeBlock(element);
    } catch (error) {
      console.error('コードブロックの初期化に失敗しました:', error);
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