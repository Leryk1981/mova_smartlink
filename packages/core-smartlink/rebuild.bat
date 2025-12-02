@echo off
cd /d "%~dp0"
if exist dist rmdir /s /q dist
if exist tsconfig.tsbuildinfo del /f /q tsconfig.tsbuildinfo  
call npx tsc
dir dist\*.js /b
