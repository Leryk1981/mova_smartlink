# Инструкция по исправлению сборки SmartLink

## Проблема

Worker имеет 48 ошибок TypeScript потому что не находит экспорты из `@mova/core-smartlink`.

Причина: в `packages/core-smartlink/dist/` отсутствуют скомпилированные MOVA 4.0 файлы.

## Решение

### Шаг 1: Пересоберите core-smartlink

Откройте PowerShell и выполните:

```powershell
cd D:\Projects_Clean\mova_smartlink\packages\core-smartlink
.\REBUILD.ps1
```

Этот скрипт:
1. Очистит dist/
2. Запустит TypeScript компилятор
3. Покажет что было создано

### Шаг 2: Проверьте результат

После сборки в `dist/` должны быть файлы:
- `index.js` + `index.d.ts`
- `types.js` + `types.d.ts` (legacy)
- `evaluate.js` + `evaluate.d.ts` (legacy)
- **`types-mova4.js` + `types-mova4.d.ts`** ← ВАЖНО!
- **`validators.js` + `validators.d.ts`** ← ВАЖНО!
- **`resolve.js` + `resolve.d.ts`** ← ВАЖНО!
- **`stats.js` + `stats.d.ts`** ← ВАЖНО!

Если их нет - TypeScript не компилирует новые файлы.

### Шаг 3: Проверьте worker

```powershell
cd D:\Projects_Clean\mova_smartlink\packages\worker-smartlink
npm run lint
```

Ошибок должно стать меньше или не быть вообще.

## Если сборка не работает

### Вариант A: Проверьте ошибки TypeScript

```powershell
cd D:\Projects_Clean\mova_smartlink\packages\core-smartlink
npx tsc --noEmit
```

Если есть ошибки - покажите мне вывод.

### Вариант B: Проверьте зависимости

```powershell
npm ls ajv
npm ls ajv-formats
```

Если пакеты не установлены:

```powershell
npm install
```

### Вариант C: Ручная компиляция

Если ничего не помогает, скомпилируйте файлы по одному:

```powershell
npx tsc src/types-mova4.ts --outDir dist --declaration
npx tsc src/validators.ts --outDir dist --declaration  
npx tsc src/resolve.ts --outDir dist --declaration
npx tsc src/stats.ts --outDir dist --declaration
npx tsc src/index.ts --outDir dist --declaration
```

## После успешной сборки

1. Проверьте worker: `npm run lint` (должно быть 0 ошибок)
2. Запустите тесты core: `npm test`
3. Запустите тесты worker: `npm test`

## Нужна помощь?

Пришлите мне вывод команды:

```powershell
cd D:\Projects_Clean\mova_smartlink\packages\core-smartlink
npx tsc > build-output.txt 2>&1
Get-Content build-output.txt
```
