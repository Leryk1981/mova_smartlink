# SmartLink — MOVA 5.0 Smart Links (UA)

**Статус:** Активний | **Призначення:** Смарт-посилання на основі MOVA 5.0.0-сумісних контрактів з маршрутизацією за країною, пристроєм, мовою та UTM.

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
- SmartLink схеми та приклади: `mova4-smartlink/` (`schemas/`, `examples/`, `docs/SMARTLINK_SPEC_5.0.md`).
- Канонічне MOVA core: `https://github.com/mova-compact/mova-spec` (v5.0.0).
- Ім'я папки `mova4-smartlink/` залишено для сумісності існуючих інтеграцій.
- Деплой: `QUICK_START_DEPLOYMENT.md`, `docs/CLOUDFLARE_PAGES_SETUP.md`.
- Локальний `mova_4_0_0_spec/` збережено як історичний архів.
