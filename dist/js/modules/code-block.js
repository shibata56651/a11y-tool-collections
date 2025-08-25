export class CodeBlock {
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
    init() {
        this.copyButton.addEventListener('click', this.handleCopyClick.bind(this));
    }
    async handleCopyClick() {
        try {
            const codeText = this.getCodeText();
            await this.copyToClipboard(codeText);
            this.showCopySuccess();
        }
        catch (error) {
            console.error('コピーに失敗しました:', error);
            this.showCopyError();
        }
    }
    getCodeText() {
        return this.codeElement.textContent || '';
    }
    async copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        }
        else {
            await this.fallbackCopyTextToClipboard(text);
        }
    }
    async fallbackCopyTextToClipboard(text) {
        return new Promise((resolve, reject) => {
            const textArea = document.createElement('textarea');
            textArea.value = text;
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
                }
                else {
                    reject(new Error('execCommand failed'));
                }
            }
            catch (error) {
                reject(error);
            }
            finally {
                document.body.removeChild(textArea);
            }
        });
    }
    showCopySuccess() {
        this.copyButton.textContent = 'コピー完了!';
        this.copyButton.classList.add('code-block__copy-button--copied');
        this.copyButton.disabled = true;
        setTimeout(() => {
            this.copyButton.textContent = this.originalButtonText;
            this.copyButton.classList.remove('code-block__copy-button--copied');
            this.copyButton.disabled = false;
        }, 2000);
    }
    showCopyError() {
        this.copyButton.textContent = 'コピー失敗';
        setTimeout(() => {
            this.copyButton.textContent = this.originalButtonText;
        }, 2000);
    }
    destroy() {
        this.copyButton.removeEventListener('click', this.handleCopyClick.bind(this));
    }
}
export function initCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.code-block');
    codeBlocks.forEach((element) => {
        try {
            new CodeBlock(element);
        }
        catch (error) {
            console.error('コードブロックの初期化に失敗しました:', error);
        }
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeBlocks);
}
else {
    initCodeBlocks();
}
