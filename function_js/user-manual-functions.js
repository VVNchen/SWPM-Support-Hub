class UserManualFunctions {
  constructor() {
    this.selectedType = '';
    this.selectedAudience = '';
    this.selectedFormat = '';
    this.includedSections = [];
    this.currentLang = 'en'; // 'en' or 'zh'
    // 支援下載的語言代碼
    this.supportedLangs = ['zh-tw', 'zh-cn', 'vi-vn', 'th-th', 'ko-kr', 'ja-jp', 'id-id', 'pt-pt', 'pt-br', 'uk-ua', 'tr-tr', 'ru-ru', 'ro-ro', 'pl-pl', 'nl-nl', 'it-it', 'hu-hu', 'he-il', 'fr-fr', 'es-es', 'de-de', 'cs-cz'];
  }

  // 初始化模組
  async initialize() {
    console.log('🚀 初始化 User Manual 模組...');

    try {
      // 等待 FAQ 容器載入
      await this.waitForElement('#faqSectionsContainer');
      console.log('✅ DOM 元素載入完成');

      // 綁定事件
      this.bindEvents();
      console.log('✅ 事件綁定完成');

      // 初始化按鈕狀態
      this.updateGenerateButton();
      console.log('✅ 按鈕狀態初始化完成');
      // 載入 FAQ CSV
      await this.loadFAQ();
      console.log('✅ FAQ CSV 載入完成');
      // 綁定語言切換按鈕
      this.bindLangToggle();
      // 首次渲染 FAQ
      this.renderFAQPage();
      // 綁定確認按鈕
      this.bindConfirmButton();

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

    if (format === 'html') {
      const faqHtml = this.generateFAQSections('html');
      return `<!DOCTYPE html>
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
  ${faqHtml}
</body>
</html>`;
    } else if (format === 'markdown') {
      const faqMd = this.generateFAQSections('markdown');
      return `# ${manualType}
+
+**Generated on:** ${currentDate}
+
+**Included Sections:** ${sections}
+
+This is a generated user manual for the Firmware Release Workflow system.
+
+${faqMd}`;
    } else {
      return `${manualType}\nGenerated on: ${currentDate}\nIncluded Sections: ${sections}\n\n`;
    }
  }

  // 生成 FAQ 區段 (HTML or Markdown)
  generateFAQSections(format = 'html') {
    if (!this.faqRows || this.faqRows.length === 0) return '';
    let output = '';
    let currentCat = null;
    let sectionCount = 0;
    this.faqRows.forEach(row => {
      const icon = row[0] || '';
      const category = row[1] || '';
      const content = (row[28] || '').replace(/\[.*?\]/g, '').trim();
      const url = row[25] || '#';
      if (!category || !content) return;
      if (category !== currentCat) {
        if (format === 'html') {
          if (sectionCount % 2 === 0) output += '<div class="container">';
          output += `<section class="block_wrapper"><div class="topic"><div class="title_icon">${icon}</div><p class="self_p">${category}</p></div><div class="content_wrapper">`;
        } else {
          output += `## ${category}\n`;
        }
        currentCat = category;
        sectionCount++;
      }
      if (format === 'html') {
        output += `<ul><li><a href="${url}">${content}</a></li></ul>`;
        if (sectionCount % 2 === 0) {
          output += '</div></section></div>';
        }
      } else {
        output += `- [${content}](${url})\n`;
      }
    });
    return output;
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

  // 使用 SheetJS 載入 Multi-lang_FAQ.csv
  async loadFAQ() {
    try {
      const response = await fetch('datasheet/Multi-lang_FAQ.csv');
      const csvText = await response.text();
      const workbook = XLSX.read(csvText, { type: 'string' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      this.faqHeader = rows[0] || [];
      this.faqRows = rows.slice(1);
    } catch (err) {
      console.error('❌ 無法載入 FAQ CSV:', err);
      this.faqRows = [];
    }
  }


  // 綁定中英文切換按鈕
  bindLangToggle() {
    const enBtn = document.getElementById('langEnBtn');
    const zhBtn = document.getElementById('langZhBtn');
    if (enBtn && zhBtn) {
      // 初始化按鈕狀態
      enBtn.classList.toggle('active', this.currentLang === 'en');
      zhBtn.classList.toggle('active', this.currentLang === 'zh');
      // 點擊事件
      enBtn.onclick = () => {
        this.currentLang = 'en';
        enBtn.classList.add('active');
        zhBtn.classList.remove('active');
        this.renderFAQPage();
      };
      zhBtn.onclick = () => {
        this.currentLang = 'zh';
        zhBtn.classList.add('active');
        enBtn.classList.remove('active');
        this.renderFAQPage();
      };
    }
  }
  // 渲染 FAQ 分類清單
  renderFAQPage() {
    const container = document.getElementById('faqSectionsContainer');
    if (!container || !this.faqRows) return;
    // 保存當前展開與勾選狀態
    const prevDetails = container.querySelectorAll('details.faq-category');
    const openCats = new Set();
    prevDetails.forEach(d => {
      if (d.open) {
        const cat = d.querySelector('.faq-cat')?.textContent;
        if (cat) openCats.add(cat);
      }
    });
    const prevChecked = new Set(Array.from(container.querySelectorAll('.faq-item-checkbox:checked')).map(cb => cb.dataset.rowIdx));
    container.innerHTML = '';
    let currentCat = null;
    this.faqRows.forEach((row, idx) => {
      const iconHtml = row[0] || '';
      const category = row[1] || '';
      const url = row[25] || '#';
      const contentIdx = this.currentLang === 'zh' ? 29 : 28;
      let content = (row[contentIdx] || '').replace(/\[.*?\]/g, '').trim();
      if (!category || !content) return;
      if (category !== currentCat) {
        currentCat = category;
        const details = document.createElement('details');
        details.className = 'faq-category';
        // 恢復展開狀態
        if (openCats.has(category)) details.open = true;
        const summary = document.createElement('summary');
        summary.innerHTML = `<span class='faq-icon'>${iconHtml}</span><span class='faq-cat'>${category}</span>`;
        const selectAll = document.createElement('input');
        selectAll.type = 'checkbox'; selectAll.className = 'select-all';
        selectAll.title = 'Select all in this category';
        selectAll.onchange = e => {
          const checked = e.target.checked;
          details.querySelectorAll('.faq-item-checkbox').forEach(cb => cb.checked = checked);
          this.updateDownloadButtonState();
        };
        summary.prepend(selectAll);
        details.appendChild(summary);
        container.appendChild(details);
      }
      const lastDetails = container.lastElementChild;
      const itemDiv = document.createElement('div');
      itemDiv.className = 'faq-item';
      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.className = 'faq-item-checkbox'; cb.dataset.rowIdx = idx;
      // 恢復勾選狀態
      if (prevChecked.has(idx.toString())) cb.checked = true;
      cb.onchange = () => this.updateDownloadButtonState();
      const link = document.createElement('a');
      link.href = url; link.target = '_blank'; link.textContent = content;
      itemDiv.appendChild(cb); itemDiv.appendChild(link);
      lastDetails.appendChild(itemDiv);
    });
    // 渲染語言選擇
    this.renderLanguageCheckboxes();
    // 綁定下載
    this.bindDownloadButton();
  }

  // 渲染語言選擇框 (English/中文)
  renderLanguageCheckboxes() {
    const container = document.getElementById('languageCheckboxes');
    if (!container) return;
    container.innerHTML = '';
    const langs = [{ code: 'en', label: 'English' }, { code: 'zh', label: '中文' }];
    langs.forEach(lang => {
      const label = document.createElement('label');
      label.style.marginRight = '16px';
      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.value = lang.code; cb.className = 'lang-cb';
      cb.onchange = () => this.updateDownloadButtonState();
      label.append(cb, ` ${lang.label}`);
      container.appendChild(label);
    });
  }

  // 綁定下載按鈕
  bindDownloadButton() {
    const btn = document.getElementById('downloadFaqBtn');
    if (!btn) return;
    btn.onclick = () => this.downloadSelectedFaqs();
    this.updateDownloadButtonState();
  }

  // 更新下載按鈕啟用狀態
  updateDownloadButtonState() {
    const anyItem = document.querySelectorAll('.faq-item-checkbox:checked').length > 0;
    const anyLang = document.querySelectorAll('.lang-cb:checked').length > 0;
    const btn = document.getElementById('downloadFaqBtn');
    if (btn) btn.disabled = !(anyItem && anyLang);
  }

  // 下載選定的 FAQ
  async downloadSelectedFaqs() {
    const selectedRows = Array.from(document.querySelectorAll('.faq-item-checkbox:checked')).map(cb => parseInt(cb.dataset.rowIdx));
    const langs = Array.from(document.querySelectorAll('.lang-cb:checked')).map(cb => cb.value);
    if (!selectedRows.length || !langs.length) return;
    // 選擇或重用下載資料夾
    if (!this.downloadDirHandle) {
      try {
        this.downloadDirHandle = await window.showDirectoryPicker();
      } catch (err) {
        console.error('❌ 資料夾選擇取消或失敗:', err);
        return;
      }
    }
    for (const lang of langs) {
      // 動態查找語言欄位索引
      const idx = this.faqHeader.findIndex(h => h === lang);
      if (idx < 0) {
        console.warn(`⚠️ 找不到語言欄位: ${lang}`);
        continue;
      }
      // 依分類分組使用者選擇項目
      const grouped = {};
      selectedRows.forEach(rIdx => {
        const row = this.faqRows[rIdx];
        const category = row[1] || 'Uncategorized';
        const text = (row[idx] || '').replace(/\[.*?\]/g, '').trim();
        const url = row[25] || '#';
        if (!text) return;
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push({ text, url });
      });
      // 組裝 HTML 內容
      let content = '';
      Object.keys(grouped).forEach(category => {
        content += `<h2>${category}</h2>`;
        grouped[category].forEach(item => {
          content += `<p><a href=\"${item.url}\">${item.text}</a></p>`;
        });
      });
      const htmlDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${content}</body></html>`;
      // 寫入文件
      try {
        const fileName = `user_manual_${lang}.doc`;
        const fileHandle = await this.downloadDirHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(htmlDoc);
        await writable.close();
      } catch (err) {
        console.error(`❌ 寫入 ${lang} 檔案失敗:`, err);
      }
    }
    this.showSuccess('✅ 所有 FAQ 檔案已儲存至: ' + this.downloadDirHandle.name);
  }

  // 下載所有 FAQ
  downloadAllFaqs() {
    const langIdx = this.currentLang === 'zh' ? 29 : 28;
    let content = '';
    let currentCat = null;
    this.faqRows.forEach(row => {
      const category = row[1];
      const text = (row[langIdx] || '').replace(/\[.*?\]/g, '').trim();
      const url = row[25] || '';
      if (!category || !text) return;
      if (category !== currentCat) {
        content += `## ${category}\n`;
        currentCat = category;
      }
      content += `- ${text} (${url})\n`;
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `FAQ_${this.currentLang}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // 測試用：直接載入 FAQ 資料
  loadFAQData(rows) {
    this.faqRows = rows;
    this.renderFAQPage();
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

  bindConfirmButton() {
    const btn = document.getElementById('confirmFaqBtn');
    const downloadSection = document.getElementById('faqDownloadOptions');
    const langContainer = document.getElementById('languageCheckboxes');
    if (!btn || !downloadSection || !langContainer) return;
    btn.onclick = () => {
      // 清空並生成語言選項
      langContainer.innerHTML = '';
      this.supportedLangs.forEach(code => {
        const label = document.createElement('label');
        label.style.marginRight = '12px';
        const cb = document.createElement('input');
        cb.type = 'checkbox'; cb.value = code; cb.className = 'lang-cb';
        // 綁定 onchange 更新下載按鈕狀態
        cb.onchange = () => this.updateDownloadButtonState();
        label.append(cb, ` ${code}`);
        langContainer.appendChild(label);
      });
      // 加入全選
      const selectAll = document.createElement('label');
      selectAll.style.fontWeight = 'bold';
      const allCb = document.createElement('input');
      allCb.type = 'checkbox'; allCb.onclick = e => {
        const checked = e.target.checked;
        langContainer.querySelectorAll('input.lang-cb').forEach(cb => cb.checked = checked);
        this.updateDownloadButtonState();
      };
      selectAll.append(allCb, ' 全選');
      langContainer.prepend(selectAll);
      // 顯示下載區塊
      downloadSection.style.display = 'block';
      // 預設勾選所有 FAQ 項目
      document.querySelectorAll('.faq-item-checkbox').forEach(cb => cb.checked = true);
      this.bindDownloadButton();
      // 初始化按鈕狀態
      this.updateDownloadButtonState();
    };
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
