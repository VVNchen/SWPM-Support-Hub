// FW & SHA256 模組專用功能
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

  // 等待元素載入
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

  // 載入產品資料
  async loadProductData() {
    const productSelect = document.getElementById('fwProductSelect');
    if (!productSelect) return;

    productSelect.innerHTML = '<option value="">🔄 Loading product data...</option>';

    try {
      // 嘗試從 Excel 載入
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

  // 填充產品選單
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

  // 顯示載入錯誤
  showLoadingError() {
    const productSelect = document.getElementById('fwProductSelect');
    if (productSelect) {
      productSelect.innerHTML = '<option value="">❌ Loading failed - Check datasheet/Router_List.xlsx</option>';
    }
  }

  // 綁定事件
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
      fwPath.placeholder = 'Select a product to generate firmware path...';
      sha256Path.placeholder = 'SHA256 file path will be generated...';
      return;
    }

    const selectedOption = productSelect.options[productSelect.selectedIndex];
    const baseFwPath = selectedOption.dataset.fwPath;

    if (baseFwPath) {
      // 生成智能固件路徑
      const smartFwPath = this.buildSmartFirmwarePath(baseFwPath, selectedValue);
      fwPath.value = smartFwPath;
      fwPath.placeholder = `Smart path for ${selectedValue}`;

      // 生成 SHA256 路徑
      this.updateSha256Path();
    } else {
      fwPath.value = '';
      sha256Path.value = '';
      fwPath.placeholder = `No FW_Path found for ${selectedValue}`;
    }
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
      // 生成 SHA256 檔案路徑（同目錄下的 .sha256 檔案）
      const sha256FilePath = firmwarePath + '.sha256';
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

  // 更新生成按鈕狀態
  updateGenerateButton() {
    const generateBtn = document.getElementById('fwGenerateBtn');
    const productSelect = document.getElementById('fwProductSelect');
    const fwPath = document.getElementById('fwPath');

    if (!generateBtn) return;

    const hasProduct = productSelect?.value?.trim() !== '';
    const hasFwPath = fwPath?.value?.trim() !== '';

    if (hasProduct && hasFwPath) {
      generateBtn.disabled = false;
      generateBtn.style.backgroundColor = '#007bff';
      generateBtn.title = '生成下載連結';
    } else {
      generateBtn.disabled = true;
      generateBtn.style.backgroundColor = '#6c757d';
      generateBtn.title = '請選擇產品並確認固件路徑';
    }
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
      fwDownloadLink.href = fwDownloadUrl;
      fwDownloadLink.textContent = '點擊下載固件';
      fwDownloadLink.style.color = '#007bff';
    }

    if (sha256DownloadLink) {
      sha256DownloadLink.href = sha256DownloadUrl;
      sha256DownloadLink.textContent = '點擊下載SHA256';
      sha256DownloadLink.style.color = '#007bff';
    }

    this.showSuccess('下載連結已生成！');
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
      fwPath.placeholder = 'Select a product to generate firmware path...';
    }
    if (sha256Path) {
      sha256Path.value = '';
      sha256Path.placeholder = 'SHA256 file path will be generated...';
    }
    if (previewSection) previewSection.classList.add('hidden');

    if (fwDownloadLink) {
      fwDownloadLink.href = '#';
      fwDownloadLink.textContent = '點擊下載固件';
      fwDownloadLink.style.color = '#6c757d';
    }
    if (sha256DownloadLink) {
      sha256DownloadLink.href = '#';
      sha256DownloadLink.textContent = '點擊下載SHA256';
      sha256DownloadLink.style.color = '#6c757d';
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
      this.showError('請先生成下載連結');
      return;
    }

    navigator.clipboard.writeText(linkElement.href).then(() => {
      this.showSuccess('下載連結已複製到剪貼簿');
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

console.log('✅ FW & SHA256 功能模組已載入');
