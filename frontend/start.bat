@echo off
REM 启动欧托留日记前端
REM 解决 ELECTRON_RUN_AS_NODE 环境变量问题
set ELECTRON_RUN_AS_NODE=
cd /d "%~dp0"
node_modules\electron\dist\electron.exe --disable-gpu .
