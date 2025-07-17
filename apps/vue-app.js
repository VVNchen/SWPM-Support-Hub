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
          name: 'redmine',
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
          name: 'plm',
          content: '<div style="padding: 20px;"><h2>PLM</h2><p>功能開發中...</p></div>'
        },
        {
          name: 'email',
          content: '<div style="padding: 20px;"><h2>Email</h2><p>功能開發中...</p></div>'
        },
        {
          name: 'sync',
          content: '<div style="padding: 20px;"><h2>Sync</h2><p>功能開發中...</p></div>'
        },
        {
          name: 'report',
          content: '<div style="padding: 20px;"><h2>Report</h2><p>功能開發中...</p></div>'
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
    },

    onFirmwareTabChanged(tabIndex) {
      console.log('Firmware tab 切換至:', tabIndex);

      // 根據 tab 載入對應的模組
      switch (tabIndex) {
        case 0: // Redmine
          this.loadRedmineModule();
          break;
        case 1: // PLM
          this.loadPLMModule();
          break;
        case 2: // Email
          this.loadEmailModule();
          break;
        case 3: // Sync
          this.loadSyncModule();
          break;
        case 4: // Report
          this.loadReportModule();
          break;
      }
    },

    onSwpmTabChanged(tabIndex) {
      console.log('SWPM tab 切換至:', tabIndex);
    },

    // 載入 Redmine 模組
    async loadRedmineModule() {
      console.log('📥 載入 Redmine 模組...');

      try {
        // 載入 HTML 模板
        const htmlResponse = await fetch('pages/firmware/redmine.html');
        const htmlContent = await htmlResponse.text();

        // 更新 tab 內容
        const redmineTab = this.firmwareTabs.find(tab => tab.name === 'redmine');
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

    // 載入 PLM 模組
    async loadPLMModule() {
      console.log('📥 載入 PLM 模組...');

      try {
        // 載入 HTML 模板
        const htmlResponse = await fetch('pages/firmware/plm.html');
        const htmlContent = await htmlResponse.text();

        // 更新 tab 內容
        const plmTab = this.firmwareTabs.find(tab => tab.name === 'plm');
        if (plmTab) {
          plmTab.content = htmlContent;
        }

        // 等待 DOM 更新後載入 JS 功能
        this.$nextTick(async () => {
          await this.loadScript('function_js/plm-functions.js');

          // 初始化 PLM 功能
          if (window.plmFunctions) {
            setTimeout(() => {
              window.plmFunctions.initialize();
            }, 100);
          }
        });

        console.log('✅ PLM 模組載入成功');
      } catch (error) {
        console.error('❌ PLM 模組載入失敗:', error);
        this.showModuleError('plm', error.message);
      }
    },

    // 載入 Email 模組
    async loadEmailModule() {
      console.log('📥 載入 Email 模組...');

      try {
        // 載入 HTML 模板
        const htmlResponse = await fetch('pages/firmware/email.html');
        const htmlContent = await htmlResponse.text();

        // 更新 tab 內容
        const emailTab = this.firmwareTabs.find(tab => tab.name === 'email');
        if (emailTab) {
          emailTab.content = htmlContent;
        }

        // 等待 DOM 更新後載入 JS 功能
        this.$nextTick(async () => {
          await this.loadScript('function_js/email-functions.js');

          // 初始化 Email 功能
          if (window.emailFunctions) {
            setTimeout(() => {
              window.emailFunctions.initialize();
            }, 100);
          }
        });

        console.log('✅ Email 模組載入成功');
      } catch (error) {
        console.error('❌ Email 模組載入失敗:', error);
        this.showModuleError('email', error.message);
      }
    },

    // 載入 Sync 模組
    async loadSyncModule() {
      console.log('📥 載入 Sync 模組...');

      try {
        // 載入 HTML 模板
        const htmlResponse = await fetch('pages/firmware/sync.html');
        const htmlContent = await htmlResponse.text();

        // 更新 tab 內容
        const syncTab = this.firmwareTabs.find(tab => tab.name === 'sync');
        if (syncTab) {
          syncTab.content = htmlContent;
        }

        // 等待 DOM 更新後載入 JS 功能
        this.$nextTick(async () => {
          await this.loadScript('function_js/sync-functions.js');

          // 初始化 Sync 功能
          if (window.syncFunctions) {
            setTimeout(() => {
              window.syncFunctions.initialize();
            }, 100);
          }
        });

        console.log('✅ Sync 模組載入成功');
      } catch (error) {
        console.error('❌ Sync 模組載入失敗:', error);
        this.showModuleError('sync', error.message);
      }
    },

    // 載入 Report 模組
    async loadReportModule() {
      console.log('📥 載入 Report 模組...');

      try {
        // 載入 HTML 模板
        const htmlResponse = await fetch('pages/firmware/report.html');
        const htmlContent = await htmlResponse.text();

        // 更新 tab 內容
        const reportTab = this.firmwareTabs.find(tab => tab.name === 'report');
        if (reportTab) {
          reportTab.content = htmlContent;
        }

        // 等待 DOM 更新後載入 JS 功能
        this.$nextTick(async () => {
          await this.loadScript('function_js/report-functions.js');

          // 初始化 Report 功能
          if (window.reportFunctions) {
            setTimeout(() => {
              window.reportFunctions.initialize();
            }, 100);
          }
        });

        console.log('✅ Report 模組載入成功');
      } catch (error) {
        console.error('❌ Report 模組載入失敗:', error);
        this.showModuleError('report', error.message);
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

    // 預設載入第一個 tab (Redmine)
    this.loadRedmineModule();
  }
}).mount('#app');
