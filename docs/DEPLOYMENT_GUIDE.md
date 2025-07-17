# 🌐 伺服器部署指南

## 📋 部署前檢查清單

### 必要檔案
- [ ] `index-vue-hybrid-new.html` (主應用程式)
- [ ] `style.css` (主樣式檔)
- [ ] `vue-styles.css` (Vue 樣式檔)
- [ ] `hybrid-vue-app.js` (Vue 邏輯檔)
- [ ] `pages/firmware/redmine.html` (Redmine 表單)
- [ ] `DUT_List.xlsx` (Excel 資料檔案)
- [ ] 所有 `pages/` 目錄下的 HTML 檔案

### 可選檔案
- [ ] `complete-app.html` (單檔案版本)
- [ ] `test-excel-loading.html` (測試頁面)
- [ ] `launcher.html` (啟動器)
- [ ] `debug-test.html` (診斷工具)

## 🚀 部署方式

### 1. 靜態網站託管 (推薦)
- **GitHub Pages** (免費)
- **Netlify** (免費/付費)
- **Vercel** (免費/付費)
- **Firebase Hosting** (免費/付費)

### 2. 傳統網站伺服器
- **Apache HTTP Server**
- **Nginx**
- **IIS (Windows Server)**

### 3. 雲端平台
- **AWS S3 + CloudFront**
- **Azure Static Web Apps**
- **Google Cloud Storage**

## 📁 目錄結構 (建議)

```
website-root/
├── index.html (主頁面)
├── style.css
├── vue-styles.css
├── hybrid-vue-app.js
├── DUT_List.xlsx
├── pages/
│   ├── firmware/
│   │   ├── redmine.html
│   │   ├── email.html
│   │   ├── plm.html
│   │   └── ...
│   └── swpm/
│       ├── note1.html
│       └── note2.html
├── assets/ (可選)
│   ├── images/
│   └── icons/
└── docs/ (可選)
    ├── README.md
    └── user-guide.md
```

## ⚙️ 伺服器設定

### Apache (.htaccess)
```apache
# 啟用 CORS 支援
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type"

# Excel 檔案 MIME 類型
AddType application/vnd.openxmlformats-officedocument.spreadsheetml.sheet .xlsx
AddType application/vnd.ms-excel .xls

# 快取設定
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/vnd.openxmlformats-officedocument.spreadsheetml.sheet "access plus 1 week"
</IfModule>
```

### Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # CORS 設定
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers 'Content-Type';

    # Excel 檔案處理
    location ~* \.(xlsx|xls)$ {
        add_header Content-Type application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;
        expires 1w;
    }

    # 靜態檔案快取
    location ~* \.(css|js|png|jpg|jpeg|gif|ico)$ {
        expires 1M;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔧 程式碼修改

### 1. 相對路徑調整
確保所有路徑都是相對的：
- `../../DUT_List.xlsx` → `./DUT_List.xlsx`
- `../style.css` → `./style.css`

### 2. CDN 連結檢查
確認外部資源可正常載入：
- Vue.js CDN
- SheetJS CDN

## 🛡️ 安全性考量

### 1. Excel 檔案保護
- 限制直接存取敏感資料
- 考慮使用 API 端點提供資料
- 定期更新檔案權限

### 2. HTTPS 部署
- 強制使用 HTTPS
- 取得 SSL 憑證
- 設定安全標頭

## 📊 監控與維護

### 1. 效能監控
- 頁面載入時間
- Excel 檔案載入速度
- 使用者互動追蹤

### 2. 錯誤追蹤
- JavaScript 錯誤監控
- 伺服器錯誤日誌
- 檔案載入失敗追蹤

## 🔄 更新流程

### 1. 開發環境測試
- 本地測試所有功能
- 檢查 Excel 載入
- 驗證 Vue.js 元件

### 2. 暫存環境部署
- 上傳到測試伺服器
- 完整功能測試
- 效能測試

### 3. 生產環境部署
- 備份現有檔案
- 上傳新版本
- 驗證功能正常

## 🚨 故障排除

### 常見問題
1. **Excel 載入失敗**
   - 檢查檔案路徑
   - 驗證 CORS 設定
   - 確認檔案權限

2. **Vue.js 無法載入**
   - 檢查 CDN 連線
   - 驗證 JavaScript 語法
   - 查看瀏覽器錯誤

3. **樣式異常**
   - 檢查 CSS 檔案路徑
   - 驗證快取設定
   - 清除瀏覽器快取

## 📞 支援資源

### 文件連結
- [Vue.js 官方文件](https://vuejs.org/)
- [SheetJS 文件](https://sheetjs.com/)
- [MDN Web Docs](https://developer.mozilla.org/)

### 社群支援
- Stack Overflow
- GitHub Issues
- Vue.js 社群論壇
