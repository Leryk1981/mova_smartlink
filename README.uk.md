# SmartLink — MOVA 4.0 Smart Links (UA)

**Статус:** Активний | **Призначення:** Смарт-посилання на основі MOVA 4.0.0 з маршрутизацією за країною, пристроєм, мовою та UTM.

## Швидкий старт локально
- Вимоги: Node >=18, npm >=9.
- Встановлення залежностей: `npm ci`
- Перевірка: `npm test`
- Збірка: `npm run build`
- Лінт (за бажанням): `npm run lint`
- Дев-сервери:
  - Worker: `npm run dev --workspace=packages/worker-smartlink`
  - Admin SPA: `npm run dev --workspace=packages/spa-admin`

## Ключові посилання
- README (EN): `README.md`
- MOVA 4.0.0 схеми та приклади: `mova4-smartlink/` (`schemas/`, `examples/`, `docs/SMARTLINK_SPEC_4.0.md`).
- Деплой: `QUICK_START_DEPLOYMENT.md`, `docs/CLOUDFLARE_PAGES_SETUP.md`.
- Примітка: пакет `@leryk1981/mova-spec@4.1.1` недоступний з цього середовища (npm 403), використовуються вбудовані артефакти.
