export class CodeBlock {
    constructor(element) {
        const copyButton = element.querySelector('.code-block__copy-button');
        const codeElement = element.querySelector('.code-block__code');
        if (!copyButton || !codeElement) {
            throw new Error('コードブロック要素が見つかりません');
        }
        this.copyButton = copyButton;
        this.codeElement = codeElement;
        this.originalButtonText = this.copyButton.textContent || 'コピー';
        this.processCodeContent();
        this.init();
    }
    processCodeContent() {
        console.log('CodeBlock: processCodeContent() started');
        const originalHtml = this.codeElement.innerHTML;
        console.log('CodeBlock: Original HTML:', originalHtml);
        const hasHtmlTags = this.containsHtmlTags(originalHtml);
        console.log('CodeBlock: Contains HTML tags:', hasHtmlTags);
        if (hasHtmlTags) {
            const formattedHtml = this.formatHtml(originalHtml);
            console.log('CodeBlock: Formatted HTML:', formattedHtml);
            this.codeElement.textContent = formattedHtml;
            console.log('CodeBlock: HTML has been escaped and displayed');
        }
        else {
            console.log('CodeBlock: No HTML tags found, keeping original content');
        }
    }
    containsHtmlTags(content) {
        const trimmedContent = content.trim();
        console.log('CodeBlock: Checking content length:', trimmedContent.length);
        console.log('CodeBlock: Content preview:', trimmedContent.substring(0, 100));
        const hasOpenTag = trimmedContent.includes('<') && trimmedContent.includes('>');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const hasElements = tempDiv.children.length > 0;
        console.log('CodeBlock: Has open/close tags:', hasOpenTag);
        console.log('CodeBlock: Has DOM elements:', hasElements);
        console.log('CodeBlock: tempDiv children count:', tempDiv.children.length);
        return hasElements || hasOpenTag;
    }
    formatHtml(html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return this.prettifyHtml(tempDiv, 0).trim();
    }
    prettifyHtml(element, indent) {
        const indentStr = '  '.repeat(indent);
        let result = '';
        for (const node of Array.from(element.childNodes)) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const elem = node;
                const tagName = elem.tagName.toLowerCase();
                const attributes = this.getAttributesString(elem);
                result += indentStr + `<${tagName}${attributes}>`;
                if (elem.children.length > 0) {
                    result += '\n';
                    result += this.prettifyHtml(elem, indent + 1);
                    result += indentStr + `</${tagName}>\n`;
                }
                else if (elem.textContent?.trim()) {
                    result += elem.textContent.trim() + `</${tagName}>\n`;
                }
                else {
                    result += `</${tagName}>\n`;
                }
            }
            else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
                result += indentStr + node.textContent.trim() + '\n';
            }
        }
        return result;
    }
    getAttributesString(element) {
        const attributes = Array.from(element.attributes);
        if (attributes.length === 0)
            return '';
        return ' ' + attributes
            .map(attr => `${attr.name}="${attr.value}"`)
            .join(' ');
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
    console.log('CodeBlock: initCodeBlocks() called');
    const codeBlocks = document.querySelectorAll('.code-block');
    console.log('CodeBlock: Found', codeBlocks.length, 'code blocks');
    codeBlocks.forEach((element, index) => {
        try {
            console.log(`CodeBlock: Initializing code block ${index + 1}`);
            new CodeBlock(element);
        }
        catch (error) {
            console.error(`CodeBlock: 初期化に失敗しました (block ${index + 1}):`, error);
        }
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeBlocks);
}
else {
    initCodeBlocks();
}
