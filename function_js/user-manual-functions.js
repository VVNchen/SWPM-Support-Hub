class UserManualFunctions {
  constructor() {
    this.selectedType = '';
    this.selectedAudience = '';
    this.selectedFormat = '';
    this.includedSections = [];
  }

  // 初始化模組
  async initialize() {
    console.log('🚀 初始化 User Manual 模組...');

    try {
      // 等待 DOM 元素載入
      await this.waitForElement('#manualTypeSelect');
      console.log('✅ DOM 元素載入完成');

      // 綁定事件
      this.bindEvents();
      console.log('✅ 事件綁定完成');

      // 初始化按鈕狀態
      this.updateGenerateButton();
      console.log('✅ 按鈕狀態初始化完成');

      console.log('✅ User Manual 模組初始化完成');

    } catch (error) {
      console.error('❌ User Manual 模組初始化失敗:', error);
      this.showError('初始化失敗: ' + error.message);
    }
  }

  waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`元素 ${selector} 載入超時`));
      }, timeout);
    });
  }

  bindEvents() {
    const manualTypeSelect = document.getElementById('manualTypeSelect');
    const audienceSelect = document.getElementById('audienceSelect');
    const formatSelect = document.getElementById('formatSelect');

    if (manualTypeSelect) {
      manualTypeSelect.onchange = () => {
        this.updateManualPreview();
        this.updateGenerateButton();
      };
    }

    if (audienceSelect) {
      audienceSelect.onchange = () => {
        this.updateManualPreview();
        this.updateGenerateButton();
      };
    }

    if (formatSelect) {
      formatSelect.onchange = () => {
        this.updateManualPreview();
        this.updateGenerateButton();
      };
    }

    // 綁定 checkbox 事件
    const checkboxes = ['includeIntro', 'includeFeatures', 'includeSteps',
      'includeTroubleshooting', 'includeFAQ', 'includeScreenshots'];

    checkboxes.forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.onchange = () => this.updateManualPreview();
      }
    });
  }

  // 更新預覽
  updateManualPreview() {
    const manualTypeSelect = document.getElementById('manualTypeSelect');
    const audienceSelect = document.getElementById('audienceSelect');
    const formatSelect = document.getElementById('formatSelect');
    const previewSection = document.getElementById('manualPreviewSection');

    if (!previewSection) return;

    const selectedType = manualTypeSelect?.value || '';
    const selectedAudience = audienceSelect?.value || '';
    const selectedFormat = formatSelect?.value || '';

    if (selectedType || selectedAudience || selectedFormat) {
      // 更新預覽內容
      this.updatePreviewContent(selectedType, selectedAudience, selectedFormat);
      previewSection.classList.remove('hidden');
    } else {
      previewSection.classList.add('hidden');
    }
  }

  updatePreviewContent(type, audience, format) {
    const previewManualType = document.getElementById('previewManualType');
    const previewAudience = document.getElementById('previewAudience');
    const previewFormat = document.getElementById('previewFormat');
    const previewPages = document.getElementById('previewPages');
    const previewSections = document.getElementById('previewSections');

    if (previewManualType) {
      previewManualType.textContent = this.getManualTypeDisplay(type);
    }

    if (previewAudience) {
      previewAudience.textContent = this.getAudienceDisplay(audience);
    }

    if (previewFormat) {
      previewFormat.textContent = this.getFormatDisplay(format);
    }

    if (previewPages) {
      previewPages.textContent = this.estimatePages(type, audience);
    }

    if (previewSections) {
      previewSections.textContent = this.getIncludedSections();
    }
  }

  getManualTypeDisplay(type) {
    const types = {
      'quick-start': 'Quick Start Guide',
      'user-guide': 'Complete User Guide',
      'admin-guide': 'Administrator Guide',
      'troubleshooting': 'Troubleshooting Guide',
      'api-reference': 'API Reference'
    };
    return types[type] || '-';
  }

  getAudienceDisplay(audience) {
    const audiences = {
      'end-user': 'End Users',
      'administrator': 'System Administrators',
      'developer': 'Developers',
      'support-team': 'Support Team'
    };
    return audiences[audience] || '-';
  }

  getFormatDisplay(format) {
    const formats = {
      'pdf': 'PDF Document',
      'html': 'HTML Web Page',
      'markdown': 'Markdown File',
      'word': 'Microsoft Word'
    };
    return formats[format] || '-';
  }

  estimatePages(type, audience) {
    let basePage = 10;

    // 根據手冊類型調整頁數
    switch (type) {
      case 'quick-start': basePage = 5; break;
      case 'user-guide': basePage = 25; break;
      case 'admin-guide': basePage = 20; break;
      case 'troubleshooting': basePage = 15; break;
      case 'api-reference': basePage = 30; break;
    }

    // 根據目標受眾調整
    if (audience === 'developer') {
      basePage += 5;
    } else if (audience === 'end-user') {
      basePage += 3;
    }

    return `${basePage}-${basePage + 10} pages`;
  }

  getIncludedSections() {
    const sections = [];
    const checkboxes = [
      { id: 'includeIntro', name: 'Introduction' },
      { id: 'includeFeatures', name: 'Features' },
      { id: 'includeSteps', name: 'Instructions' },
      { id: 'includeTroubleshooting', name: 'Troubleshooting' },
      { id: 'includeFAQ', name: 'FAQ' },
      { id: 'includeScreenshots', name: 'Screenshots' }
    ];

    checkboxes.forEach(checkbox => {
      const element = document.getElementById(checkbox.id);
      if (element && element.checked) {
        sections.push(checkbox.name);
      }
    });

    return sections.length > 0 ? sections.join(', ') : 'None selected';
  }

  // 更新生成按鈕狀態
  updateGenerateButton() {
    const generateBtn = document.getElementById('generateManualBtn');
    const manualTypeSelect = document.getElementById('manualTypeSelect');
    const audienceSelect = document.getElementById('audienceSelect');
    const formatSelect = document.getElementById('formatSelect');

    console.log('🔄 更新生成按鈕狀態...');

    if (!generateBtn) return;

    const hasType = manualTypeSelect?.value?.trim() !== '';
    const hasAudience = audienceSelect?.value?.trim() !== '';
    const hasFormat = formatSelect?.value?.trim() !== '';

    console.log('類型選擇:', hasType, '受眾選擇:', hasAudience, '格式選擇:', hasFormat);

    if (hasType && hasAudience && hasFormat) {
      generateBtn.disabled = false;
      generateBtn.style.backgroundColor = '#007bff';
      generateBtn.title = 'Generate user manual';
    } else {
      generateBtn.disabled = true;
      generateBtn.style.backgroundColor = '#6c757d';
      generateBtn.title = '請選擇手冊類型、目標受眾和輸出格式';
    }
  }

  // 生成使用者手冊
  generateUserManual() {
    const manualTypeSelect = document.getElementById('manualTypeSelect');
    const audienceSelect = document.getElementById('audienceSelect');
    const formatSelect = document.getElementById('formatSelect');
    const downloadSection = document.getElementById('downloadSection');
    const manualDownloadLink = document.getElementById('manualDownloadLink');

    if (!manualTypeSelect?.value || !audienceSelect?.value || !formatSelect?.value) {
      this.showError('請完成所有必要選項的選擇');
      return;
    }

    const manualType = manualTypeSelect.value;
    const audience = audienceSelect.value;
    const format = formatSelect.value;

    console.log('🚀 開始生成使用者手冊...', { manualType, audience, format });

    // 模擬生成過程
    this.showSuccess('正在生成使用者手冊，請稍候...');

    // 模擬生成延遲
    setTimeout(() => {
      if (manualDownloadLink) {
        manualDownloadLink.textContent = `Download ${this.getManualTypeDisplay(manualType)} (${this.getFormatDisplay(format)})`;
        manualDownloadLink.classList.remove('disabled');
      }

      if (downloadSection) {
        downloadSection.classList.remove('hidden');
      }

      this.showSuccess('使用者手冊生成完成！');
    }, 2000);
  }

  // 下載手冊
  async downloadManual() {
    const manualTypeSelect = document.getElementById('manualTypeSelect');
    const formatSelect = document.getElementById('formatSelect');

    if (!manualTypeSelect?.value || !formatSelect?.value) {
      this.showError('請先生成手冊');
      return;
    }

    const manualType = this.getManualTypeDisplay(manualTypeSelect.value);
    const format = formatSelect.value;
    const fileName = `${manualType.replace(/\s+/g, '_')}.${this.getFileExtension(format)}`;

    try {
      // 使用 File System Access API (如果支援的話)
      if ('showSaveFilePicker' in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: this.getFileTypeOptions(format)
        });

        this.showSuccess(`準備下載手冊到: ${fileHandle.name}`);
        this.performManualDownload(manualType, format, fileHandle);
      } else {
        // 降級方案：創建下載連結
        this.createManualDownloadLink(manualType, format, fileName);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('用戶取消了下載');
      } else {
        console.error('下載失敗:', error);
        this.showError('下載失敗: ' + error.message);
      }
    }
  }

  getFileExtension(format) {
    const extensions = {
      'pdf': 'pdf',
      'html': 'html',
      'markdown': 'md',
      'word': 'docx'
    };
    return extensions[format] || 'txt';
  }

  getFileTypeOptions(format) {
    const types = {
      'pdf': [{ description: 'PDF files', accept: { 'application/pdf': ['.pdf'] } }],
      'html': [{ description: 'HTML files', accept: { 'text/html': ['.html'] } }],
      'markdown': [{ description: 'Markdown files', accept: { 'text/markdown': ['.md'] } }],
      'word': [{ description: 'Word files', accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } }]
    };
    return types[format] || [{ description: 'Text files', accept: { 'text/plain': ['.txt'] } }];
  }

  async performManualDownload(manualType, format, fileHandle) {
    try {
      const content = this.generateManualContent(manualType, format);
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      this.showSuccess('手冊下載完成！');
    } catch (error) {
      console.error('檔案寫入失敗:', error);
      this.showError('檔案寫入失敗: ' + error.message);
    }
  }

  createManualDownloadLink(manualType, format, fileName) {
    const content = this.generateManualContent(manualType, format);
    const blob = new Blob([content], { type: this.getContentType(format) });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showSuccess('手冊下載已開始');
  }

  generateManualContent(manualType, format) {
    const sections = this.getIncludedSections();
    const currentDate = new Date().toISOString().split('T')[0];

    let content = `${manualType}\n`;
    content += `Generated on: ${currentDate}\n`;
    content += `Included Sections: ${sections}\n\n`;
    content += `This is a generated user manual for the Firmware Release Workflow system.\n\n`;

    if (format === 'html') {
      content = `
<!DOCTYPE html>
<html>
<head>
    <title>${manualType}</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>${manualType}</h1>
    <p><strong>Generated on:</strong> ${currentDate}</p>
    <p><strong>Included Sections:</strong> ${sections}</p>
    <p>This is a generated user manual for the Firmware Release Workflow system.</p>
</body>
</html>`;
    } else if (format === 'markdown') {
      content = `# ${manualType}\n\n**Generated on:** ${currentDate}\n\n**Included Sections:** ${sections}\n\nThis is a generated user manual for the Firmware Release Workflow system.\n`;
    }

    return content;
  }

  getContentType(format) {
    const types = {
      'pdf': 'application/pdf',
      'html': 'text/html',
      'markdown': 'text/markdown',
      'word': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return types[format] || 'text/plain';
  }

  // 重設表單
  resetManualForm() {
    const manualTypeSelect = document.getElementById('manualTypeSelect');
    const audienceSelect = document.getElementById('audienceSelect');
    const formatSelect = document.getElementById('formatSelect');
    const previewSection = document.getElementById('manualPreviewSection');
    const downloadSection = document.getElementById('downloadSection');
    const manualDownloadLink = document.getElementById('manualDownloadLink');

    if (manualTypeSelect) manualTypeSelect.value = '';
    if (audienceSelect) audienceSelect.value = '';
    if (formatSelect) formatSelect.value = '';

    // 重設 checkboxes
    const checkboxes = ['includeIntro', 'includeFeatures', 'includeSteps',
      'includeTroubleshooting', 'includeFAQ', 'includeScreenshots'];

    checkboxes.forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.checked = ['includeIntro', 'includeFeatures', 'includeSteps'].includes(id);
      }
    });

    if (previewSection) previewSection.classList.add('hidden');
    if (downloadSection) downloadSection.classList.add('hidden');

    if (manualDownloadLink) {
      manualDownloadLink.textContent = 'Click to download Manual';
      manualDownloadLink.classList.add('disabled');
    }

    this.updateGenerateButton();
    console.log('🔄 User Manual 表單已重設');
  }

  // 顯示成功訊息
  showSuccess(message) {
    console.log('✅', message);
    // 可以在這裡加入更好的 UI 提示
  }

  // 顯示錯誤訊息
  showError(message) {
    console.error('❌', message);
    // 可以在這裡加入更好的 UI 提示
  }
}

// 建立全域實例
window.userManualFunctions = new UserManualFunctions();

// 設置全域函數
window.updateManualPreview = () => window.userManualFunctions.updateManualPreview();
window.updateGenerateButton = () => window.userManualFunctions.updateGenerateButton();
window.generateUserManual = () => window.userManualFunctions.generateUserManual();
window.resetManualForm = () => window.userManualFunctions.resetManualForm();
window.downloadManual = () => window.userManualFunctions.downloadManual();

console.log('✅ User Manual 功能模組已載入');
