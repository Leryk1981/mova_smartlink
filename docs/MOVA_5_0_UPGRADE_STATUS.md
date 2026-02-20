# MOVA 5.0.0 Upgrade Status

## Goal

Upgrade SmartLink positioning and contracts to MOVA 5.0.0 compatibility without breaking production runtime paths.

## Applied

- Root project docs updated to MOVA 5.0 positioning:
  - `README.md`
  - `README.uk.md`
- SmartLink profile docs updated:
  - `mova4-smartlink/README.md`
  - `mova4-smartlink/docs/SMARTLINK_SPEC_5.0.md` (new current profile spec)
- Profile schema descriptions aligned to 5.0 compatibility:
  - `mova4-smartlink/schemas/*.json`
- Core/worker/landing public docs and metadata aligned:
  - `packages/core-smartlink/README.md`
  - `apps/smartlink-landing/README.md`
  - landing UI labels and metadata (`apps/smartlink-landing/*`)
- Worker runtime metadata updated:
  - `packages/worker-smartlink/src/handlers/resolve-mova4.ts`
  - `executor_version = 2.1.0-mova5`
- Worker guide for MOVA 5.0 added:
  - `packages/worker-smartlink/README_MOVA5.md`

## Compatibility policy

- Keep schema ids stable (`ds.smartlink_*_v1`, `env.smartlink_*_v1`).
- Keep existing folder/file names with `mova4` where already integrated.
- Treat `mova_4_0_0_spec/` and `SMARTLINK_SPEC_4.0.md` as historical archive.

## Next recommended step

- Add explicit schema validation job for `mova4-smartlink/schemas/` + `examples/` in CI, to make profile-level compatibility checks mandatory on every PR.
