# 🚀 快速部署指南

## 🎯 三種部署方式

### 1. 🆓 **GitHub Pages** (免費，推薦)

#### 步驟：
1. 將專案上傳到 GitHub repository
2. 在 repository 設定中啟用 GitHub Pages
3. 選擇 `main` 分支作為來源
4. 您的網站將會在 `https://username.github.io/repository-name` 上線

#### 優點：
- 完全免費
- 自動 HTTPS
- 與 Git 版本控制整合
- 支援自訂網域

### 2. ⚡ **Netlify** (免費/付費)

#### 步驟：
1. 註冊 Netlify 帳號
2. 連接 GitHub repository 或直接拖拉檔案
3. 自動部署，獲得 `https://random-name.netlify.app` 網址
4. 可設定自訂網域

#### 優點：
- 簡單易用
- 自動部署
- 表單處理功能
- 優秀的 CDN

### 3. 🔧 **傳統網站主機**

#### 步驟：
1. 執行 `prepare-deploy.bat` (Windows) 或 `prepare-deploy.sh` (Linux/Mac)
2. 將 `deploy/` 目錄內容上傳到伺服器
3. 確保伺服器支援 `.htaccess` (Apache) 或設定 Nginx

## 📋 部署前檢查

- [ ] 所有路徑都使用相對路徑
- [ ] Excel 檔案已放在正確位置
- [ ] CDN 資源可正常載入
- [ ] CORS 設定正確
- [ ] HTTPS 可用 (推薦)

## 🛠️ 快速部署命令

### Windows:
```batch
# 準備部署檔案
prepare-deploy.bat

# 使用 Python 簡易伺服器測試
cd deploy
python -m http.server 8080
```

### Linux/Mac:
```bash
# 準備部署檔案
chmod +x prepare-deploy.sh
./prepare-deploy.sh

# 使用 Python 簡易伺服器測試
cd deploy
python3 -m http.server 8080
```

## 📊 效能優化建議

1. **壓縮檔案**：
   - CSS/JS 檔案壓縮
   - 圖片最佳化

2. **CDN 使用**：
   - 將靜態資源放到 CDN
   - 使用快取策略

3. **監控設定**：
   - Google Analytics
   - 錯誤追蹤 (如 Sentry)

## 🔒 安全性建議

1. **HTTPS 強制**：
   - 使用 Let's Encrypt 免費憑證
   - 設定 HSTS 標頭

2. **檔案權限**：
   - Excel 檔案適當權限
   - 敏感資料保護

3. **定期更新**：
   - 定期更新 Excel 資料
   - 備份重要檔案

## 📞 故障排除

### 常見問題：

1. **Excel 載入失敗**
   ```
   解決方案：檢查檔案路徑、CORS 設定
   ```

2. **Vue.js 無法載入**
   ```
   解決方案：檢查 CDN 連線、網路狀態
   ```

3. **樣式異常**
   ```
   解決方案：清除快取、檢查 CSS 路徑
   ```

## 🎉 部署完成後

- ✅ 測試所有功能
- ✅ 檢查手機版本
- ✅ 測試 Excel 載入
- ✅ 驗證表單提交
- ✅ 效能測試

---

**🔗 有用的連結：**
- [GitHub Pages 文件](https://pages.github.com/)
- [Netlify 文件](https://docs.netlify.com/)
- [Vue.js 部署指南](https://vuejs.org/guide/best-practices/production-deployment.html)
