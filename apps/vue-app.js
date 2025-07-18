const DirectTabComponent = {
  props: {
    tabs: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      activeTabIndex: 0
    }
  },
  template: `
    <div class="tab-wrapper">
      <div class="tabs">
        <div 
          v-for="(tab, index) in tabs" 
          :key="index"
          class="tab" 
          :class="{ active: activeTabIndex === index }"
          @click="showTab(index)">
          {{ tab.name }}
        </div>
      </div>
    </div>
    <div class="tab-content-wrapper">
      <div 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab-content" 
        :class="{ active: activeTabIndex === index }"
        v-html="tab.content">
      </div>
    </div>
  `,
  methods: {
    showTab(index) {
      this.activeTabIndex = index;
      this.$emit('tab-changed', index);
    }
  }
};

// 主Vue應用程式
const { createApp } = Vue;

createApp({
  components: {
    DirectTabComponent
  },
  data() {
    return {
      darkMode: false,
      sidebarCollapsed: false,
      activeMainPage: 0,

      // Firmware tabs - 只保留 redmine 功能，其他簡化
      firmwareTabs: [
        {
          name: 'Redmine',
          content: `
            <div id="redmine-loading" style="padding: 20px; text-align: center;">
              <h3>🔄 正在載入 Redmine 功能...</h3>
              <p>如果載入時間過長，請點擊下方按鈕手動重試：</p>
              <button onclick="window.manualInitRedmine()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                🚀 手動載入 Redmine
              </button>
              <button onclick="location.reload()" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                🔄 重新載入頁面
              </button>
            </div>
          `
        },
        {
          name: 'FW & SHA256',
          content: '<div style="padding: 20px;"><h2>Download FW & SHA256</h2><p>功能開發中...</p></div>'
        },
        {
          name: 'Meeting minutes',
          content: '<div style="padding: 20px;"><h2>Meeting minutes</h2><p>功能開發中...</p></div>'
        },
        {
          name: 'Create WF & Email',
          content: '<div style="padding: 20px;"><h2>WF & Email</h2><p>功能開發中...</p></div>'
        }
      ],

      // SWPM tabs - 簡化版本
      swpmTabs: [
        {
          name: 'Note1',
          content: '<div style="padding: 20px;"><h2>SWPM Note 1</h2><p>筆記功能開發中...</p></div>'
        },
        {
          name: 'Note2',
          content: '<div style="padding: 20px;"><h2>SWPM Note 2</h2><p>筆記功能開發中...</p></div>'
        }
      ],

      // User Manual tabs
      userManualTabs: [
        {
          name: 'Generate Manual',
          content: `
            <div id="generate-manual-loading" style="padding: 20px; text-align: center;">
              <h3>🔄 正在載入 Generate Manual 功能...</h3>
              <p>如果載入時間過長，請點擊下方按鈕手動重試：</p>
              <button onclick="window.manualInitGenerateManual()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                🚀 手動載入 Generate Manual
              </button>
              <button onclick="location.reload()" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                🔄 重新載入頁面
              </button>
            </div>
          `
        },
        {
          name: 'Template Library',
          content: '<div style="padding: 20px;"><h2>📚 Template Library</h2><p>手冊範本庫功能開發中...</p></div>'
        },
        {
          name: 'Manual History',
          content: '<div style="padding: 20px;"><h2>📋 Manual History</h2><p>手冊生成歷史記錄功能開發中...</p></div>'
        }
      ]
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        sidebar.classList.toggle('collapsed');
      }
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      document.body.classList.toggle('dark');
    },

    showMainPage(pageIndex) {
      this.activeMainPage = pageIndex;
      
      // 如果切換到 User Manual 頁面 (pageIndex === 2)，自動載入第一個 tab
      if (pageIndex === 2) {
        this.$nextTick(() => {
          this.loadGenerateManualModule();
        });
      }
    },

    onFirmwareTabChanged(tabIndex) {
      console.log('Firmware tab 切換至:', tabIndex);

      // 根據 tab 載入對應的模組
      switch (tabIndex) {
        case 0: // Redmine
          this.loadRedmineModule();
          break;
        case 1: // FW & SHA256
          this.loadPLMModule();
          break;
        case 2: // 檢視會議記錄
          this.loadEmailModule();
          break;
        case 3: // Create WF & Email
          this.loadSyncModule();
          break;
      }
    },

    onSwpmTabChanged(tabIndex) {
      console.log('SWPM tab 切換至:', tabIndex);
    },

    onUserManualTabChanged(tabIndex) {
      console.log('User Manual tab 切換至:', tabIndex);

      // 根據 tab 載入對應的模組
      switch (tabIndex) {
        case 0: // Generate Manual
          this.loadGenerateManualModule();
          break;
        case 1: // Template Library
          console.log('Template Library tab selected - 功能開發中');
          break;
        case 2: // Manual History
          console.log('Manual History tab selected - 功能開發中');
          break;
      }
    },

    // 載入 Redmine 模組
    async loadRedmineModule() {
      console.log('📥 載入 Redmine 模組...');

      try {
        // 載入 HTML 模板
        const htmlResponse = await fetch('pages/firmware/redmine.html');
        const htmlContent = await htmlResponse.text();

        // 更新 tab 內容
        const redmineTab = this.firmwareTabs.find(tab => tab.name === 'Redmine');
        if (redmineTab) {
          redmineTab.content = htmlContent;
        }

        // 等待 DOM 更新後載入 JS 功能
        this.$nextTick(async () => {
          await this.loadScript('function_js/redmine-functions.js');

          // 初始化 Redmine 功能
          if (window.redmineFunctions) {
            setTimeout(() => {
              window.redmineFunctions.initialize();
            }, 100);
          }
        });

        console.log('✅ Redmine 模組載入成功');
      } catch (error) {
        console.error('❌ Redmine 模組載入失敗:', error);
        this.showModuleError('redmine', error.message);
      }
    },

    // 載入 FW & SHA256 模組
    async loadPLMModule() {
      console.log('📥 載入 FW & SHA256 模組...');

      try {
        // 載入 HTML 模板
        const htmlResponse = await fetch('pages/firmware/fw-sha256.html');
        const htmlContent = await htmlResponse.text();

        // 更新 tab 內容
        const fwTab = this.firmwareTabs.find(tab => tab.name === 'FW & SHA256');
        if (fwTab) {
          fwTab.content = htmlContent;
        }

        // 等待 DOM 更新後載入 JS 功能
        this.$nextTick(async () => {
          await this.loadScript('function_js/fw-sha256-functions.js');

          // 初始化 FW & SHA256 功能
          if (window.fwSha256Functions) {
            setTimeout(() => {
              window.fwSha256Functions.initialize();
            }, 100);
          }
        });

        console.log('✅ FW & SHA256 模組載入成功');
      } catch (error) {
        console.error('❌ FW & SHA256 模組載入失敗:', error);
        this.showModuleError('fw-sha256', error.message);
      }
    },

    // 載入 Meeting Minutes 模組
    async loadEmailModule() {
      console.log('📥 載入 Meeting Minutes 模組...');

      try {
        // 載入 HTML 模板
        const htmlResponse = await fetch('pages/firmware/meeting-minutes.html');
        const htmlContent = await htmlResponse.text();

        // 更新 tab 內容
        const meetingTab = this.firmwareTabs.find(tab => tab.name === 'Meeting minutes');
        if (meetingTab) {
          meetingTab.content = htmlContent;
        }

        // 等待 DOM 更新後載入 JS 功能
        this.$nextTick(async () => {
          await this.loadScript('function_js/meeting-minutes-functions.js');

          // 初始化 Meeting Minutes 功能
          if (window.meetingMinutesFunction) {
            setTimeout(() => {
              window.meetingMinutesFunction.initialize();
            }, 100);
          }
        });

        console.log('✅ Meeting Minutes 模組載入成功');
      } catch (error) {
        console.error('❌ Meeting Minutes 模組載入失敗:', error);
        this.showModuleError('meeting-minutes', error.message);
      }
    },

    // 載入 Create WF & Email 模組
    async loadSyncModule() {
      console.log('📥 載入 Create WF & Email 模組...');

      try {
        // 載入 HTML 模板
        const htmlResponse = await fetch('pages/firmware/create-wf-email.html');
        const htmlContent = await htmlResponse.text();

        // 更新 tab 內容
        const createWfTab = this.firmwareTabs.find(tab => tab.name === 'Create WF & Email');
        if (createWfTab) {
          createWfTab.content = htmlContent;
        }

        // 等待 DOM 更新後載入 JS 功能
        this.$nextTick(async () => {
          await this.loadScript('function_js/create-wf-email-functions.js');

          // 初始化 Create WF & Email 功能
          if (window.createWfEmailFunctions) {
            setTimeout(() => {
              window.createWfEmailFunctions.initialize();
            }, 100);
          }
        });

        console.log('✅ Create WF & Email 模組載入成功');
      } catch (error) {
        console.error('❌ Create WF & Email 模組載入失敗:', error);
        this.showModuleError('create-wf-email', error.message);
      }
    },

    // 載入 Generate Manual 模組
    async loadGenerateManualModule() {
      console.log('📥 載入 Generate Manual 模組...');

      try {
        // 載入 HTML 模板
        const htmlResponse = await fetch('pages/user-manual/generate-manual.html');
        const htmlContent = await htmlResponse.text();

        // 更新 tab 內容
        const generateManualTab = this.userManualTabs.find(tab => tab.name === 'Generate Manual');
        if (generateManualTab) {
          generateManualTab.content = htmlContent;
        }

        // 等待 DOM 更新後載入 JS 功能
        this.$nextTick(async () => {
          await this.loadScript('function_js/user-manual-functions.js');

          // 初始化 Generate Manual 功能
          if (window.userManualFunctions) {
            setTimeout(() => {
              window.userManualFunctions.initialize();
            }, 100);
          }
        });

        console.log('✅ Generate Manual 模組載入成功');
      } catch (error) {
        console.error('❌ Generate Manual 模組載入失敗:', error);
        this.showUserManualModuleError('Generate Manual', error.message);
      }
    },

    // 動態載入 JavaScript 檔案
    loadScript(src) {
      return new Promise((resolve, reject) => {
        // 檢查是否已經載入
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    },

    // 顯示模組載入錯誤
    showModuleError(moduleName, errorMessage) {
      const tab = this.firmwareTabs.find(tab => tab.name === moduleName);
      if (tab) {
        tab.content = `
          <div style="padding: 20px; text-align: center; color: red;">
            <h3>❌ ${moduleName} 模組載入失敗</h3>
            <p>錯誤: ${errorMessage}</p>
            <button onclick="location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px;">
              🔄 重新載入
            </button>
          </div>
        `;
      }
    },

    // 顯示 User Manual 模組載入錯誤
    showUserManualModuleError(moduleName, errorMessage) {
      const tab = this.userManualTabs.find(tab => tab.name === moduleName);
      if (tab) {
        tab.content = `
          <div style="padding: 20px; text-align: center; color: red;">
            <h3>❌ ${moduleName} 模組載入失敗</h3>
            <p>錯誤: ${errorMessage}</p>
            <button onclick="location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px;">
              🔄 重新載入
            </button>
          </div>
        `;
      }
    },

    // 簡化的 Redmine 內容載入
    async loadRedmineContent() {
      // 已移除，改用模組化載入
      console.log('⚠️ loadRedmineContent 已廢棄，請使用 loadRedmineModule');
    },

    // 初始化產品列表 - 修復版本：優先從 Excel 載入
    async initializeProductList() {
      // 已移除，改由 redmine-functions.js 負責
      console.log('⚠️ initializeProductList 已廢棄，請使用 redmine-functions.js');
    },

    // 從 Excel 載入產品
    async loadProductsFromExcel() {
      // 已移除，改由 redmine-functions.js 負責
      console.log('⚠️ loadProductsFromExcel 已廢棄，請使用 redmine-functions.js');
    },

    // 從 JSON 載入產品（備用方案）
    async loadProductsFromJSON() {
      // 已移除，改由 redmine-functions.js 負責
      console.log('⚠️ loadProductsFromJSON 已廢棄，請使用 redmine-functions.js');
    },

    // 填充產品選單
    populateProductSelect(products, source) {
      // 已移除，改由 redmine-functions.js 負責
      console.log('⚠️ populateProductSelect 已廢棄，請使用 redmine-functions.js');
    },

    // 顯示載入錯誤
    showLoadingError() {
      // 已移除，改由 redmine-functions.js 負責
      console.log('⚠️ showLoadingError 已廢棄，請使用 redmine-functions.js');
    },

    // 顯示成功訊息
    showSuccessMessage(message) {
      // 已移除，改由 redmine-functions.js 負責
      console.log('⚠️ showSuccessMessage 已廢棄，請使用 redmine-functions.js');
    },

    // 顯示錯誤訊息
    showErrorMessage(message) {
      // 已移除，改由 redmine-functions.js 負責
      console.log('⚠️ showErrorMessage 已廢棄，請使用 redmine-functions.js');
    },

    // 綁定 Redmine 事件
    bindRedmineEvents() {
      // 已移除，改由 redmine-functions.js 負責
      console.log('⚠️ bindRedmineEvents 已廢棄，請使用 redmine-functions.js');
    },

    // 設置全域函數
    setupGlobalFunctions() {
      // 已移除，改由 redmine-functions.js 負責
      console.log('⚠️ setupGlobalFunctions 已廢棄，請使用 redmine-functions.js');
    }
  },

  mounted() {
    console.log('🚀 Vue 應用已載入');

    // 設置手動初始化功能
    window.manualInitRedmine = () => {
      if (window.redmineFunctions) {
        window.redmineFunctions.initialize();
      }
    };

    window.manualInitGenerateManual = () => {
      if (window.userManualFunctions) {
        window.userManualFunctions.initialize();
      }
    };

    // 預設載入第一個 tab (Redmine)
    this.loadRedmineModule();
  }
}).mount('#app');
