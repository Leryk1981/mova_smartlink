@echo off
cd /d "%~dp0"
echo Compiling resolve.ts...
call npx tsc src/resolve.ts --outDir dist --declaration --declarationMap --sourceMap --module ESNext --target ES2022 --lib ES2022 --moduleResolution bundler 2>&1
echo.
echo Files created:
dir dist\resolve.* /b 2>nul
echo.
echo Checking imports in resolve.ts:
findstr /n "import" src\resolve.ts
