@echo off
title Firmware Release Workflow - 本地伺服器
echo ========================================
echo   Firmware Release Workflow Server
echo ========================================
echo.
echo 正在啟動本地HTTP伺服器...
echo 伺服器地址: http://localhost:8000
echo 主頁面: http://localhost:8000/index.html
echo.
echo 🎯 享受完整的模組化功能：
echo   ✅ DUT_list 動態載入
echo   ✅ 智能固件搜尋  
echo   ✅ 即時預覽驗證
echo   ✅ 模組化維護
echo.
echo 💡 提示: 修改 pages/*.html 檔案後，重新整理瀏覽器即可看到更新
echo 🛑 按 Ctrl+C 停止伺服器
echo ========================================
echo.

REM 檢查是否有Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo 使用Python啟動伺服器...
    echo.
    echo 🌐 伺服器啟動後，請在瀏覽器中訪問：
    echo    👉 http://localhost:8000/index.html
    echo.
    echo 💡 或者伺服器啟動成功後，按任意鍵自動開啟瀏覽器
    echo.
    start "Python HTTP Server" python -m http.server 8000
    timeout /t 3 /nobreak >nul
    start "" "http://localhost:8000/index.html"
) else (
    REM 檢查是否有Node.js
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo 使用Node.js啟動伺服器...
        echo.
        echo 🌐 伺服器啟動後，請在瀏覽器中訪問：
        echo    👉 http://localhost:8000/index.html
        echo.
        start "Node.js HTTP Server" npx http-server -p 8000
        timeout /t 3 /nobreak >nul
        start "" "http://localhost:8000/index.html"
    ) else (
        echo 錯誤: 未找到Python或Node.js
        echo 請安裝Python或Node.js後再執行此腳本
        pause
    )
)
