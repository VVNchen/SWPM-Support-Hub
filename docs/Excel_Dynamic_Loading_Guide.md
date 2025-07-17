# 📊 動態 Excel 載入使用指南

## 🎯 功能概述

這個系統能在每次開啟 redmine.html 時自動重新讀取最新的 `DUT_list.xlsx` Excel 檔案，確保產品資料始終是最新的。

## ✨ 主要特色

- **🔄 自動重新載入**: 每次開啟頁面都會重新讀取 Excel 檔案
- **📂 多路徑搜尋**: 自動搜尋多個可能的檔案位置
- **📁 手動上傳**: 支援使用者手動選擇 Excel 檔案
- **🔄 即時更新**: 可隨時重新載入最新資料
- **🛡️ 容錯機制**: 載入失敗時自動使用備用資料

## 📁 Excel 檔案放置位置

系統會按順序搜尋以下位置的 `DUT_list.xlsx` 檔案：

1. **專案根目錄**
   - `DUT_list.xlsx`
   - `DUT_List.xlsx` (大寫變化)
   - `dut-list.xlsx` (小寫版本)

2. **data 資料夾**
   - `data/DUT_list.xlsx`
   - `data/DUT_List.xlsx`

3. **上層目錄**
   - `../DUT_list.xlsx`
   - `../data/DUT_list.xlsx`
   - `../../DUT_list.xlsx`

4. **其他常見位置**
   - `excel/DUT_list.xlsx`
   - `files/DUT_list.xlsx`
   - `assets/DUT_list.xlsx`

## 🎮 使用方式

### 自動載入
1. 將 `DUT_list.xlsx` 放在任一支援的位置
2. 開啟 `pages/firmware/redmine.html`
3. 系統會自動搜尋並載入最新資料

### 手動重新載入
- 點擊 **🔄 重新載入** 按鈕
- 系統會重新讀取 Excel 檔案
- 適用於更新 Excel 檔案後不想重新載入頁面

### 手動選擇檔案
- 點擊 **📁 選擇 Excel 檔案** 按鈕
- 從檔案選擇器中選擇 Excel 檔案
- 支援 `.xlsx` 和 `.xls` 格式

## 📋 Excel 檔案格式

### 必要欄位
Excel 檔案第一行必須包含以下欄位標題：

| 欄位名稱 | 說明 | 範例 |
|---------|------|------|
| **Model** | 產品型號 | RT-AX88U |
| Product_ID | 產品 ID | RT-AX88U |
| APLM_ID | APLM 識別碼 | APLM013 |
| FW_Path | 固件路徑 | \\\\server\\path\\ |

### 欄位對應規則
系統支援以下欄位名稱的變化：
- **Model**: Model, 型號, Product
- **Product_ID**: Product_ID, ProductID, ID
- **APLM_ID**: APLM_ID, APLM, APLM_ID
- **FW_Path**: FW_Path, FWPath, Path, Firmware_Path

## 🔍 除錯資訊

### Console 輸出範例

#### 成功載入
```
🔄 每次開啟都重新讀取最新的 DUT_List.xlsx...
📊 嘗試讀取 Excel 檔案...
🔍 搜尋 Excel 檔案的路徑: [12 個路徑]
📂 嘗試讀取: DUT_list.xlsx
✅ 成功從 DUT_list.xlsx 載入 30 個產品
✅ DUT 列表已成功載入: 30 個產品
```

#### 檔案不存在
```
📂 嘗試讀取: DUT_list.xlsx
❌ DUT_list.xlsx 讀取失敗: Failed to fetch
📂 嘗試讀取: data/DUT_list.xlsx
❌ data/DUT_list.xlsx 讀取失敗: Failed to fetch
...（嘗試所有路徑）
❌ Excel 讀取失敗: 無法找到或讀取 Excel 檔案
```

## ⚠️ 常見問題

### 1. 檔案載入失敗
**原因**: 
- Excel 檔案不在搜尋路徑中
- 檔案格式不正確
- 瀏覽器安全限制

**解決方案**:
- 確認檔案名稱為 `DUT_list.xlsx`
- 將檔案放在專案根目錄
- 使用 **📁 選擇 Excel 檔案** 手動上傳

### 2. 本地檔案存取限制
**原因**: 瀏覽器的 CORS 政策限制

**解決方案**:
- 使用本地 HTTP 服務器（如 Live Server）
- 或使用手動上傳功能

### 3. Excel 格式錯誤
**原因**: 缺少必要欄位或格式不正確

**解決方案**:
- 確保第一行包含 `Model` 欄位
- 檢查資料格式是否正確
- 查看 Console 的詳細錯誤訊息

## 🎉 進階功能

### 即時更新工作流程
1. 在其他程式中修改 `DUT_list.xlsx`
2. 回到瀏覽器，點擊 **🔄 重新載入**
3. 新資料立即生效，無需重新載入頁面

### 批次測試不同檔案
1. 準備多個版本的 Excel 檔案
2. 使用 **📁 選擇 Excel 檔案** 逐一測試
3. 比較不同資料集的載入效果

---

💡 **小貼士**: 建議將 `DUT_list.xlsx` 放在專案根目錄，這樣載入速度最快且最可靠。
