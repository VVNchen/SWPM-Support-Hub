# SW PM ToolBox
## 🌟 功能特色

### 📋 Create Redmine Ticket
- **建立表單資料**：自動生成 Redmine 工單內容
- **產品選擇**：透過 SheetJS 從 Excel(Router_List.xlsx) 動態載入產品清單
- **智能路徑生成**：根據選擇的Product，對照Excel(Router_List.xlsx)，自動帶入最新版的FW路徑
- **路徑編輯功能**：點擊 "Edit" 按鈕進入編輯模式，可手動修改韌體路徑；完成修改後點擊 "Confirmed" 確認變更，系統會即時同步更新到 "Preview Information" 預覽區域的相關欄位
- **標籤分類**：選擇 Redmine 標籤）
- **預覽功能**：即時預覽工單內容
- **一鍵複製**：快速複製工單資訊到剪貼簿

### 🔧 Download FW & SHA256
- **智能路徑處理**：自動生成對應的 SHA256 檔案路徑
- **下載檔案**：可選擇檔案下載位置
- **狀態管理**：下載連結根據路徑狀態動態啟用/禁用
- **檔案類型支援**：*.w;*.trx;*.pkgtb
- **降級相容**：對舊版瀏覽器提供傳統下載方式

### 📝 SWPM 筆記本
- **開發中**：此功能正在開發中，敬請期待

## 📁 專案結構

```
Vue-Box/
├── 📄 index.html              # 主頁面
├── 🎨 style.css               # 全域樣式
├── 🚀 start-server.bat        # Windows 啟動腳本
├── 📊 router-list.json        # 產品清單備用數據
│
├── 📂 apps/                   # Vue.js 應用程式
│   ├── vue-app.js            # 主要 Vue 應用邏輯
│   └── vue-styles.css        # Vue 元件樣式
│
├── 📂 pages/                  # 頁面模組
│   ├── firmware/             # 韌體相關頁面
│   │   ├── redmine.html      # Redmine 工單創建
│   │   ├── fw-sha256.html    # 韌體下載 & SHA256
│   │   ├── meeting-minutes.html  # 會議記錄
│   │   └── create-wf-email.html  # 工作流程郵件
│   └── swpm/                 # SWPM 筆記
│       ├── note1.html
│       └── note2.html
│
├── 📂 function_js/           # JavaScript 功能模組
│   ├── redmine-functions.js  # Redmine 相關功能
│   ├── fw-sha256-functions.js # 韌體下載功能
│   ├── meeting-minutes-functions.js # 會議記錄功能
│   └── create-wf-email-functions.js # 郵件功能
│
└── 📂 datasheet/            # 數據檔案
    ├── Router_List.xlsx     # 產品清單 Excel 檔
    └── ~$Router_List.xlsx   # Excel 暫存檔
```

## 🛠️ 功能模組詳解

### Redmine 工單創建
```javascript
// 自動生成智能韌體路徑
buildSmartFirmwarePath(basePath, productModel)

// 切換編輯模式（Edit ↔ Confirmed）
toggleEditMode()

// 創建 Redmine 工單
createRedmineTicket()

// 複製工單內容
copyToClipboard(elementId)
```

### 韌體下載 & SHA256
```javascript
// 下載韌體檔案（支援檔案選擇器）
downloadFirmware()

// 下載 SHA256 檔案
downloadSha256()

// 智能 SHA256 路徑生成（替換副檔名）
updateSha256Path()
```

### 狀態管理
```javascript
// 動態更新下載連結狀態
updateDownloadLinksState()

// 路徑變更時自動更新
updateFirmwarePaths()
```

## 🎯 使用指南

### 1. Redmine 工單創建流程
1. 選擇產品型號
2. 確認或編輯韌體路徑
3. 選擇 Redmine 標籤
4. 預覽工單內容
5. 一鍵創建工單

### 2. 韌體下載流程
1. 選擇產品（自動生成路徑）
2. 確認韌體和 SHA256 路徑
3. 點擊下載連結
4. 選擇儲存位置（現代瀏覽器）
5. 完成下載

### 3. 路徑編輯功能
- **啟用編輯**：點擊 "Edit" 按鈕進入編輯模式，輸入框變為可編輯狀態
- **修改路徑**：在編輯模式下可手動修改韌體路徑內容
- **確認變更**：修改完成後點擊 "Confirmed" 按鈕確認更改
- **即時同步**：確認後系統會自動更新以下內容：
  - SHA256 路徑自動同步變更
  - Preview Information 預覽區域即時更新
  - 下載連結狀態重新評估
- **狀態指示**：按鈕會在 "Edit" 和 "Confirmed" 之間切換，清楚顯示當前編輯狀態

## 🔧 配置說明

### 產品數據來源
專案支援兩種數據來源：
1. **Excel 檔案**：`datasheet/Router_List.xlsx`
2. **JSON 備用**：`router-list.json`

### 檔案伺服器配置
在 `fw-sha256-functions.js` 中修改伺服器位址：
```javascript
this.baseServerUrl = 'http://your-file-server.com';
```

## 🌐 瀏覽器支援

| 功能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| 基本功能 | ✅ | ✅ | ✅ | ✅ |
| 檔案選擇器 | ✅ 88+ | ❌ | ❌ | ✅ 88+ |
| Excel 讀取 | ✅ | ✅ | ✅ | ✅ |
| 暗色模式 | ✅ | ✅ | ✅ | ✅ |

## 🎨 自訂樣式

### 主題切換
支援亮色/暗色主題，通過 CSS 變數實現：
```css
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
}
```

### 按鈕樣式
統一使用 Bootstrap 風格的按鈕類別：
- `.btn-primary`：主要操作按鈕
- `.btn-secondary`：次要操作按鈕
- `.btn-warning`：警告/重設按鈕

## 📚 API 文檔

### 全域函數
```javascript
// Redmine 功能
window.updateFirmwarePath()
window.createRedmineTicket()
window.copyToClipboard(elementId)

// FW & SHA256 功能
window.downloadFirmware()
window.downloadSha256()
window.toggleFwEditMode()
window.resetFwForm()
```

### 事件系統
```javascript
// Tab 切換事件
onFirmwareTabChanged(newIndex)
onSwpmTabChanged(newIndex)

// 主題切換事件
toggleDarkMode()
```

## 🔄 更新日誌

### v2.0.0 (2025-01-18)
- ✨ 新增本地檔案下載功能
- 🔧 改進 SHA256 路徑生成邏輯
- 🎨 統一 UI 樣式，與 Redmine 頁面一致
- 🌐 完成介面英文化
- 🔄 智能下載連結狀態管理

### v1.0.0
- 🚀 基礎 Redmine 工單創建功能
- 📝 SWPM 筆記本功能
- 🎨 響應式設計和暗色模式
- 📊 Excel 數據讀取支援

## 🤝 貢獻指南

1. Fork 此專案
2. 創建功能分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 開啟 Pull Request

## 📄 授權條款

此專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🎯 未來計劃

- [ ] 後端 API 整合
- [ ] 資料庫支援
- [ ] 使用者認證系統
- [ ] 批次操作功能
- [ ] 檔案上傳功能
- [ ] 進階搜尋過濾
- [ ] 匯出報表功能

## 📞 聯絡資訊

- **專案作者**：VVNchen
- **GitHub**：[https://github.com/VVNchen/vue_test](https://github.com/VVNchen/vue_test)
- **Demo 網站**：[GitHub Pages](https://vvnchen.github.io/vue_test/)

- [Vue.js](https://vuejs.org/) - 漸進式 JavaScript 框架
- [SheetJS](https://sheetjs.com/) - Excel 檔案處理
- [GitHub Pages](https://pages.github.com/) - 靜態網站託管

