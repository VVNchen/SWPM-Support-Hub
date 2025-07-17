// Redmine 模組專用功能
class RedmineFunctions {
  constructor() {
    this.selectedDut = null;
    this.firmwareConfirmed = false;
    this.routerList = [];
  }

  // 初始化 Redmine 模組
  async initialize() {
    console.log('🚀 初始化 Redmine 模組...');

    try {
      console.log('1️⃣ 開始等待 DOM 元素載入...');
      // 等待 DOM 元素載入
      await this.waitForElement('#productSelect');
      console.log('✅ DOM 元素載入完成');

      console.log('2️⃣ 開始載入產品資料...');
      // 載入產品資料
      await this.loadProductData();
      console.log('✅ 產品資料載入完成');

      console.log('3️⃣ 開始綁定事件...');
      // 綁定事件
      this.bindEvents();
      console.log('✅ 事件綁定完成');

      console.log('4️⃣ 開始初始化按鈕狀態...');
      // 初始化按鈕狀態
      this.updateCreateButton();
      console.log('✅ 按鈕狀態初始化完成');

      console.log('✅ Redmine 模組初始化完成');

      // 在控制台顯示可用的測試函數
      console.log('🧪 可用的測試函數:');
      console.log('  - testButtonState(): 測試按鈕狀態');
      console.log('  - updateCreateButton(): 手動更新按鈕');
      console.log('  - updatePreview(): 手動更新預覽');

    } catch (error) {
      console.error('❌ Redmine 模組初始化失敗:', error);
      console.error('錯誤詳情:', error.stack);

      // 顯示錯誤信息給用戶
      const errorMessage = `
        <div style="padding: 20px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; color: #721c24;">
          <h3>❌ 初始化失敗</h3>
          <p><strong>錯誤:</strong> ${error.message}</p>
          <p><strong>解決方案:</strong></p>
          <ul>
            <li>檢查網路連線</li>
            <li>確認 datasheet/Router_List.xlsx 檔案存在</li>
            <li>重新載入頁面</li>
          </ul>
        </div>
      `;

      const productSelect = document.getElementById('productSelect');
      if (productSelect) {
        productSelect.innerHTML = '<option value="">❌ 載入失敗</option>';
        const container = productSelect.closest('.form-section');
        if (container) {
          container.insertAdjacentHTML('afterend', errorMessage);
        }
      }
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
    console.log('📥 開始載入產品資料...');

    const productSelect = document.getElementById('productSelect');
    if (!productSelect) {
      console.error('❌ 找不到 productSelect 元素!');
      return;
    }

    // 設置載入中狀態
    productSelect.innerHTML = '<option value="">🔄 Loading product data...</option>';

    try {
      console.log('📊 嘗試從 Excel 載入產品資料...');
      // 優先嘗試載入 Excel
      const products = await this.loadProductsFromExcel();
      console.log('✅ Excel 載入成功，產品數量:', products.length);
      this.populateProductSelect(products, 'Excel');
    } catch (error) {
      console.warn('⚠️ Excel 載入失敗，嘗試載入 JSON 備用資料:', error.message);

      try {
        console.log('📄 嘗試從 JSON 載入產品資料...');
        // 嘗試載入 JSON 備用資料
        const products = await this.loadProductsFromJSON();
        console.log('✅ JSON 載入成功，產品數量:', products.length);
        this.populateProductSelect(products, 'JSON 備用檔案');
      } catch (jsonError) {
        console.error('❌ JSON 也載入失敗:', jsonError.message);
        console.error('❌ 所有資料來源都失敗，顯示錯誤訊息');
        this.showLoadingError();
      }
    }
  }

  // 從 Excel 載入產品
  async loadProductsFromExcel() {
    console.log('📊 嘗試從 Excel 載入產品...');

    // 檢查 SheetJS 是否已載入
    if (typeof XLSX === 'undefined') {
      console.error('❌ SheetJS 庫未載入！');
      throw new Error('SheetJS 庫未載入，請檢查網路連線');
    }

    console.log('✅ SheetJS 庫已準備好');

    try {
      const response = await fetch('datasheet/Router_List.xlsx');
      if (!response.ok) {
        throw new Error(`Excel 檔案載入失敗: HTTP ${response.status}`);
      }

      console.log('📥 正在讀取 Excel 檔案...');
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData || jsonData.length === 0) {
        throw new Error('Excel 檔案為空或格式錯誤');
      }

      console.log(`✅ 從 Excel 成功載入 ${jsonData.length} 個產品`);
      return jsonData;
    } catch (error) {
      console.error('❌ Excel 處理過程出錯:', error);
      throw error;
    }
  }

  // 從 JSON 載入產品（備用方案）
  async loadProductsFromJSON() {
    console.log('📄 嘗試從 JSON 備用檔案載入產品...');

    // 嘗試現有的 router-list.json
    let response;
    try {
      response = await fetch('router-list.json');
    } catch (error) {
      // 如果 router-list.json 不存在，嘗試備用檔案
      console.log('📄 嘗試載入備用 JSON 檔案...');
      response = await fetch('router-list-backup.json');
    }

    if (!response.ok) {
      throw new Error(`JSON 檔案載入失敗: HTTP ${response.status}`);
    }

    const jsonData = await response.json();

    if (!jsonData || jsonData.length === 0) {
      throw new Error('JSON 檔案為空');
    }

    console.log(`✅ 從 JSON 成功載入 ${jsonData.length} 個產品`);
    return jsonData;
  }

  // 填充產品選單
  populateProductSelect(products, source) {
    const productSelect = document.getElementById('productSelect');
    if (!productSelect) return;

    // 儲存產品列表
    this.routerList = products;

    // 清空選單
    productSelect.innerHTML = '<option value="">Please select a product...</option>';

    // 填充產品
    products.forEach(product => {
      if (product.Model) {
        const option = document.createElement('option');
        option.value = product.Model;
        option.textContent = product.Model;
        option.dataset.aplmId = product.APLM_ID || '';
        option.dataset.fwPath = product.FW_Path || '';
        option.dataset.redmineProject = product.Redmine_Project || '';
        productSelect.appendChild(option);

        // 調試信息
        console.log(`產品: ${product.Model}, FW_Path: ${product.FW_Path}, Redmine_Project: ${product.Redmine_Project}`);
      }
    });

    console.log(`✅ 從 ${source} 載入了 ${products.length} 個產品到選單中`);
  }

  // 顯示載入錯誤
  showLoadingError() {
    const productSelect = document.getElementById('productSelect');
    if (productSelect) {
      productSelect.innerHTML = `
        <option value="">❌ Loading failed</option>
        <option value="" disabled>Please check datasheet/Router_List.xlsx or router-list.json</option>
      `;
    }
  }

  // 綁定事件
  bindEvents() {
    const productSelect = document.getElementById('productSelect');
    const firmwarePath = document.getElementById('firmwarePath');
    const redmineTagSelect = document.getElementById('redmineTagSelect');

    if (productSelect && firmwarePath) {
      productSelect.onchange = () => {
        console.log('📱 Product 選擇改變');
        this.updateFirmwarePath();
        this.updateCreateButton(); // 立即更新按鈕狀態
      };
    }

    // 監聽固件路徑輸入變更
    if (firmwarePath) {
      firmwarePath.oninput = () => {
        this.updatePreview();
        this.updateCreateButton();
      };

      firmwarePath.onchange = () => {
        this.updatePreview();
        this.updateCreateButton();
      };
    }

    // 監聽標籤選擇變更
    if (redmineTagSelect) {
      redmineTagSelect.onchange = () => {
        console.log('🏷️ Tag 選擇改變');
        this.updatePreview();
        this.updateCreateButton(); // 立即更新按鈕狀態
      };
    }

    console.log('✅ 事件綁定完成');
  }

  updateFirmwarePath() {
    const productSelect = document.getElementById('productSelect');
    const firmwarePath = document.getElementById('firmwarePath');

    if (!productSelect || !firmwarePath) return;

    const selectedValue = productSelect.value;
    if (!selectedValue) {
      firmwarePath.value = '';
      this.updatePreview();
      return;
    }

    const selectedOption = productSelect.options[productSelect.selectedIndex];
    const fwPath = selectedOption.dataset.fwPath;

    if (fwPath) {
      // 產生智能路徑
      const smartPath = this.buildSmartFirmwarePath(fwPath, selectedValue);
      firmwarePath.value = smartPath;
    } else {
      firmwarePath.value = '';
    }

    this.updatePreview();
  }

  // 建立智能固件路徑
  buildSmartFirmwarePath(basePath, productModel) {
    if (!basePath || !productModel) return '';

    // 確保路徑以 \\ 結尾
    let cleanPath = basePath.trim();
    if (!cleanPath.endsWith('\\')) {
      cleanPath += '\\';
    }

    // 生成完整的固件檔案路徑
    const fullFirmwarePath = this.generateFullFirmwarePath(cleanPath, productModel);
    return fullFirmwarePath;
  }

  // 生成完整的固件檔案路徑 - 模擬找到最新檔案
  generateFullFirmwarePath(basePath, productModel) {
    // 轉換基礎路徑格式
    let firmwareBasePath = basePath;

    // 如果是舊格式，轉換為新格式
    if (basePath.includes('New-Public\\FW\\')) {
      firmwareBasePath = basePath.replace('New-Public\\FW\\', 'New-Public\\Software2\\ASUSWRT\\Firmware_SQ\\');
    }

    // 模擬找到最新的固件檔案
    const latestFirmware = this.findLatestFirmwareFile(firmwareBasePath, productModel);

    console.log(`🔧 找到最新固件: ${latestFirmware}`);
    return latestFirmware;
  }

  // 模擬在指定路徑下找到最新的固件檔案
  findLatestFirmwareFile(basePath, productModel) {
    // 確保路徑格式正確
    let cleanPath = basePath.trim();
    if (!cleanPath.endsWith('\\')) {
      cleanPath += '\\';
    }

    // 模擬最新的版本資料夾 (類似實際的 asuswrt-router 版本)
    const versionFolder = this.generateLatestVersionFolder();

    // 模擬最新的固件檔案名稱
    const firmwareFileName = this.generateLatestFirmwareFileName(productModel);

    // 組合完整路徑
    const fullPath = `${cleanPath}${productModel}\\${versionFolder}\\${firmwareFileName}`;

    return fullPath;
  }

  // 生成最新版本資料夾名稱 (模擬實際的版本號)
  generateLatestVersionFolder() {
    // 模擬類似 "asuswrt-router-3006-102-rc2_34713-g0d793c1__SDK-504L02-6f233" 的格式
    const buildNumber = Math.floor(Math.random() * 1000) + 34000; // 34xxx
    const gitHash = this.generateRandomHash(7);
    const sdkHash = this.generateRandomHash(6);

    return `asuswrt-router-3006-102-rc2_${buildNumber}-g${gitHash}__SDK-504L02-${sdkHash}`;
  }

  // 生成最新固件檔案名稱
  generateLatestFirmwareFileName(productModel) {
    // 模擬類似 "GT-AX11000_PRO_3.0.0.6_102_34743-g08ec513_404-ge7bfb_nand_squashfs.pkgtb" 的格式
    const buildNumber = Math.floor(Math.random() * 1000) + 34000;
    const gitHash1 = this.generateRandomHash(7);
    const gitHash2 = this.generateRandomHash(6);

    return `${productModel}_3.0.0.6_102_${buildNumber}-g${gitHash1}_404-g${gitHash2}_nand_squashfs.pkgtb`;
  }

  // 生成隨機 Git hash (模擬)
  generateRandomHash(length) {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 更新預覽
  updatePreview() {
    console.log('🔄 updatePreview() 被調用');

    const productSelect = document.getElementById('productSelect');
    const firmwarePath = document.getElementById('firmwarePath');
    const redmineTagSelect = document.getElementById('redmineTagSelect');
    const previewSection = document.getElementById('previewSection');

    if (!previewSection) {
      console.warn('⚠️ previewSection 元素不存在');
      return;
    }

    const selectedProduct = productSelect?.value || '';
    const firmwareValue = firmwarePath?.value || '';
    const selectedTag = redmineTagSelect?.value || '';

    console.log('🔍 目前值:', {
      selectedProduct,
      firmwareValue,
      selectedTag
    });

    // 取得 Redmine Project
    let redmineProject = '';
    if (selectedProduct && productSelect) {
      const selectedOption = productSelect.options[productSelect.selectedIndex];
      redmineProject = selectedOption.dataset.redmineProject || '';
    }

    // 取得標籤的顯示文字
    let selectedTagText = '';
    if (selectedTag && redmineTagSelect) {
      const selectedTagOption = redmineTagSelect.options[redmineTagSelect.selectedIndex];
      selectedTagText = selectedTagOption.textContent || selectedTag;
    }

    // 更新預覽內容
    const previewRedmineProject = document.getElementById('previewRedmineProject');
    const previewFirmware = document.getElementById('previewFirmware');
    const previewTag = document.getElementById('previewTag');
    const previewSubject = document.getElementById('previewSubject');

    if (previewRedmineProject) previewRedmineProject.textContent = redmineProject || '-';
    if (previewFirmware) previewFirmware.textContent = firmwareValue ? `Firmware: ${firmwareValue}` : 'Firmware: -';
    if (previewTag) previewTag.textContent = selectedTagText || '-';

    // 生成並顯示主旨
    if (previewSubject) {
      const subject = this.generateSubject(selectedProduct, firmwareValue);
      console.log('📝 生成的主旨:', subject);
      previewSubject.textContent = subject;
    } else {
      console.warn('⚠️ previewSubject 元素不存在');
    }

    // 顯示/隱藏預覽區塊
    const hasContent = selectedProduct || firmwareValue || selectedTag;
    if (hasContent) {
      previewSection.classList.remove('hidden');
    } else {
      previewSection.classList.add('hidden');
    }

    console.log('✅ updatePreview() 完成');
  }

  // 生成主旨的函數
  generateSubject(productModel, firmwarePath) {
    if (!productModel || !firmwarePath) {
      return '-';
    }

    // 從固件路徑中提取檔案名稱
    const fileName = firmwarePath.split('\\').pop() || firmwarePath.split('/').pop();

    // 移除副檔名，取得板號部分
    const boardVersion = fileName.replace(/\.(w|trx|pkgtb)$/, '');

    // 格式: [{Product_ID}]{firmware路徑的板號} test
    return `[${productModel}] ${boardVersion} test`;
  }

  // 更新建立按鈕狀態
  updateCreateButton() {
    const createBtn = document.getElementById('createBtn');
    const productSelect = document.getElementById('productSelect');
    const firmwarePath = document.getElementById('firmwarePath');
    const redmineTagSelect = document.getElementById('redmineTagSelect');

    if (!createBtn) {
      console.warn('⚠️ 找不到 createBtn 元素');
      return;
    }

    // 檢查必填欄位
    const hasProduct = productSelect?.value?.trim() !== '';
    const hasFirmware = firmwarePath?.value?.trim() !== '';
    const hasTag = redmineTagSelect?.value?.trim() !== '';

    console.log('🔍 按鈕狀態檢查:', {
      hasProduct,
      hasFirmware,
      hasTag,
      productValue: productSelect?.value,
      firmwareValue: firmwarePath?.value,
      tagValue: redmineTagSelect?.value
    });

    // 更新按鈕狀態
    const allFieldsFilled = hasProduct && hasFirmware && hasTag;

    if (allFieldsFilled) {
      createBtn.disabled = false;
      createBtn.style.backgroundColor = '#007bff';
      createBtn.style.cursor = 'pointer';
      createBtn.style.opacity = '1';
      console.log('✅ 按鈕已啟用');
    } else {
      createBtn.disabled = true;
      createBtn.style.backgroundColor = '#6c757d';
      createBtn.style.cursor = 'not-allowed';
      createBtn.style.opacity = '0.6';
      console.log('❌ 按鈕已停用');
    }

    // 更新按鈕文字提示
    const missingFields = [];
    if (!hasProduct) missingFields.push('產品');
    if (!hasFirmware) missingFields.push('固件路徑');
    if (!hasTag) missingFields.push('標籤');

    if (missingFields.length > 0) {
      createBtn.title = `請填寫: ${missingFields.join(', ')}`;
    } else {
      createBtn.title = '建立 Redmine 工單';
    }
  }

  // 建立 Redmine 工單
  createRedmineTicket() {
    const productSelect = document.getElementById('productSelect');
    const firmwarePath = document.getElementById('firmwarePath');
    const redmineTagSelect = document.getElementById('redmineTagSelect');

    if (!productSelect || !firmwarePath || !redmineTagSelect) {
      alert('❌ 找不到必要的表單元素');
      return;
    }

    const productModel = productSelect.value;
    const firmwareFullPath = firmwarePath.value;
    const selectedTag = redmineTagSelect.value;

    if (!productModel || !firmwareFullPath || !selectedTag) {
      alert('❌ 請填寫所有必填欄位');
      return;
    }

    console.log('🎫 準備建立 Redmine 工單:', {
      productModel,
      firmwareFullPath,
      selectedTag
    });

    // 根據標籤類型決定處理方式
    if (selectedTag === 'factory-regression') {
      this.createFactoryRegressionTicket(productModel, firmwareFullPath);
    } else {
      this.createGenericTicket(productModel, firmwareFullPath, selectedTag);
    }
  }

  // 建立 Factory Regression 工單
  createFactoryRegressionTicket(productModel, firmwareFullPath) {
    const firmwareFileName = firmwareFullPath.split('\\').pop() || firmwareFullPath;

    const ticketData = {
      project: this.getRedmineProject(productModel),
      tracker: 'Test Request',
      subject: `[${productModel}]${firmwareFileName}`,
      description: `Factory Regression test for ${productModel}\n\nFirmware: ${firmwareFullPath}`,
      assignee: '',
      status: 'New',
      priority: 'Normal'
    };

    this.openRedmineWithData(productModel, firmwareFullPath, 'factory-regression');
  }

  // 建立一般工單
  createGenericTicket(productModel, firmwareFullPath, tag) {
    const firmwareFileName = firmwareFullPath.split('\\').pop() || firmwareFullPath;

    const ticketData = {
      project: this.getRedmineProject(productModel),
      tracker: this.mapTagToTracker(tag),
      subject: `[${productModel}] ${firmwareFileName}`,
      description: `${tag} for ${productModel}\n\nFirmware: ${firmwareFullPath}`,
      assignee: '',
      status: 'New',
      priority: 'Normal'
    };

    this.openRedmineWithData(productModel, firmwareFullPath, tag);
  }

  // 取得 Redmine 專案
  getRedmineProject(productModel) {
    // 從產品列表中查找對應的 Redmine_Project
    const product = this.routerList.find(p => p.Model === productModel);
    return product?.Redmine_Project || 'Default Project';
  }

  // 標籤對應追蹤標籤
  mapTagToTracker(tag) {
    const tagMapping = {
      'test-request': 'Test Request',
      'build-request': 'Build Request',
      'signature-test-request': 'Signature Test Request',
      'factory-regression': 'Test Request',
      'standard-regression': 'Test Request',
      'repeater-regression': 'Test Request',
      'batch-regression': 'Test Request',
      'expert-wifi-regression': 'Test Request'
    };
    return tagMapping[tag] || 'Test Request';
  }

  // 開啟 Redmine 並傳遞資料
  openRedmineWithData(productModel, firmwareFullPath, selectedTag) {
    const redmineUrl = 'https://redmine.asus.com.tw/issues/new';

    // 開啟新視窗
    const redmineWindow = window.open(redmineUrl, '_blank', 'width=1200,height=800,scrollbars=yes');

    if (!redmineWindow) {
      alert('❌ 無法開啟 Redmine 視窗，請檢查瀏覽器的彈出視窗設定');
      return;
    }

    alert('✅ Redmine 頁面已開啟！\n\n請在新視窗中手動填寫工單資訊，或使用自動填寫解決方案。');
  }

  // 重設表單
  resetForm() {
    const productSelect = document.getElementById('productSelect');
    const firmwarePath = document.getElementById('firmwarePath');
    const redmineTagSelect = document.getElementById('redmineTagSelect');
    const previewSection = document.getElementById('previewSection');

    if (productSelect) productSelect.value = '';
    if (firmwarePath) {
      firmwarePath.value = '';
    }
    if (redmineTagSelect) redmineTagSelect.value = '';
    if (previewSection) previewSection.classList.add('hidden');

    this.selectedDut = null;
    this.firmwareConfirmed = false;
    this.updateCreateButton();

    console.log('🔄 表單已重設');
  }

  // 取消操作
  cancelOperation() {
    this.resetForm();
    console.log('❌ 操作已取消');
  }

  // 設置全域函數
  setupGlobalFunctions() {
    // 將常用函數設為全域可用
    window.updateFirmwarePath = () => {
      console.log('🔧 updateFirmwarePath 被調用');
      this.updateFirmwarePath();
    };
    window.updatePreview = () => {
      console.log('🔄 全域 updatePreview 被調用');
      this.updatePreview();
    };
    window.updateCreateButton = () => this.updateCreateButton();
    window.createRedmineTicket = () => this.createRedmineTicket();
    window.resetForm = () => this.resetForm();
    window.cancelOperation = () => this.cancelOperation();
    window.toggleEditMode = () => this.toggleEditMode();

    // Copy to clipboard 功能
    window.copyToClipboard = (elementId) => this.copyToClipboard(elementId);

    // 測試函數
    window.testButtonState = () => {
      console.log('🧪 測試按鈕狀態');
      this.updateCreateButton();
    };

    // 測試全域函數是否正常
    window.testGlobalFunction = () => {
      console.log('🧪 全域函數測試成功');
      this.updatePreview();
    };

    console.log('✅ 全域函數已設置');
  }

  // 切換編輯模式
  toggleEditMode() {
    const firmwarePath = document.getElementById('firmwarePath');
    const editBtn = document.getElementById('editModeBtn');

    if (!firmwarePath || !editBtn) return;

    if (firmwarePath.readOnly) {
      // 切換到編輯模式
      firmwarePath.readOnly = false;
      firmwarePath.style.backgroundColor = '#fff';
      firmwarePath.focus();
      editBtn.innerHTML = '✅ Confirmed';
      editBtn.title = 'Lock edit mode';
      editBtn.classList.add('confirmed');
      console.log('✏️ 編輯模式已啟用');
    } else {
      // 切換到鎖定模式
      firmwarePath.readOnly = true;
      firmwarePath.style.backgroundColor = '#f8f9fa';
      editBtn.innerHTML = '✏️ Edit';
      editBtn.title = 'Toggle edit mode';
      editBtn.classList.remove('confirmed');
      console.log('🔒 編輯模式已鎖定');
    }

    // 更新預覽以反映當前狀態
    this.updatePreview();
  }

  // Copy to clipboard 功能
  async copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`❌ 找不到元素: ${elementId}`);
      this.showCopyFeedback(null, '❌ 元素不存在', 'error');
      return;
    }

    let textToCopy = element.textContent || element.innerText || '';

    // 清理文字內容
    if (textToCopy === '-') {
      this.showCopyFeedback(element, '❌ 無內容可複製', 'error');
      return;
    }

    // 如果是概述，移除 "Firmware: " 前綴
    if (elementId === 'previewFirmware' && textToCopy.startsWith('Firmware: ')) {
      textToCopy = textToCopy.replace('Firmware: ', '');
    }

    if (!textToCopy.trim()) {
      this.showCopyFeedback(element, '❌ 無內容可複製', 'error');
      return;
    }

    try {
      // 使用現代瀏覽器的 Clipboard API
      await navigator.clipboard.writeText(textToCopy);
      console.log(`✅ 已複製到剪貼簿: ${textToCopy}`);
      this.showCopyFeedback(element, '✅ 已複製到剪貼簿', 'success');
    } catch (err) {
      console.warn('⚠️ Clipboard API 失敗，使用降級方案:', err);
      // 降級處理方案
      this.fallbackCopyTextToClipboard(textToCopy, element);
    }
  }

  // 降級複製功能（針對不支援 Clipboard API 的瀏覽器）
  fallbackCopyTextToClipboard(text, element) {
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
        console.log('✅ 降級複製成功');
        this.showCopyFeedback(element, '✅ 已複製到剪貼簿', 'success');
      } else {
        console.error('❌ 降級複製失敗');
        this.showCopyFeedback(element, '❌ 複製失敗', 'error');
      }
    } catch (err) {
      console.error('❌ 降級複製異常:', err);
      this.showCopyFeedback(element, '❌ 複製失敗', 'error');
    }

    document.body.removeChild(textArea);
  }

  // 顯示複製回饋
  showCopyFeedback(element, message, type = 'success') {
    // 移除既有的回饋元素
    const existingFeedback = document.querySelector('.copy-feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }

    // 建立回饋元素
    const feedback = document.createElement('div');
    feedback.className = `copy-feedback${type === 'error' ? ' error' : ''}`;
    feedback.textContent = message;

    // 計算位置
    if (element) {
      const rect = element.getBoundingClientRect();
      feedback.style.left = (rect.left + rect.width / 2 - 50) + 'px';
      feedback.style.top = (rect.top - 40) + 'px';
    } else {
      // 如果沒有元素，顯示在螢幕中央
      feedback.style.left = '50%';
      feedback.style.top = '20%';
      feedback.style.transform = 'translateX(-50%)';
    }

    // 加入到頁面
    document.body.appendChild(feedback);

    // 自動移除
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 2000);
  }
}

// 建立全域實例
window.redmineFunctions = new RedmineFunctions();

// 設置全域函數
window.redmineFunctions.setupGlobalFunctions();

console.log('✅ Redmine 功能模組已載入');
