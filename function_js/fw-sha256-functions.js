class FwSha256Functions {
  constructor() {
    this.selectedProduct = null;
    this.routerList = [];
    this.baseServerUrl = 'http://your-file-server.com'; // 請修改為實際的檔案伺服器位址
  }

  // 初始化模組
  async initialize() {
    console.log('🚀 初始化 FW & SHA256 模組...');

    try {
      // 等待 DOM 元素載入
      await this.waitForElement('#fwProductSelect');
      console.log('✅ DOM 元素載入完成');

      // 載入產品資料
      await this.loadProductData();
      console.log('✅ 產品資料載入完成');

      // 綁定事件
      this.bindEvents();
      console.log('✅ 事件綁定完成');

      // 初始化按鈕狀態
      this.updateGenerateButton();
      console.log('✅ 按鈕狀態初始化完成');

      console.log('✅ FW & SHA256 模組初始化完成');

    } catch (error) {
      console.error('❌ FW & SHA256 模組初始化失敗:', error);
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

  async loadProductData() {
    const productSelect = document.getElementById('fwProductSelect');
    if (!productSelect) return;

    productSelect.innerHTML = '<option value="">🔄 Loading product data...</option>';

    try {
      const response = await fetch('datasheet/Router_List.xlsx');
      if (!response.ok) {
        throw new Error(`Excel 檔案載入失敗: HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      this.routerList = jsonData;
      this.populateProductSelect(jsonData);

    } catch (error) {
      console.warn('⚠️ Excel 載入失敗，嘗試 JSON 備用:', error);
      try {
        const response = await fetch('router-list.json');
        const jsonData = await response.json();
        this.routerList = jsonData;
        this.populateProductSelect(jsonData);
      } catch (jsonError) {
        console.error('❌ JSON 也載入失敗:', jsonError);
        this.showLoadingError();
      }
    }
  }

  populateProductSelect(products) {
    const productSelect = document.getElementById('fwProductSelect');
    if (!productSelect) return;

    productSelect.innerHTML = '<option value="">Please select a product...</option>';

    products.forEach(product => {
      if (product.Model) {
        const option = document.createElement('option');
        option.value = product.Model;
        option.textContent = product.Model;
        option.dataset.fwPath = product.FW_Path || '';
        productSelect.appendChild(option);
      }
    });

    console.log(`✅ 載入了 ${products.length} 個產品到選單中`);
  }

  showLoadingError() {
    const productSelect = document.getElementById('fwProductSelect');
    if (productSelect) {
      productSelect.innerHTML = '<option value="">❌ Loading failed - Check datasheet/Router_List.xlsx</option>';
    }
  }

  bindEvents() {
    const productSelect = document.getElementById('fwProductSelect');
    const fwPath = document.getElementById('fwPath');

    if (productSelect) {
      productSelect.onchange = () => {
        this.updateFirmwarePaths();
        this.updatePreview();
        this.updateGenerateButton();
      };
    }

    if (fwPath) {
      fwPath.oninput = () => {
        this.updateSha256Path();
        this.updatePreview();
        this.updateGenerateButton();
      };
    }
  }

  // 更新固件路徑
  updateFirmwarePaths() {
    const productSelect = document.getElementById('fwProductSelect');
    const fwPath = document.getElementById('fwPath');
    const sha256Path = document.getElementById('sha256Path');

    if (!productSelect || !fwPath || !sha256Path) return;

    const selectedValue = productSelect.value;
    if (!selectedValue) {
      fwPath.value = '';
      sha256Path.value = '';
      return;
    }

    const selectedOption = productSelect.options[productSelect.selectedIndex];
    const baseFwPath = selectedOption.dataset.fwPath;

    if (baseFwPath) {
      // 生成智能固件路徑
      const smartFwPath = this.buildSmartFirmwarePath(baseFwPath, selectedValue);
      fwPath.value = smartFwPath;

      // 生成 SHA256 路徑
      this.updateSha256Path();
    } else {
      fwPath.value = '';
      sha256Path.value = '';
    }

    // 更新下載連結狀態
    this.updateDownloadLinksState();
  }

  // 建立智能固件路徑
  buildSmartFirmwarePath(basePath, productModel) {
    if (!basePath || !productModel) return '';

    let cleanPath = basePath.trim();
    if (!cleanPath.endsWith('\\')) {
      cleanPath += '\\';
    }

    // 轉換路徑格式
    if (basePath.includes('New-Public\\FW\\')) {
      cleanPath = basePath.replace('New-Public\\FW\\', 'New-Public\\Software2\\ASUSWRT\\Firmware_SQ\\');
    }

    // 生成模擬版本資料夾
    const versionFolder = this.generateVersionFolder();
    const firmwareFileName = this.generateFirmwareFileName(productModel);

    return `${cleanPath}${productModel}\\${versionFolder}\\${firmwareFileName}`;
  }

  // 生成版本資料夾
  generateVersionFolder() {
    const buildNumber = Math.floor(Math.random() * 1000) + 34000;
    const gitHash = this.generateRandomHash(7);
    const sdkHash = this.generateRandomHash(6);
    return `asuswrt-router-3006-102-rc2_${buildNumber}-g${gitHash}__SDK-504L02-${sdkHash}`;
  }

  // 生成固件檔案名稱
  generateFirmwareFileName(productModel) {
    const buildNumber = Math.floor(Math.random() * 1000) + 34000;
    const gitHash1 = this.generateRandomHash(7);
    const gitHash2 = this.generateRandomHash(6);
    return `${productModel}_3.0.0.6_102_${buildNumber}-g${gitHash1}_404-g${gitHash2}_nand_squashfs.pkgtb`;
  }

  // 生成隨機 hash
  generateRandomHash(length) {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 更新 SHA256 路徑
  updateSha256Path() {
    const fwPath = document.getElementById('fwPath');
    const sha256Path = document.getElementById('sha256Path');

    if (!fwPath || !sha256Path) return;

    const firmwarePath = fwPath.value;
    if (firmwarePath) {
      // 找到最後一個點的位置，將副檔名替換成 .sha256
      const lastDotIndex = firmwarePath.lastIndexOf('.');
      let sha256FilePath;

      if (lastDotIndex !== -1) {
        // 如果找到副檔名，替換成 .sha256
        sha256FilePath = firmwarePath.substring(0, lastDotIndex) + '.sha256';
      } else {
        // 如果沒有副檔名，直接加上 .sha256
        sha256FilePath = firmwarePath + '.sha256';
      }

      sha256Path.value = sha256FilePath;
    } else {
      sha256Path.value = '';
    }
  }

  // 更新預覽
  updatePreview() {
    const productSelect = document.getElementById('fwProductSelect');
    const fwPath = document.getElementById('fwPath');
    const previewSection = document.getElementById('fwPreviewSection');
    const previewProduct = document.getElementById('fwPreviewProduct');
    const previewFilename = document.getElementById('fwPreviewFilename');
    const previewSha256 = document.getElementById('fwPreviewSha256');

    if (!previewSection) return;

    const selectedProduct = productSelect?.value || '';
    const firmwarePath = fwPath?.value || '';

    if (selectedProduct && firmwarePath) {
      const filename = firmwarePath.split('\\').pop() || firmwarePath.split('/').pop();
      const sha256Filename = filename + '.sha256';

      if (previewProduct) previewProduct.textContent = selectedProduct;
      if (previewFilename) previewFilename.textContent = filename;
      if (previewSha256) previewSha256.textContent = sha256Filename;

      previewSection.classList.remove('hidden');
    } else {
      previewSection.classList.add('hidden');
    }
  }

  // 更新下載連結狀態
  updateDownloadLinksState() {
    const fwPath = document.getElementById('fwPath');
    const fwDownloadLink = document.getElementById('fwDownloadLink');
    const sha256DownloadLink = document.getElementById('sha256DownloadLink');

    console.log('🔗 更新下載連結狀態...');

    if (!fwPath || !fwDownloadLink || !sha256DownloadLink) {
      console.log('❌ 找不到必要的元素');
      return;
    }

    const hasFwPath = fwPath.value.trim() !== '';
    console.log('📁 FW路徑狀態:', hasFwPath ? '有值' : '無值', fwPath.value);

    if (hasFwPath) {
      // 啟用下載連結
      fwDownloadLink.classList.remove('disabled');
      sha256DownloadLink.classList.remove('disabled');
      console.log('✅ 下載連結已啟用');
    } else {
      // 禁用下載連結
      fwDownloadLink.classList.add('disabled');
      sha256DownloadLink.classList.add('disabled');
      console.log('❌ 下載連結已禁用');
    }
  }

  // 更新生成按鈕狀態
  updateGenerateButton() {
    const generateBtn = document.getElementById('fwGenerateBtn');
    const productSelect = document.getElementById('fwProductSelect');
    const fwPath = document.getElementById('fwPath');

    console.log('🔄 更新生成按鈕狀態...');

    if (!generateBtn) return;

    const hasProduct = productSelect?.value?.trim() !== '';
    const hasFwPath = fwPath?.value?.trim() !== '';

    console.log('產品選擇:', hasProduct, '路徑填入:', hasFwPath);

    if (hasProduct && hasFwPath) {
      generateBtn.disabled = false;
      generateBtn.style.backgroundColor = '#007bff';
      generateBtn.title = 'Generate download links';
    } else {
      generateBtn.disabled = true;
      generateBtn.style.backgroundColor = '#6c757d';
      generateBtn.title = '請選擇產品並確認固件路徑';
    }

    // 更新下載連結狀態
    this.updateDownloadLinksState();
  }

  // 生成下載連結
  generateDownloadLinks() {
    const fwPath = document.getElementById('fwPath');
    const sha256Path = document.getElementById('sha256Path');
    const fwDownloadLink = document.getElementById('fwDownloadLink');
    const sha256DownloadLink = document.getElementById('sha256DownloadLink');

    if (!fwPath || !sha256Path) {
      this.showError('無法找到路徑輸入框');
      return;
    }

    const firmwarePath = fwPath.value.trim();
    const sha256FilePath = sha256Path.value.trim();

    if (!firmwarePath) {
      this.showError('請先選擇產品並確認固件路徑');
      return;
    }

    // 生成下載連結（這裡需要根據實際的檔案伺服器邏輯調整）
    const fwDownloadUrl = this.convertPathToDownloadUrl(firmwarePath);
    const sha256DownloadUrl = this.convertPathToDownloadUrl(sha256FilePath);

    if (fwDownloadLink) {
      fwDownloadLink.textContent = 'Click to download FW';
      fwDownloadLink.classList.remove('disabled');
    }

    if (sha256DownloadLink) {
      sha256DownloadLink.textContent = 'Click to download SHA256';
      sha256DownloadLink.classList.remove('disabled');
    }

    this.showSuccess('Download links generated successfully!');
  }

  // 下載固件檔案
  async downloadFirmware() {
    const fwPath = document.getElementById('fwPath');

    if (!fwPath || !fwPath.value.trim()) {
      this.showError('請先選擇產品並確認固件路徑');
      return;
    }

    const firmwarePath = fwPath.value.trim();
    const fileName = this.getFileNameFromPath(firmwarePath);

    try {
      // 使用 File System Access API (如果支援的話)
      if ('showSaveFilePicker' in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'Firmware files',
            accept: { 'application/octet-stream': ['.pkgtb', '.bin', '.fw'] }
          }]
        });

        this.showSuccess(`準備下載固件檔案到: ${fileHandle.name}`);
        // 這裡需要實際的檔案讀取和寫入邏輯
        this.performFileDownload(firmwarePath, fileHandle);
      } else {
        // 降級方案：創建下載連結
        this.createDownloadLink(firmwarePath, fileName);
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

  // 下載 SHA256 檔案
  async downloadSha256() {
    const sha256Path = document.getElementById('sha256Path');

    if (!sha256Path || !sha256Path.value.trim()) {
      this.showError('請先選擇產品並確認固件路徑');
      return;
    }

    const sha256FilePath = sha256Path.value.trim();
    const fileName = this.getFileNameFromPath(sha256FilePath);

    try {
      // 使用 File System Access API (如果支援的話)
      if ('showSaveFilePicker' in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'SHA256 files',
            accept: { 'text/plain': ['.sha256'] }
          }]
        });

        this.showSuccess(`準備下載 SHA256 檔案到: ${fileHandle.name}`);
        // 這裡需要實際的檔案讀取和寫入邏輯
        this.performFileDownload(sha256FilePath, fileHandle);
      } else {
        // 降級方案：創建下載連結
        this.createDownloadLink(sha256FilePath, fileName);
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

  // 從路徑中提取檔案名稱
  getFileNameFromPath(filePath) {
    const parts = filePath.split(/[\\\/]/);
    return parts[parts.length - 1];
  }

  // 執行檔案下載
  async performFileDownload(sourcePath, fileHandle) {
    try {
      // 這裡需要實際的檔案讀取邏輯
      // 由於瀏覽器無法直接存取本地檔案系統，這需要透過後端服務
      this.showError('需要後端服務支援才能執行實際的檔案下載');

      // 暫時的模擬實現
      const writable = await fileHandle.createWritable();
      const content = `模擬檔案內容 - 路徑: ${sourcePath}\n下載時間: ${new Date().toISOString()}`;
      await writable.write(content);
      await writable.close();

      this.showSuccess('檔案下載完成！');
    } catch (error) {
      console.error('檔案寫入失敗:', error);
      this.showError('檔案寫入失敗: ' + error.message);
    }
  }

  // 創建下載連結 (降級方案)
  createDownloadLink(filePath, fileName) {
    // 對於不支援 File System Access API 的瀏覽器
    const content = `檔案路徑: ${filePath}\n這是一個模擬的下載檔案\n下載時間: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showSuccess('檔案下載已開始（模擬）');
  }

  // 轉換檔案路徑為下載 URL
  convertPathToDownloadUrl(filePath) {
    // 這裡需要根據實際的檔案伺服器邏輯來實現
    // 暫時返回一個示例 URL
    const encodedPath = encodeURIComponent(filePath);
    return `${this.baseServerUrl}/download?file=${encodedPath}`;
  }

  // 重設表單
  resetForm() {
    const productSelect = document.getElementById('fwProductSelect');
    const fwPath = document.getElementById('fwPath');
    const sha256Path = document.getElementById('sha256Path');
    const previewSection = document.getElementById('fwPreviewSection');
    const fwDownloadLink = document.getElementById('fwDownloadLink');
    const sha256DownloadLink = document.getElementById('sha256DownloadLink');

    if (productSelect) productSelect.value = '';
    if (fwPath) {
      fwPath.value = '';
    }
    if (sha256Path) {
      sha256Path.value = '';
    }
    if (previewSection) previewSection.classList.add('hidden');

    if (fwDownloadLink) {
      fwDownloadLink.textContent = 'Click to download FW';
      fwDownloadLink.classList.add('disabled');
    }
    if (sha256DownloadLink) {
      sha256DownloadLink.textContent = 'Click to download SHA256';
      sha256DownloadLink.classList.add('disabled');
    }

    this.updateGenerateButton();
    console.log('🔄 FW & SHA256 表單已重設');
  }

  // 切換編輯模式
  toggleEditMode() {
    const fwPath = document.getElementById('fwPath');
    const editBtn = document.getElementById('fwEditBtn');

    if (!fwPath || !editBtn) return;

    if (fwPath.readOnly) {
      fwPath.readOnly = false;
      fwPath.style.backgroundColor = '#fff';
      fwPath.focus();
      editBtn.innerHTML = '✅ Confirmed';
      editBtn.classList.add('confirmed');
    } else {
      fwPath.readOnly = true;
      fwPath.style.backgroundColor = '#f8f9fa';
      editBtn.innerHTML = '✏️ Edit';
      editBtn.classList.remove('confirmed');
      this.updateSha256Path();
      this.updatePreview();
      this.updateDownloadLinksState();
    }
  }

  // 複製到剪貼簿
  async copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const text = element.value || element.textContent;
    if (!text.trim()) {
      this.showError('無內容可複製');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      this.showSuccess('已複製到剪貼簿');
    } catch (err) {
      console.error('複製失敗:', err);
      this.showError('複製失敗');
    }
  }

  // 複製下載連結
  copyDownloadLink(type) {
    const linkElement = type === 'fw' ?
      document.getElementById('fwDownloadLink') :
      document.getElementById('sha256DownloadLink');

    if (!linkElement || linkElement.href === '#') {
      this.showError('Please generate download links first');
      return;
    }

    navigator.clipboard.writeText(linkElement.href).then(() => {
      this.showSuccess('Download link copied to clipboard');
    }).catch(() => {
      this.showError('複製失敗');
    });
  }

  // 複製預覽文字
  copyPreviewText(elementId) {
    this.copyToClipboard(elementId);
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
window.fwSha256Functions = new FwSha256Functions();

// 設置全域函數
window.toggleFwEditMode = () => window.fwSha256Functions.toggleEditMode();
window.generateDownloadLinks = () => window.fwSha256Functions.generateDownloadLinks();
window.resetFwForm = () => window.fwSha256Functions.resetForm();
window.copyDownloadLink = (type) => window.fwSha256Functions.copyDownloadLink(type);
window.copyPreviewText = (elementId) => window.fwSha256Functions.copyPreviewText(elementId);
window.downloadFirmware = () => window.fwSha256Functions.downloadFirmware();
window.downloadSha256 = () => window.fwSha256Functions.downloadSha256();

console.log('✅ FW & SHA256 功能模組已載入');
