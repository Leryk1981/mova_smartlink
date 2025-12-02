@echo off
cd /d "%~dp0"

echo Cleaning dist...
if exist dist rmdir /s /q dist
mkdir dist

echo.
echo Compiling all TypeScript files...
call npx tsc src/types.ts src/evaluate.ts src/types-mova4.ts src/validators.ts src/resolve.ts src/stats.ts src/index.ts --outDir dist --declaration --declarationMap --sourceMap --module ESNext --target ES2022 --lib ES2022 --moduleResolution bundler --skipLibCheck

echo.
echo Files in dist:
dir dist\*.js /b

echo.
echo Content of dist/index.js:
type dist\index.js
