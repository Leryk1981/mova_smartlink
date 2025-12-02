/**
 * KV storage helpers for SmartlinkCore
 */

import type { SmartlinkCore } from '@mova/core-smartlink/runtime';
import type { KVSmartlinkValue } from '../types.js';

/**
 * Generate KV key for a link_id
 */
export function makeKVKey(linkId: string): string {
  return `link:${linkId}`;
}

/**
 * Get SmartlinkCore from KV by link_id
 */
export async function getSmartlinkCore(
  kv: KVNamespace,
  linkId: string
): Promise<SmartlinkCore | null> {
  const key = makeKVKey(linkId);
  const value = await kv.get<KVSmartlinkValue>(key, 'json');
  
  if (!value) return null;
  
  return value.core;
}

/**
 * Save SmartlinkCore to KV
 */
export async function saveSmartlinkCore(
  kv: KVNamespace,
  core: SmartlinkCore
): Promise<void> {
  const key = makeKVKey(core.link_id);
  
  const value: KVSmartlinkValue = {
    core,
    updated_at: new Date().toISOString(),
  };
  
  await kv.put(key, JSON.stringify(value));
}

/**
 * Delete SmartlinkCore from KV
 */
export async function deleteSmartlinkCore(
  kv: KVNamespace,
  linkId: string
): Promise<void> {
  const key = makeKVKey(linkId);
  await kv.delete(key);
}

