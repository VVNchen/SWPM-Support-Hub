// PLM 模組專用功能
class PLMFunctions {
  constructor() {
    this.currentData = null;
    this.isProcessing = false;
  }

  // 初始化 PLM 模組
  async initialize() {
    console.log('🚀 初始化 PLM 模組...');

    // 等待 DOM 元素載入
    await this.waitForElement('#dataPreview');

    // 綁定事件
    this.bindEvents();

    console.log('✅ PLM 模組初始化完成');
  }

  // 等待 DOM 元素載入
  waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkElement = () => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        } else {
          setTimeout(checkElement, 100);
        }
      };

      checkElement();
    });
  }

  // 綁定事件
  bindEvents() {
    // 設置全域函數以便 HTML 調用
    this.setupGlobalFunctions();
  }

  // 上傳數據檔案
  uploadDataFile() {
    const fileInput = document.getElementById('dataFileInput');
    if (fileInput) {
      fileInput.click();
    }
  }

  // 處理檔案上傳
  handleDataUpload(event) {
    const file = event.target.files[0];
    if (file) {
      console.log('上傳檔案:', file.name);
      this.processUploadedFile(file);
    }
  }

  // 處理上傳的檔案
  async processUploadedFile(file) {
    const preview = document.getElementById('dataPreview');

    try {
      preview.innerHTML = '<p>🔄 正在處理檔案...</p>';

      // 模擬檔案處理
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.currentData = {
        fileName: file.name,
        size: file.size,
        type: file.type,
        uploadTime: new Date()
      };

      this.updateDataPreview();
      this.updateProcessButton();

    } catch (error) {
      preview.innerHTML = `<p style="color: red;">❌ 檔案處理失敗: ${error.message}</p>`;
    }
  }

  // 從伺服器同步
  async syncFromServer() {
    const preview = document.getElementById('dataPreview');

    try {
      preview.innerHTML = '<p>🔄 正在從伺服器同步...</p>';

      // 模擬伺服器同步
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.currentData = {
        source: 'Server',
        records: Math.floor(Math.random() * 1000) + 100,
        lastSync: new Date()
      };

      this.updateDataPreview();
      this.updateProcessButton();

    } catch (error) {
      preview.innerHTML = `<p style="color: red;">❌ 同步失敗: ${error.message}</p>`;
    }
  }

  // 匯出數據
  exportData() {
    if (!this.currentData) {
      alert('❌ 沒有可匯出的數據');
      return;
    }

    // 模擬匯出
    const exportData = JSON.stringify(this.currentData, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `plm_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    alert('✅ 數據匯出成功！');
  }

  // 更新數據預覽
  updateDataPreview() {
    const preview = document.getElementById('dataPreview');

    if (this.currentData) {
      let content = '<div class="data-summary">';
      content += '<h3>📋 數據摘要</h3>';

      Object.entries(this.currentData).forEach(([key, value]) => {
        content += `<p><strong>${key}:</strong> ${value}</p>`;
      });

      content += '</div>';
      preview.innerHTML = content;
    }
  }

  // 更新處理按鈕狀態
  updateProcessButton() {
    const processBtn = document.getElementById('processBtn');
    if (processBtn) {
      processBtn.disabled = !this.currentData || this.isProcessing;
    }
  }

  // 處理數據
  async processData() {
    if (!this.currentData) {
      alert('❌ 沒有可處理的數據');
      return;
    }

    this.isProcessing = true;
    this.updateProcessButton();

    try {
      // 模擬數據處理
      await new Promise(resolve => setTimeout(resolve, 3000));

      alert('✅ 數據處理完成！');
    } catch (error) {
      alert(`❌ 處理失敗: ${error.message}`);
    } finally {
      this.isProcessing = false;
      this.updateProcessButton();
    }
  }

  // 驗證數據
  validateData() {
    if (!this.currentData) {
      alert('❌ 沒有可驗證的數據');
      return;
    }

    // 模擬驗證
    const isValid = Math.random() > 0.2; // 80% 機率驗證通過

    if (isValid) {
      alert('✅ 數據驗證通過！');
    } else {
      alert('⚠️ 數據驗證失敗，請檢查數據格式');
    }
  }

  // 清除數據
  clearData() {
    if (confirm('確定要清除所有數據嗎？')) {
      this.currentData = null;
      const preview = document.getElementById('dataPreview');
      if (preview) {
        preview.innerHTML = '<p>等待數據載入...</p>';
      }
      this.updateProcessButton();

      // 清除檔案輸入
      const fileInput = document.getElementById('dataFileInput');
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }

  // 設置全域函數
  setupGlobalFunctions() {
    // 讓 HTML 中的 onclick 可以調用
    window.uploadDataFile = () => this.uploadDataFile();
    window.handleDataUpload = (event) => this.handleDataUpload(event);
    window.syncFromServer = () => this.syncFromServer();
    window.exportData = () => this.exportData();
    window.processData = () => this.processData();
    window.validateData = () => this.validateData();
    window.clearData = () => this.clearData();
  }
}

// 建立全域實例
window.plmFunctions = new PLMFunctions();
