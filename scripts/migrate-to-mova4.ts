/**
 * Migration script: MOVA 3.6 → MOVA 4.0
 * 
 * Converts ds.smartlink_rules_v1 to ds.smartlink_config_v1
 * 
 * Modes:
 *   1. Single file:  tsx scripts/migrate-to-mova4.ts <input-file> <output-file>
 *   2. Batch:        tsx scripts/migrate-to-mova4.ts --batch <input-dir> <output-dir>
 *   3. KV migration: tsx scripts/migrate-to-mova4.ts --kv <input-kv-json> <output-kv-json>
 * 
 * Examples:
 *   tsx scripts/migrate-to-mova4.ts legacy/config.json mova4-smartlink/examples/config.json
 *   tsx scripts/migrate-to-mova4.ts --batch legacy/configs mova4-smartlink/examples/migrated
 *   tsx scripts/migrate-to-mova4.ts --kv legacy/kv-export.json mova4-smartlink/kv-import.json
 */

import { readFile, writeFile, readdir, mkdir, stat } from 'fs/promises';
import { resolve, join, basename, extname } from 'path';
import { validateConfig } from '../packages/core-smartlink/src/validators.js';
import type { SmartlinkConfig } from '../packages/core-smartlink/src/types-mova4.js';

// Legacy types (MOVA 3.6)
interface LegacyRule {
  id?: string;
  label?: string;
  priority?: number;
  enabled?: boolean;
  start_at?: string;
  end_at?: string;
  weight?: number;
  when: {
    country?: string | string[];
    lang?: string | string[];
    device?: string | string[];
    utm?: {
      source?: string | string[];
      campaign?: string | string[];
      medium?: string | string[];
      term?: string | string[];
      content?: string | string[];
    };
  };
  target: string;
}

interface LegacyConfig {
  link_id: string;
  purpose?: string;
  status: 'draft' | 'active' | 'archived';
  context_shape?: string[];
  rules: LegacyRule[];
  fallback_target: string;
  meta?: {
    version?: number;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    updated_by?: string;
  };
}

/**
 * Convert legacy config to MOVA 4.0 format
 */
function migrateLegacyConfig(legacy: LegacyConfig): SmartlinkConfig {
  // Map status: 'archived' → 'archived', others keep the same
  const status: 'draft' | 'active' | 'paused' | 'archived' =
    legacy.status === 'archived' ? 'archived' : legacy.status === 'draft' ? 'draft' : 'active';

  // Convert rules to targets
  const targets = legacy.rules.map((rule, index) => {
    return {
      target_id: rule.id || `target_${index}`,
      url: rule.target,
      label: rule.label,
      conditions: {
        country: rule.when.country,
        language: rule.when.lang, // lang → language
        device: rule.when.device as any, // Type cast for device
        utm: rule.when.utm,
      },
      priority: rule.priority,
      enabled: rule.enabled !== false, // Default true
      valid_from: rule.start_at,
      valid_until: rule.end_at,
    };
  });

  // Add fallback target if not in rules
  const fallbackExists = targets.some((t) => t.target_id === 'fallback' || t.url === legacy.fallback_target);

  if (!fallbackExists) {
    targets.push({
      target_id: 'fallback',
      url: legacy.fallback_target,
      label: 'Fallback',
      conditions: {},
      priority: 9999,
      enabled: true,
    });
  }

  return {
    smartlink_id: legacy.link_id,
    name: legacy.purpose,
    status,
    targets,
    default_target_id: 'fallback',
    meta: legacy.meta,
  };
}

/**
 * Main migration function (single file)
 */
async function migrate(inputPath: string, outputPath: string): Promise<boolean> {
  console.log(`Migrating: ${inputPath} → ${outputPath}`);

  try {
    // Read legacy config
    const inputFile = await readFile(resolve(inputPath), 'utf-8');
    const legacyConfig: LegacyConfig = JSON.parse(inputFile);

    console.log(`  Legacy config: ${legacyConfig.link_id} (${legacyConfig.rules.length} rules)`);

    // Convert to MOVA 4.0
    const mova4Config = migrateLegacyConfig(legacyConfig);

    console.log(`  MOVA 4.0 config: ${mova4Config.smartlink_id} (${mova4Config.targets.length} targets)`);

    // Validate
    const validation = validateConfig(mova4Config);

    if (!validation.ok) {
      console.error('❌ Validation failed:');
      validation.error.forEach((err) => {
        console.error(`  - ${err.path}: ${err.message}`);
      });
      return false;
    }

    console.log('✅ Validation passed');

    // Write output
    await writeFile(
      resolve(outputPath),
      JSON.stringify(mova4Config, null, 2),
      'utf-8'
    );

    console.log(`✅ Migration complete: ${outputPath}`);
    console.log();
    console.log('Summary:');
    console.log(`  - SmartLink ID: ${mova4Config.smartlink_id}`);
    console.log(`  - Status: ${mova4Config.status}`);
    console.log(`  - Targets: ${mova4Config.targets.length}`);
    console.log(`  - Default target: ${mova4Config.default_target_id}`);

    // Report any warnings
    const warnings: string[] = [];

    if (!mova4Config.name) {
      warnings.push('No name specified (optional)');
    }

    if (!mova4Config.description) {
      warnings.push('No description specified (optional)');
    }

    if (warnings.length > 0) {
      console.log();
      console.log('Warnings:');
      warnings.forEach((w) => console.log(`  ⚠️  ${w}`));
    }

    return true;
  } catch (error) {
    console.error(`❌ Error migrating ${inputPath}:`, error);
    return false;
  }
}

/**
 * Batch migration (directory)
 */
async function migrateBatch(inputDir: string, outputDir: string): Promise<void> {
  console.log(`\n📦 Batch migration: ${inputDir} → ${outputDir}\n`);

  // Ensure output directory exists
  await mkdir(resolve(outputDir), { recursive: true });

  // Read input directory
  const files = await readdir(resolve(inputDir));
  const jsonFiles = files.filter((f) => extname(f) === '.json');

  console.log(`Found ${jsonFiles.length} JSON files\n`);

  let successCount = 0;
  let failCount = 0;

  for (const file of jsonFiles) {
    const inputPath = join(inputDir, file);
    const outputPath = join(outputDir, file);

    const success = await migrate(inputPath, outputPath);

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    console.log('---\n');
  }

  console.log('\n📊 Batch Migration Summary:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log(`  📁 Total: ${jsonFiles.length}`);
}

/**
 * KV migration (simulate KV export/import)
 */
async function migrateKV(inputKVPath: string, outputKVPath: string): Promise<void> {
  console.log(`\n🗄️  KV migration: ${inputKVPath} → ${outputKVPath}\n`);

  // Read KV export (format: { "key": value, ... })
  const kvExport = JSON.parse(await readFile(resolve(inputKVPath), 'utf-8'));

  const migrated: Record<string, any> = {};
  let successCount = 0;
  let failCount = 0;

  for (const [key, value] of Object.entries(kvExport)) {
    console.log(`Migrating KV key: ${key}`);

    try {
      // Parse value (assuming it's wrapped in { core: ... } or direct config)
      let legacyConfig: LegacyConfig;

      if (typeof value === 'object' && value !== null && 'core' in value) {
        legacyConfig = (value as any).core;
      } else {
        legacyConfig = value as LegacyConfig;
      }

      // Convert
      const mova4Config = migrateLegacyConfig(legacyConfig);

      // Validate
      const validation = validateConfig(mova4Config);

      if (!validation.ok) {
        console.error(`  ❌ Validation failed for ${key}`);
        failCount++;
        continue;
      }

      // Store with new key format: config:{smartlink_id}
      const newKey = `config:${mova4Config.smartlink_id}`;
      migrated[newKey] = {
        config: mova4Config,
        meta: {
          updated_at: new Date().toISOString(),
          version: mova4Config.meta?.version || 1,
          migrated_from: key,
        },
      };

      console.log(`  ✅ Migrated to ${newKey}`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Error: ${error}`);
      failCount++;
    }
  }

  // Write output
  await writeFile(
    resolve(outputKVPath),
    JSON.stringify(migrated, null, 2),
    'utf-8'
  );

  console.log(`\n✅ KV migration complete: ${outputKVPath}`);
  console.log('\n📊 KV Migration Summary:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log(`  🔑 Total keys: ${Object.keys(kvExport).length}`);
}

// CLI
const args = process.argv.slice(2);

async function main() {
  if (args.length === 0) {
    console.error('Usage:');
    console.error('  Single file:  tsx scripts/migrate-to-mova4.ts <input-file> <output-file>');
    console.error('  Batch:        tsx scripts/migrate-to-mova4.ts --batch <input-dir> <output-dir>');
    console.error('  KV migration: tsx scripts/migrate-to-mova4.ts --kv <input-kv-json> <output-kv-json>');
    console.error();
    console.error('Examples:');
    console.error('  tsx scripts/migrate-to-mova4.ts \\');
    console.error('    legacy/config.json mova4-smartlink/examples/config.json');
    console.error();
    console.error('  tsx scripts/migrate-to-mova4.ts --batch \\');
    console.error('    legacy/configs mova4-smartlink/examples/migrated');
    console.error();
    console.error('  tsx scripts/migrate-to-mova4.ts --kv \\');
    console.error('    legacy/kv-export.json mova4-smartlink/kv-import.json');
    process.exit(1);
  }

  const mode = args[0];

  if (mode === '--batch') {
    if (args.length !== 3) {
      console.error('Error: --batch mode requires <input-dir> <output-dir>');
      process.exit(1);
    }
    await migrateBatch(args[1], args[2]);
  } else if (mode === '--kv') {
    if (args.length !== 3) {
      console.error('Error: --kv mode requires <input-kv-json> <output-kv-json>');
      process.exit(1);
    }
    await migrateKV(args[1], args[2]);
  } else {
    // Single file mode
    if (args.length !== 2) {
      console.error('Error: Single file mode requires <input-file> <output-file>');
      process.exit(1);
    }
    const success = await migrate(args[0], args[1]);
    if (!success) {
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
