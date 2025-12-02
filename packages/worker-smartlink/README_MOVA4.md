# Worker SmartLink — MOVA 4.0 Implementation Guide

**Status:** 🚧 IN PROGRESS (Partial implementation for SL-EXEC-4.0)

This document describes the MOVA 4.0 implementation for SmartLink Worker.

## Architecture

The worker implements **Layer 1 (Executors)** in MOVA 4.0 architecture:

```
┌─────────────────────────────────────────┐
│  MOVA Layer (L2)                        │
│  - Schemas: mova4-smartlink/schemas/    │
│  - No execution                         │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│  Worker (L1) ← THIS PACKAGE             │
│  - HTTP endpoints                       │
│  - Envelope validation                  │
│  - Episode recording                    │
│  - Calls core-smartlink                 │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│  Storage (L0)                           │
│  - Cloudflare KV                        │
│  - D1 (optional, for episodes)          │
└─────────────────────────────────────────┘
```

## MOVA 4.0 Endpoints

### POST /smartlink/resolve

Implements `env.smartlink_resolve_v1` envelope.

**Request:**
```json
{
  "envelope_id": "env.smartlink_resolve_v1",
  "verb": "route",
  "correlation_id": "req_123",
  "roles": {
    "requester": "edge-worker",
    "executor": "smartlink-worker-v1"
  },
  "payload": {
    "input": {
      "smartlink_id": "spring_sale_2026",
      "timestamp": "2026-03-15T14:23:45.123Z",
      "country": "DE",
      "device": "mobile",
      "utm": {
        "source": "tiktok"
      }
    },
    "config": {
      "config_ref": "kv://smartlink_configs/spring_sale_2026"
    }
  },
  "meta": {
    "timestamp": "2026-03-15T14:23:45.100Z",
    "request_id": "req_123"
  }
}
```

**Response:**
```json
{
  "envelope_id": "env.smartlink_resolve_v1",
  "verb": "route",
  "correlation_id": "req_123",
  "roles": {
    "requester": "edge-worker",
    "executor": "smartlink-worker-v1"
  },
  "payload": {
    "input": { /* same as request */ },
    "config": { /* ... */ },
    "output": {
      "smartlink_id": "spring_sale_2026",
      "resolved_target_id": "de_tiktok_mobile",
      "resolved_url": "https://example.de/spring/mobile-funnel",
      "outcome": "OK",
      "reason": "Matched target based on country=DE, device=mobile, utm.source=tiktok",
      "matched_conditions": {
        "country": true,
        "device": true,
        "utm": true
      },
      "latency_ms": 12.4,
      "executor_id": "worker-prod",
      "executor_version": "2.0.0-mova4"
    }
  },
  "meta": {
    "timestamp": "2026-03-15T14:23:45.127Z",
    "request_id": "req_123"
  }
}
```

**Side effects:**
- Creates and saves `ds.episode_smartlink_resolution_v1` to KV

### POST /smartlink/stats

Implements `env.smartlink_stats_get_v1` envelope.

**Request:**
```json
{
  "envelope_id": "env.smartlink_stats_get_v1",
  "verb": "get",
  "correlation_id": "stats_req_123",
  "roles": {
    "requester": "admin-spa",
    "executor": "smartlink-worker-v1"
  },
  "payload": {
    "input": {
      "smartlink_id": "spring_sale_2026",
      "time_range": {
        "from": "2026-03-01T00:00:00Z",
        "to": "2026-03-31T23:59:59Z"
      },
      "group_by": ["target_id", "country"]
    }
  }
}
```

**Response:** (Envelope with `output` containing `ds.smartlink_stats_report_v1`)

## Legacy Endpoints (MOVA 3.6)

These endpoints are kept for backwards compatibility:

- `GET /s/:linkId` — Public redirect (uses legacy evaluate())
- `GET /api/smartlinks/:linkId` — Get config
- `PUT /api/smartlinks/:linkId` — Update config
- `DELETE /api/smartlinks/:linkId` — Delete config

## Implementation Status

### ✅ Completed (SL-EXEC-1)

- Core library updated to MOVA 4.0
- Types, validators, resolveSmartlink()
- Statistics functions

### 🚧 In Progress (SL-EXEC-2)

**Completed:**
- ✅ `handlers/resolve-mova4.ts` — Basic resolve handler
- ✅ `utils/kv-mova4.ts` — KV utilities for configs and episodes

**TODO:**
- [ ] Add `handlers/stats-mova4.ts` — Stats endpoint
- [ ] Update `index.ts` — Register MOVA 4.0 routes
- [ ] Add D1 integration for episodes (optional, better than KV for querying)
- [ ] Add envelope validation middleware
- [ ] Add integration tests
- [ ] Update wrangler.toml for new bindings

### ⏳ Not Started

- SL-EXEC-3: Admin SPA updates
- SL-EXEC-4: Migration tools

## KV Structure (MOVA 4.0)

### Configs

**Key:** `config:{smartlink_id}`  
**Value:**
```json
{
  "config": { /* ds.smartlink_config_v1 */ },
  "meta": {
    "updated_at": "2026-03-15T10:00:00Z",
    "version": 3
  }
}
```

### Episodes

**Key:** `episode:{episode_id}`  
**Value:** `ds.episode_smartlink_resolution_v1`  
**TTL:** 90 days

## Next Steps

### Complete SL-EXEC-2

1. **Stats handler**
   - Create `handlers/stats-mova4.ts`
   - Implement envelope handling
   - Call `buildStatsReport()` from core
   - Query episodes from KV or D1

2. **Update main router**
   - Add MOVA 4.0 routes to `index.ts`
   - Add validation middleware

3. **Testing**
   - Integration tests for resolve endpoint
   - Test episode recording
   - Test stats endpoint

4. **Documentation**
   - API examples
   - Deployment guide
   - Migration from legacy endpoints

### D1 for Episodes (Recommended)

KV is not ideal for querying episodes. Consider D1:

```sql
CREATE TABLE episodes (
  episode_id TEXT PRIMARY KEY,
  smartlink_id TEXT NOT NULL,
  timestamp_start TEXT NOT NULL,
  outcome TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON blob
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_smartlink_time ON episodes(smartlink_id, timestamp_start DESC);
CREATE INDEX idx_outcome ON episodes(outcome);
```

This enables efficient queries for statistics.

## References

- [Core Library README](../core-smartlink/README.md)
- [MOVA 4.0 Spec](../../mova4-smartlink/docs/SMARTLINK_SPEC_4.0.md)
- [Task SL-EXEC-4.0](../../docs/TASKS_SMARTLINK_V1.md)

---

**Version:** 2.0.0-mova4 (in progress)  
**Task:** SL-EXEC-4.0 (partial)
