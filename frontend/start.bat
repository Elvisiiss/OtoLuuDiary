@echo off
REM Start OtoLuuDiary frontend
REM Fix ELECTRON_RUN_AS_NODE env issue
set ELECTRON_RUN_AS_NODE=
cd /d "%~dp0"
node_modules\electron\dist\electron.exe --disable-gpu .
