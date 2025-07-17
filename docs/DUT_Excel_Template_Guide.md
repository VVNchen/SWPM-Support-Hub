# DUT_list.xlsx Excel 檔案範本

## 📋 必要欄位結構

請確保您的 Excel 檔案包含以下欄位（第一行必須是標題行）：

| A 列 | B 列 | C 列 | D 列 |
|------|------|------|------|
| **Model** | **Product_ID** | **APLM_ID** | **FW_Path** |

## 📊 範例資料

| Model | Product_ID | APLM_ID | FW_Path |
|-------|------------|---------|---------|
| RT-AX88U | RT-AX88U | APLM013 | \\\\APZA001NFS\\New-Public\\FW\\RT-AX88U\\ |
| GT-AXE16000 | GT-AXE16000 | APLM008 | \\\\APZA001NFS\\New-Public\\FW\\GT-AXE16000\\ |
| EBM68 | EBM68 | APLM001 | \\\\APZA001NFS\\New-Public\\FW\\EBM68\\ |
| RT-AX86U | RT-AX86U | APLM012 | \\\\APZA001NFS\\New-Public\\FW\\RT-AX86U\\ |

## ⚠️ 重要注意事項

1. **第一行必須是標題行**：Model, Product_ID, APLM_ID, FW_Path
2. **檔案格式**：必須是 .xlsx 格式
3. **檔案名稱**：必須是 `DUT_list.xlsx`
4. **路徑格式**：FW_Path 請使用雙反斜線 `\\\\`
5. **不可有空白行**：資料區域中間不能有空白行

## 📍 檔案放置位置

建議放在專案根目錄：
```
📁 0710Tool Box/
├── 📄 DUT_list.xlsx          ← 在這裡
├── 📁 pages/
│   └── 📁 firmware/
│       └── 📄 redmine.html
```

## 🔄 更新流程

1. 在 Excel 中修改 `DUT_list.xlsx`
2. 儲存檔案
3. 切換到其他瀏覽器 Tab 再回來，或點擊 🔄 重新載入
4. 系統會自動讀取最新資料並更新產品列表

---

💡 **建議**：可以將現有的 JSON 資料轉換為 Excel 格式，或使用此範本建立新的產品資料檔案。
