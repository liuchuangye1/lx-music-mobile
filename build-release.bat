@echo off
chcp 65001 >nul
REM ============================================
REM 一键打正式包（release APK）
REM 用法：
REM   build-release.bat            只打包
REM   build-release.bat install    打包并安装到已连接的设备（arm64-v8a）
REM 说明：
REM   - 本文件必须保存为 UTF-8 编码（开头已 chcp 65001）
REM   - release 构建由 Gradle 自动打 JS bundle（dev=false），无需手动 npm run bundle-android
REM   - 签名读取 android\keystore.properties（缺失时构建会在配置阶段报错，此处提前提示）
REM ============================================
setlocal
cd /d "%~dp0"

if not exist "android\keystore.properties" (
    echo [ERROR] missing android\keystore.properties
    exit /b 1
)

if not exist "node_modules" (
    echo [INFO] node_modules not found, running npm install ...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed
        exit /b 1
    )
)

echo [1/2] building release APK ...
cd android
call gradlew.bat assembleRelease
if errorlevel 1 (
    echo [ERROR] build failed
    exit /b 1
)
cd ..

echo.
echo [2/2] build OK, APK output in android\app\build\outputs\apk\release\ :
for %%f in ("android\app\build\outputs\apk\release\*.apk") do echo   %%f

if /i "%~1"=="install" (
    echo.
    echo installing arm64-v8a APK to connected device ...
    set "FOUND="
    for %%f in ("android\app\build\outputs\apk\release\*arm64-v8a.apk") do (
        set "FOUND=1"
        adb install -r "%%f"
    )
    if not defined FOUND (
        echo [ERROR] arm64-v8a APK not found
        exit /b 1
    )
)

endlocal
