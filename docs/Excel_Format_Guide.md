# DUT_list.xlsx 檔案格式說明

## 📊 Excel 檔案結構

您的 DUT_list.xlsx 應該包含以下欄位作為第一行（標題行）：

| A列 | B列 | C列 | D列 |
|-----|-----|-----|-----|
| Model | Product_ID | APLM_ID | FW_Path |

## 📝 範例資料

| Model | Product_ID | APLM_ID | FW_Path |
|-------|------------|---------|---------|
| RT-AX88U | RT-AX88U | APLM013 | \\\\APZA001NFS\\New-Public\\FW\\RT-AX88U\\ |
| GT-AXE16000 | GT-AXE16000 | APLM008 | \\\\APZA001NFS\\New-Public\\FW\\GT-AXE16000\\ |
| EBM68 | EBM68 | APLM001 | \\\\APZA001NFS\\New-Public\\FW\\EBM68\\ |

## 🔧 欄位說明

- **Model**: 產品型號，會顯示在下拉選單中
- **Product_ID**: 產品識別碼，通常與 Model 相同
- **APLM_ID**: APLM 系統的產品 ID
- **FW_Path**: 固件檔案的網路路徑

## 📁 檔案放置位置

將 DUT_list.xlsx 放在以下任一位置：
- 專案根目錄: `DUT_list.xlsx`
- data 資料夾: `data/DUT_list.xlsx`
- 上層目錄: `../DUT_list.xlsx`

## ⚠️ 注意事項

1. 第一行必須是標題行
2. 檔案格式必須是 .xlsx（不支援 .xls）
3. 確保沒有空白行在資料中間
4. FW_Path 路徑請使用雙反斜線 `\\\\`
