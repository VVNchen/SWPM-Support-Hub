// Meeting Minutes 模組專用功能
class MeetingMinutesFunction {
  constructor() {
    this.meetings = [];
    this.filteredMeetings = [];
    this.selectedMeeting = null;
  }

  // 初始化模組
  async initialize() {
    console.log('🚀 初始化 Meeting Minutes 模組...');

    try {
      // 等待 DOM 元素載入
      await this.waitForElement('#meetingSearch');
      console.log('✅ DOM 元素載入完成');

      // 載入會議資料
      await this.loadMeetingData();
      console.log('✅ 會議資料載入完成');

      // 綁定事件
      this.bindEvents();
      console.log('✅ 事件綁定完成');

      // 更新統計資訊
      this.updateStatistics();
      console.log('✅ 統計資訊更新完成');

      console.log('✅ Meeting Minutes 模組初始化完成');

    } catch (error) {
      console.error('❌ Meeting Minutes 模組初始化失敗:', error);
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

  // 載入會議資料
  async loadMeetingData() {
    const meetingList = document.getElementById('meetingList');
    if (!meetingList) return;

    try {
      // 這裡可以從 API 或檔案載入真實的會議資料
      // 暫時使用模擬資料
      this.meetings = this.generateMockMeetingData();
      this.filteredMeetings = [...this.meetings];

      this.renderMeetingList();

    } catch (error) {
      console.error('❌ 會議資料載入失敗:', error);
      this.showLoadingError();
    }
  }

  // 生成模擬會議資料
  generateMockMeetingData() {
    const mockMeetings = [
      {
        id: '001',
        title: 'Router 產品線週會',
        date: '2025-01-15',
        type: 'weekly',
        attendees: ['張三', '李四', '王五', '趙六'],
        content: '討論了新產品的開發進度，確認了測試計劃，檢視了市場反饋。\n\n主要議題：\n1. AX6000 系列測試進度\n2. 固件更新時程\n3. 客戶反饋處理',
        actions: '1. 張三負責完成AX6000測試報告 (1/20前)\n2. 李四跟進固件更新發佈\n3. 王五整理客戶反饋文件',
        status: 'completed'
      },
      {
        id: '002',
        title: 'Firmware 3.0.0.6 評審會議',
        date: '2025-01-12',
        type: 'review',
        attendees: ['張三', '李四', '陳七', '劉八'],
        content: '評審了Firmware 3.0.0.6版本的新功能和修復項目。\n\n評審內容：\n1. 安全性更新\n2. 性能優化\n3. 新增功能驗證',
        actions: '1. 陳七完成安全性測試 (1/18前)\n2. 劉八驗證性能指標\n3. 張三準備發佈文件',
        status: 'pending'
      },
      {
        id: '003',
        title: 'Q1 專案規劃會議',
        date: '2025-01-08',
        type: 'planning',
        attendees: ['王五', '趙六', '孫九', '周十'],
        content: '規劃了第一季度的專案目標和資源配置。\n\n規劃重點：\n1. 新產品開發時程\n2. 測試資源分配\n3. 市場推廣策略',
        actions: '1. 王五制定詳細專案時程表\n2. 趙六確認測試資源需求\n3. 孫九準備市場分析報告',
        status: 'completed'
      },
      {
        id: '004',
        title: 'GT-AX11000 PRO 技術討論',
        date: '2025-01-10',
        type: 'project',
        attendees: ['張三', '陳七', '劉八'],
        content: '討論GT-AX11000 PRO的技術實現細節和測試策略。\n\n技術重點：\n1. WiFi 6E 功能實現\n2. 散熱設計驗證\n3. 相容性測試計劃',
        actions: '1. 陳七完成WiFi 6E功能測試\n2. 劉八驗證散熱效果\n3. 張三制定相容性測試清單',
        status: 'pending'
      },
      {
        id: '005',
        title: '月度進度檢討會議',
        date: '2025-01-05',
        type: 'review',
        attendees: ['全體團隊'],
        content: '檢討了12月份的工作成果和1月份的工作計劃。\n\n檢討內容：\n1. 各專案進度回顧\n2. 問題分析與改善\n3. 下月工作重點',
        actions: '1. 各專案負責人更新進度報告\n2. 品質團隊整理改善建議\n3. 管理層確認資源調配',
        status: 'completed'
      }
    ];

    return mockMeetings;
  }

  // 綁定事件
  bindEvents() {
    const searchInput = document.getElementById('meetingSearch');
    const typeSelect = document.getElementById('meetingType');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');

    if (searchInput) {
      searchInput.oninput = () => this.filterMeetings();
    }

    if (typeSelect) {
      typeSelect.onchange = () => this.filterMeetings();
    }

    if (startDate) {
      startDate.onchange = () => this.filterMeetings();
    }

    if (endDate) {
      endDate.onchange = () => this.filterMeetings();
    }
  }

  // 渲染會議清單
  renderMeetingList() {
    const meetingList = document.getElementById('meetingList');
    if (!meetingList) return;

    if (this.filteredMeetings.length === 0) {
      meetingList.innerHTML = '<div class="loading-placeholder">📝 沒有找到符合條件的會議記錄</div>';
      return;
    }

    meetingList.innerHTML = this.filteredMeetings.map(meeting => `
      <div class="meeting-item" onclick="selectMeeting('${meeting.id}')">
        <div class="meeting-item-title">${meeting.title}</div>
        <div class="meeting-item-meta">
          <span>📅 ${meeting.date}</span>
          <span>🏷️ ${this.getTypeLabel(meeting.type)}</span>
          <span>👥 ${meeting.attendees.length} 人參與</span>
          <span class="status-${meeting.status}">⭕ ${meeting.status === 'completed' ? '已完成' : '進行中'}</span>
        </div>
      </div>
    `).join('');
  }

  // 取得會議類型標籤
  getTypeLabel(type) {
    const labels = {
      'weekly': '週會',
      'project': '專案會議',
      'review': '評審會議',
      'planning': '規劃會議',
      'other': '其他'
    };
    return labels[type] || '其他';
  }

  // 選擇會議
  selectMeeting(meetingId) {
    const meeting = this.meetings.find(m => m.id === meetingId);
    if (!meeting) return;

    this.selectedMeeting = meeting;
    this.renderMeetingDetails();

    // 更新選中狀態
    document.querySelectorAll('.meeting-item').forEach(item => {
      item.classList.remove('selected');
    });
    event.target.closest('.meeting-item').classList.add('selected');
  }

  // 渲染會議詳情
  renderMeetingDetails() {
    if (!this.selectedMeeting) return;

    const detailsSection = document.getElementById('meetingDetails');
    const titleElement = document.getElementById('meetingTitle');
    const dateElement = document.getElementById('meetingDate');
    const typeElement = document.getElementById('meetingTypeDetail');
    const attendeesElement = document.getElementById('meetingAttendees');
    const contentElement = document.getElementById('meetingContent');
    const actionsElement = document.getElementById('meetingActions');

    if (titleElement) titleElement.textContent = this.selectedMeeting.title;
    if (dateElement) dateElement.textContent = this.selectedMeeting.date;
    if (typeElement) typeElement.textContent = this.getTypeLabel(this.selectedMeeting.type);
    if (attendeesElement) attendeesElement.textContent = this.selectedMeeting.attendees.join(', ');
    if (contentElement) contentElement.textContent = this.selectedMeeting.content;
    if (actionsElement) actionsElement.textContent = this.selectedMeeting.actions;

    if (detailsSection) {
      detailsSection.classList.remove('hidden');
    }
  }

  // 篩選會議
  filterMeetings() {
    const searchText = document.getElementById('meetingSearch')?.value.toLowerCase() || '';
    const selectedType = document.getElementById('meetingType')?.value || '';
    const startDate = document.getElementById('startDate')?.value || '';
    const endDate = document.getElementById('endDate')?.value || '';

    this.filteredMeetings = this.meetings.filter(meeting => {
      // 關鍵字篩選
      const matchesSearch = !searchText ||
        meeting.title.toLowerCase().includes(searchText) ||
        meeting.content.toLowerCase().includes(searchText) ||
        meeting.attendees.some(attendee => attendee.toLowerCase().includes(searchText));

      // 類型篩選
      const matchesType = !selectedType || meeting.type === selectedType;

      // 日期篩選
      const meetingDate = new Date(meeting.date);
      const matchesStartDate = !startDate || meetingDate >= new Date(startDate);
      const matchesEndDate = !endDate || meetingDate <= new Date(endDate);

      return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
    });

    this.renderMeetingList();
    this.updateStatistics();
  }

  // 搜尋會議
  searchMeetings() {
    this.filterMeetings();
  }

  // 按日期篩選
  filterByDate() {
    this.filterMeetings();
  }

  // 更新統計資訊
  updateStatistics() {
    const totalElement = document.getElementById('totalMeetings');
    const monthlyElement = document.getElementById('monthlyMeetings');
    const pendingElement = document.getElementById('pendingActions');
    const updateElement = document.getElementById('lastUpdate');

    if (totalElement) totalElement.textContent = this.meetings.length;

    // 計算本月會議數
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyCount = this.meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      return meetingDate.getMonth() === currentMonth && meetingDate.getFullYear() === currentYear;
    }).length;
    if (monthlyElement) monthlyElement.textContent = monthlyCount;

    // 計算待處理行動項目
    const pendingCount = this.meetings.filter(meeting => meeting.status === 'pending').length;
    if (pendingElement) pendingElement.textContent = pendingCount;

    // 最近更新時間
    if (updateElement) updateElement.textContent = new Date().toLocaleDateString();
  }

  // 匯出為 Word
  exportToWord() {
    if (!this.selectedMeeting) {
      this.showError('請先選擇一個會議記錄');
      return;
    }

    // 這裡可以實現真實的 Word 匯出功能
    this.showSuccess('Word 匯出功能開發中...');
    console.log('匯出會議記錄為 Word:', this.selectedMeeting);
  }

  // 匯出為 PDF
  exportToPdf() {
    if (!this.selectedMeeting) {
      this.showError('請先選擇一個會議記錄');
      return;
    }

    // 這裡可以實現真實的 PDF 匯出功能
    this.showSuccess('PDF 匯出功能開發中...');
    console.log('匯出會議記錄為 PDF:', this.selectedMeeting);
  }

  // 匯出為 Excel
  exportToExcel() {
    if (this.filteredMeetings.length === 0) {
      this.showError('沒有會議記錄可以匯出');
      return;
    }

    // 這裡可以實現真實的 Excel 匯出功能
    this.showSuccess('Excel 匯出功能開發中...');
    console.log('匯出會議清單為 Excel:', this.filteredMeetings);
  }

  // 複製詳情文字
  async copyDetailText(elementId) {
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
    const meetingList = document.getElementById('meetingList');
    if (meetingList) {
      meetingList.innerHTML = '<div class="loading-placeholder">❌ 載入會議記錄失敗</div>';
    }
  }

  // 顯示成功訊息
  showSuccess(message) {
    console.log('✅', message);
    // 可以在這裡加入更好的 UI 提示
    alert(message);
  }

  // 顯示錯誤訊息
  showError(message) {
    console.error('❌', message);
    // 可以在這裡加入更好的 UI 提示
    alert(message);
  }
}

// 建立全域實例
window.meetingMinutesFunction = new MeetingMinutesFunction();

// 設置全域函數
window.selectMeeting = (meetingId) => window.meetingMinutesFunction.selectMeeting(meetingId);
window.searchMeetings = () => window.meetingMinutesFunction.searchMeetings();
window.filterByDate = () => window.meetingMinutesFunction.filterByDate();
window.exportToWord = () => window.meetingMinutesFunction.exportToWord();
window.exportToPdf = () => window.meetingMinutesFunction.exportToPdf();
window.exportToExcel = () => window.meetingMinutesFunction.exportToExcel();
window.copyDetailText = (elementId) => window.meetingMinutesFunction.copyDetailText(elementId);

console.log('✅ Meeting Minutes 功能模組已載入');
