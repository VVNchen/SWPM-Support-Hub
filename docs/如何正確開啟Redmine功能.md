# 🚀 如何正確開啟 Redmine 功能

## ❌ **錯誤方式**
直接雙擊 HTML 文件開啟，網址會顯示：
```
file:///D:/OneDrive%20-%20ASUS/Desktop/0714Tool%20Box/index-vue-direct.html
```

這種方式會導致：
- ❌ 無法載入 Vue.js 和 SheetJS 庫
- ❌ 無法讀取 redmine.html 文件
- ❌ 無法載入 Excel 文件
- ❌ Redmine 功能完全無法使用

## ✅ **正確方式**

### 方法一：使用批次文件（推薦）
1. 雙擊 `start-local-server.bat`
2. 等待看到 "Serving HTTP on :: port 8000" 訊息
3. 開啟瀏覽器，輸入：`http://localhost:8000/index-vue-direct.html`

### 方法二：手動啟動服務器
1. 開啟 PowerShell 或命令提示字元
2. 切換到專案目錄：
   ```powershell
   cd "d:\OneDrive - ASUS\Desktop\0714Tool Box"
   ```
3. 啟動 HTTP 服務器：
   ```powershell
   python -m http.server 8000
   ```
4. 開啟瀏覽器，輸入：`http://localhost:8000/index-vue-direct.html`

### 方法三：使用 VS Code Live Server
1. 在 VS Code 中開啟專案資料夾
2. 安裝 "Live Server" 擴充功能
3. 右鍵點擊 `index-vue-direct.html` → "Open with Live Server"

## 🎯 **正確開啟後的效果**

當您使用 `http://localhost:8000` 開啟時：
- ✅ 網址顯示：`http://localhost:8000/index-vue-direct.html`
- ✅ Vue.js 和 SheetJS 庫正常載入
- ✅ Redmine 功能完全可用
- ✅ 產品選單自動載入 20 個產品
- ✅ 所有按鈕和功能正常運作
- ✅ 右上角顯示調試信息

## 🔍 **檢查是否正常運作**

開啟後請檢查：
1. 點擊 "🚀 Firmware Release" → "redmine" 標籤
2. 產品選單應該顯示 "請選擇產品... (已載入 20 個產品)"
3. 右上角應該出現黑色的調試信息框
4. 瀏覽器控制台沒有錯誤訊息

## ⚠️ **注意事項**

1. **保持服務器運行** - 使用期間不要關閉命令提示字元視窗
2. **防火牆** - 如果有防火牆警告，請允許 Python 訪問網路
3. **端口衝突** - 如果 8000 端口被佔用，改用其他端口：
   ```
   python -m http.server 8080
   ```
   然後使用 `http://localhost:8080/index-vue-direct.html`

## 🆘 **故障排除**

### 如果服務器無法啟動：
- 確認已安裝 Python
- 檢查端口是否被佔用
- 嘗試不同的端口號

### 如果 Redmine 仍無法使用：
- 檢查瀏覽器控制台錯誤訊息
- 確認網址是 `http://localhost:8000` 而非 `file://`
- 清除瀏覽器快取後重試

## 📱 **完整測試流程**

1. 啟動服務器：雙擊 `start-local-server.bat`
2. 開啟瀏覽器：`http://localhost:8000/index-vue-direct.html`
3. 點擊：🚀 Firmware Release
4. 點擊：redmine 標籤
5. 選擇產品：應該看到 EBM68, RT-AX86U 等選項
6. 選擇產品後：Firmware 路徑自動填入
7. 點擊確認 Firmware：出現綠色確認標示
8. 選擇開單標籤：Firmware Release 等
9. 查看預覽：所有資訊正確顯示
10. 點擊建立工單：顯示確認對話框

如果以上步驟都正常，表示 Redmine 功能修復成功！
