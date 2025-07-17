// Create WF & Email 模組專用功能
class CreateWfEmailFunctions {
  constructor() {
    this.routerList = [];
    this.ccEmails = [];
    this.attachments = [];
    this.workflowHistory = [];
  }

  // 初始化模組
  async initialize() {
    console.log('🚀 初始化 Create WF & Email 模組...');

    try {
      // 等待 DOM 元素載入
      await this.waitForElement('#workflowType');
      console.log('✅ DOM 元素載入完成');

      // 載入產品資料
      await this.loadProductData();
      console.log('✅ 產品資料載入完成');

      // 載入工作流程歷史
      await this.loadWorkflowHistory();
      console.log('✅ 工作流程歷史載入完成');

      // 綁定事件
      this.bindEvents();
      console.log('✅ 事件綁定完成');

      // 初始化按鈕狀態
      this.updateButtons();
      console.log('✅ 按鈕狀態初始化完成');

      console.log('✅ Create WF & Email 模組初始化完成');

    } catch (error) {
      console.error('❌ Create WF & Email 模組初始化失敗:', error);
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
    const productSelect = document.getElementById('wfProductSelect');
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
    const productSelect = document.getElementById('wfProductSelect');
    if (!productSelect) return;

    productSelect.innerHTML = '<option value="">請選擇產品...</option>';

    products.forEach(product => {
      if (product.Model) {
        const option = document.createElement('option');
        option.value = product.Model;
        option.textContent = product.Model;
        productSelect.appendChild(option);
      }
    });

    console.log(`✅ 載入了 ${products.length} 個產品到選單中`);
  }

  // 載入工作流程歷史
  async loadWorkflowHistory() {
    // 模擬載入歷史資料
    this.workflowHistory = [
      {
        id: 'WF001',
        type: 'test-request',
        product: 'GT-AX11000_PRO',
        title: 'GT-AX11000_PRO 固件測試請求',
        assignee: 'zhang.san@asus.com',
        priority: 'high',
        date: '2025-01-15',
        status: 'completed'
      },
      {
        id: 'WF002',
        type: 'build-request',
        product: 'RT-AX88U',
        title: 'RT-AX88U 建置請求 - v3.0.0.6',
        assignee: 'li.si@asus.com',
        priority: 'normal',
        date: '2025-01-14',
        status: 'in-progress'
      },
      {
        id: 'WF003',
        type: 'bug-report',
        product: 'AX6000',
        title: 'AX6000 WiFi 連線問題回報',
        assignee: 'wang.wu@asus.com',
        priority: 'urgent',
        date: '2025-01-13',
        status: 'pending'
      }
    ];

    this.renderWorkflowHistory();
  }

  // 綁定事件
  bindEvents() {
    const workflowType = document.getElementById('workflowType');
    const productSelect = document.getElementById('wfProductSelect');
    const title = document.getElementById('workflowTitle');
    const description = document.getElementById('workflowDescription');
    const priority = document.getElementById('workflowPriority');
    const deadline = document.getElementById('workflowDeadline');
    const assignee = document.getElementById('assigneeSelect');
    const attachments = document.getElementById('workflowAttachments');

    // 監聽所有表單變更
    [workflowType, productSelect, title, description, priority, deadline, assignee].forEach(element => {
      if (element) {
        element.addEventListener('change', () => {
          this.updatePreview();
          this.updateButtons();
        });
        element.addEventListener('input', () => {
          this.updatePreview();
          this.updateButtons();
        });
      }
    });

    // 監聽附件上傳
    if (attachments) {
      attachments.addEventListener('change', (e) => {
        this.handleFileUpload(e);
      });
    }
  }

  // 處理檔案上傳
  handleFileUpload(event) {
    const files = Array.from(event.target.files);
    const attachmentList = document.getElementById('attachmentList');

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        this.showError(`檔案 ${file.name} 超過 10MB 限制`);
        return;
      }

      this.attachments.push(file);

      const attachmentItem = document.createElement('div');
      attachmentItem.className = 'attachment-item';
      attachmentItem.innerHTML = `
        <span class="attachment-name">📎 ${file.name}</span>
        <span class="attachment-size">${this.formatFileSize(file.size)}</span>
        <button class="remove-attachment" onclick="removeAttachment('${file.name}')">✕</button>
      `;

      if (attachmentList) {
        attachmentList.appendChild(attachmentItem);
      }
    });

    // 清除 input 以允許重複上傳同一檔案
    event.target.value = '';
  }

  // 格式化檔案大小
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 移除附件
  removeAttachment(fileName) {
    this.attachments = this.attachments.filter(file => file.name !== fileName);

    const attachmentList = document.getElementById('attachmentList');
    if (attachmentList) {
      const items = attachmentList.querySelectorAll('.attachment-item');
      items.forEach(item => {
        if (item.querySelector('.attachment-name').textContent.includes(fileName)) {
          item.remove();
        }
      });
    }
  }

  // 新增 CC Email
  addCcEmail() {
    const input = document.getElementById('ccEmailInput');
    const emailList = document.getElementById('ccEmailList');

    if (!input || !emailList) return;

    const email = input.value.trim();
    if (!email) return;

    // 簡單的 email 驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showError('請輸入有效的 Email 地址');
      return;
    }

    if (this.ccEmails.includes(email)) {
      this.showError('此 Email 地址已存在');
      return;
    }

    this.ccEmails.push(email);

    const emailTag = document.createElement('div');
    emailTag.className = 'email-tag';
    emailTag.innerHTML = `
      <span>${email}</span>
      <button class="remove-btn" onclick="removeCcEmail('${email}')">✕</button>
    `;

    emailList.appendChild(emailTag);
    input.value = '';

    this.updatePreview();
  }

  // 移除 CC Email
  removeCcEmail(email) {
    this.ccEmails = this.ccEmails.filter(e => e !== email);

    const emailList = document.getElementById('ccEmailList');
    if (emailList) {
      const tags = emailList.querySelectorAll('.email-tag');
      tags.forEach(tag => {
        if (tag.textContent.includes(email)) {
          tag.remove();
        }
      });
    }

    this.updatePreview();
  }

  // 更新預覽
  updatePreview() {
    const workflowType = document.getElementById('workflowType')?.value || '';
    const product = document.getElementById('wfProductSelect')?.value || '';
    const title = document.getElementById('workflowTitle')?.value || '';
    const description = document.getElementById('workflowDescription')?.value || '';
    const priority = document.getElementById('workflowPriority')?.value || '';
    const assignee = document.getElementById('assigneeSelect')?.value || '';

    // 更新工作流程預覽
    const previewSection = document.getElementById('workflowPreview');
    if (workflowType || product || title) {
      if (previewSection) previewSection.classList.remove('hidden');

      this.updatePreviewField('previewType', this.getTypeLabel(workflowType));
      this.updatePreviewField('previewProduct', product);
      this.updatePreviewField('previewTitle', title);
      this.updatePreviewField('previewPriority', this.getPriorityLabel(priority));
      this.updatePreviewField('previewAssignee', assignee);
      this.updatePreviewField('previewDescription', description);
    } else {
      if (previewSection) previewSection.classList.add('hidden');
    }

    // 更新 Email 預覽
    this.updateEmailPreview();
  }

  // 更新預覽欄位
  updatePreviewField(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.textContent = value || '-';
    }
  }

  // 更新 Email 預覽
  updateEmailPreview() {
    const assignee = document.getElementById('assigneeSelect')?.value || '';
    const workflowType = document.getElementById('workflowType')?.value || '';
    const product = document.getElementById('wfProductSelect')?.value || '';
    const title = document.getElementById('workflowTitle')?.value || '';
    const description = document.getElementById('workflowDescription')?.value || '';
    const priority = document.getElementById('workflowPriority')?.value || '';

    const emailSection = document.getElementById('emailPreview');
    if (assignee && workflowType && title) {
      if (emailSection) emailSection.classList.remove('hidden');

      const subject = this.generateEmailSubject(workflowType, product, title);
      const body = this.generateEmailBody(workflowType, product, title, description, priority);

      this.updatePreviewField('emailTo', assignee);
      this.updatePreviewField('emailCc', this.ccEmails.join(', '));
      this.updatePreviewField('emailSubject', subject);
      this.updatePreviewField('emailBody', body);
    } else {
      if (emailSection) emailSection.classList.add('hidden');
    }
  }

  // 生成 Email 主旨
  generateEmailSubject(type, product, title) {
    const typeLabel = this.getTypeLabel(type);
    const productPart = product ? `[${product}] ` : '';
    return `${productPart}${typeLabel}: ${title}`;
  }

  // 生成 Email 內容
  generateEmailBody(type, product, title, description, priority) {
    const typeLabel = this.getTypeLabel(type);
    const priorityLabel = this.getPriorityLabel(priority);

    return `Hi,

我需要為以下項目建立${typeLabel}：

產品: ${product || 'N/A'}
標題: ${title}
優先級: ${priorityLabel}
描述:
${description}

請協助處理，謝謝！

Best regards`;
  }

  // 取得類型標籤
  getTypeLabel(type) {
    const labels = {
      'test-request': '測試請求',
      'build-request': '編譯請求',
      'release-request': '發佈請求',
      'bug-report': '錯誤回報',
      'feature-request': '功能請求',
      'document-request': '文件請求'
    };
    return labels[type] || type;
  }

  // 取得優先級標籤
  getPriorityLabel(priority) {
    const labels = {
      'low': '🟢 低',
      'normal': '🟡 一般',
      'high': '🟠 高',
      'urgent': '🔴 緊急'
    };
    return labels[priority] || priority;
  }

  // 更新按鈕狀態
  updateButtons() {
    const createBtn = document.getElementById('createWorkflowBtn');
    const sendBtn = document.getElementById('sendEmailBtn');

    const workflowType = document.getElementById('workflowType')?.value || '';
    const title = document.getElementById('workflowTitle')?.value.trim() || '';
    const assignee = document.getElementById('assigneeSelect')?.value || '';

    const canCreate = workflowType && title && assignee;

    if (createBtn) {
      createBtn.disabled = !canCreate;
      createBtn.style.backgroundColor = canCreate ? '#007bff' : '#6c757d';
    }

    if (sendBtn) {
      sendBtn.disabled = !canCreate;
      sendBtn.style.backgroundColor = canCreate ? '#6c757d' : '#999';
    }
  }

  // 建立工作流程
  createWorkflow() {
    const workflowData = this.collectFormData();
    if (!workflowData) return;

    // 這裡可以實現真實的工作流程建立 API 呼叫
    console.log('建立工作流程:', workflowData);

    // 添加到歷史記錄
    const newWorkflow = {
      id: 'WF' + String(this.workflowHistory.length + 1).padStart(3, '0'),
      type: workflowData.type,
      product: workflowData.product,
      title: workflowData.title,
      assignee: workflowData.assignee,
      priority: workflowData.priority,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    this.workflowHistory.unshift(newWorkflow);
    this.renderWorkflowHistory();

    this.showSuccess('工作流程建立成功！ID: ' + newWorkflow.id);
  }

  // 發送 Email
  sendEmail() {
    const workflowData = this.collectFormData();
    if (!workflowData) return;

    const emailData = {
      to: workflowData.assignee,
      cc: this.ccEmails,
      subject: this.generateEmailSubject(workflowData.type, workflowData.product, workflowData.title),
      body: this.generateEmailBody(workflowData.type, workflowData.product, workflowData.title, workflowData.description, workflowData.priority),
      attachments: this.attachments
    };

    // 這裡可以實現真實的 Email 發送 API 呼叫
    console.log('發送 Email:', emailData);

    this.showSuccess('Email 發送成功！');
  }

  // 收集表單資料
  collectFormData() {
    const workflowType = document.getElementById('workflowType')?.value;
    const product = document.getElementById('wfProductSelect')?.value;
    const title = document.getElementById('workflowTitle')?.value.trim();
    const description = document.getElementById('workflowDescription')?.value.trim();
    const priority = document.getElementById('workflowPriority')?.value;
    const deadline = document.getElementById('workflowDeadline')?.value;
    const assignee = document.getElementById('assigneeSelect')?.value;

    if (!workflowType || !title || !assignee) {
      this.showError('請填寫必要欄位：工作流程類型、標題、指派人員');
      return null;
    }

    return {
      type: workflowType,
      product,
      title,
      description,
      priority,
      deadline,
      assignee,
      ccEmails: this.ccEmails,
      attachments: this.attachments
    };
  }

  // 重設表單
  resetForm() {
    // 清除表單欄位
    const formElements = [
      'workflowType', 'wfProductSelect', 'workflowTitle',
      'workflowDescription', 'workflowPriority', 'workflowDeadline',
      'assigneeSelect', 'ccEmailInput'
    ];

    formElements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.value = '';
      }
    });

    // 清除 CC Email 列表
    this.ccEmails = [];
    const emailList = document.getElementById('ccEmailList');
    if (emailList) emailList.innerHTML = '';

    // 清除附件
    this.attachments = [];
    const attachmentList = document.getElementById('attachmentList');
    if (attachmentList) attachmentList.innerHTML = '';

    // 隱藏預覽區塊
    const previewSection = document.getElementById('workflowPreview');
    const emailSection = document.getElementById('emailPreview');
    if (previewSection) previewSection.classList.add('hidden');
    if (emailSection) emailSection.classList.add('hidden');

    this.updateButtons();
    console.log('🔄 表單已重設');
  }

  // 渲染工作流程歷史
  renderWorkflowHistory() {
    const historyContainer = document.getElementById('workflowHistory');
    if (!historyContainer) return;

    if (this.workflowHistory.length === 0) {
      historyContainer.innerHTML = '<div class="loading-placeholder">📝 沒有工作流程記錄</div>';
      return;
    }

    historyContainer.innerHTML = this.workflowHistory.map(workflow => `
      <div class="workflow-item">
        <div class="workflow-item-header">
          <span class="workflow-item-title">${workflow.title}</span>
          <span class="workflow-item-date">${workflow.date}</span>
        </div>
        <div class="workflow-item-meta">
          <span>🆔 ${workflow.id}</span>
          <span>🏷️ ${this.getTypeLabel(workflow.type)}</span>
          <span>📦 ${workflow.product}</span>
          <span>👤 ${workflow.assignee}</span>
          <span class="status-${workflow.status}">⭕ ${this.getStatusLabel(workflow.status)}</span>
        </div>
      </div>
    `).join('');
  }

  // 取得狀態標籤
  getStatusLabel(status) {
    const labels = {
      'pending': '等待中',
      'in-progress': '進行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return labels[status] || status;
  }

  // 複製預覽文字
  async copyPreviewText(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const text = element.textContent || element.innerText;
    if (!text.trim() || text === '-') {
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

  // 顯示載入錯誤
  showLoadingError() {
    const productSelect = document.getElementById('wfProductSelect');
    if (productSelect) {
      productSelect.innerHTML = '<option value="">❌ Loading failed</option>';
    }
  }

  // 顯示成功訊息
  showSuccess(message) {
    console.log('✅', message);
    alert(message); // 可以改用更好的 UI 提示
  }

  // 顯示錯誤訊息
  showError(message) {
    console.error('❌', message);
    alert(message); // 可以改用更好的 UI 提示
  }
}

// 建立全域實例
window.createWfEmailFunctions = new CreateWfEmailFunctions();

// 設置全域函數
window.addCcEmail = () => window.createWfEmailFunctions.addCcEmail();
window.removeCcEmail = (email) => window.createWfEmailFunctions.removeCcEmail(email);
window.removeAttachment = (fileName) => window.createWfEmailFunctions.removeAttachment(fileName);
window.createWorkflow = () => window.createWfEmailFunctions.createWorkflow();
window.sendEmail = () => window.createWfEmailFunctions.sendEmail();
window.resetWorkflowForm = () => window.createWfEmailFunctions.resetForm();
window.copyPreviewText = (elementId) => window.createWfEmailFunctions.copyPreviewText(elementId);

console.log('✅ Create WF & Email 功能模組已載入');
