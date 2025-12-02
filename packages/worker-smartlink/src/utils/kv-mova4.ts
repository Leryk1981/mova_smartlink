/**
 * KV utilities for MOVA 4.0 data structures
 */

import type {
  SmartlinkConfig,
  SmartlinkResolutionEpisode,
} from '@mova/core-smartlink';

/**
 * KV key prefix for configs
 */
const CONFIG_PREFIX = 'config:';

/**
 * KV key prefix for episodes
 */
const EPISODE_PREFIX = 'episode:';

/**
 * Get SmartLink configuration from KV
 * @param kv - KV namespace
 * @param smartlinkId - SmartLink ID or full key
 * @returns Config or null if not found
 */
export async function getSmartlinkConfig(
  kv: KVNamespace,
  smartlinkId: string
): Promise<SmartlinkConfig | null> {
  const key = smartlinkId.startsWith(CONFIG_PREFIX)
    ? smartlinkId
    : `${CONFIG_PREFIX}${smartlinkId}`;

  const value = await kv.get(key, 'json');

  if (!value) {
    return null;
  }

  // Value is stored as { config, meta }
  if (value && typeof value === 'object' && 'config' in value) {
    return value.config as SmartlinkConfig;
  }

  // Fallback: value is the config itself
  return value as SmartlinkConfig;
}

/**
 * Save SmartLink configuration to KV
 * @param kv - KV namespace
 * @param config - SmartLink config
 */
export async function saveSmartlinkConfig(
  kv: KVNamespace,
  config: SmartlinkConfig
): Promise<void> {
  const key = `${CONFIG_PREFIX}${config.smartlink_id}`;

  const value = {
    config,
    meta: {
      updated_at: new Date().toISOString(),
      version: config.meta?.version || 1,
    },
  };

  await kv.put(key, JSON.stringify(value));
}

/**
 * Delete SmartLink configuration from KV
 * @param kv - KV namespace
 * @param smartlinkId - SmartLink ID
 */
export async function deleteSmartlinkConfig(
  kv: KVNamespace,
  smartlinkId: string
): Promise<void> {
  const key = `${CONFIG_PREFIX}${smartlinkId}`;
  await kv.delete(key);
}

/**
 * Save episode to KV
 * Episodes are stored with expiration (e.g., 90 days)
 * 
 * @param kv - KV namespace
 * @param episode - Resolution episode
 */
export async function saveEpisode(
  kv: KVNamespace,
  episode: SmartlinkResolutionEpisode
): Promise<void> {
  const key = `${EPISODE_PREFIX}${episode.episode_id}`;

  // Store with TTL (90 days = 7776000 seconds)
  const ttl = 90 * 24 * 60 * 60;

  await kv.put(key, JSON.stringify(episode), {
    expirationTtl: ttl,
  });
}

/**
 * Get episode from KV
 * @param kv - KV namespace
 * @param episodeId - Episode ID
 * @returns Episode or null if not found
 */
export async function getEpisode(
  kv: KVNamespace,
  episodeId: string
): Promise<SmartlinkResolutionEpisode | null> {
  const key = episodeId.startsWith(EPISODE_PREFIX)
    ? episodeId
    : `${EPISODE_PREFIX}${episodeId}`;

  const value = await kv.get(key, 'json');

  if (!value) {
    return null;
  }

  return value as SmartlinkResolutionEpisode;
}

/**
 * List recent episodes for a smartlink
 * Note: KV list operations are eventually consistent
 * 
 * @param kv - KV namespace
 * @param smartlinkId - SmartLink ID to filter by
 * @param limit - Max number of episodes to return
 * @returns Array of episodes
 */
export async function listEpisodes(
  kv: KVNamespace,
  smartlinkId?: string,
  limit = 100
): Promise<SmartlinkResolutionEpisode[]> {
  const episodes: SmartlinkResolutionEpisode[] = [];

  // List keys with episode prefix
  const keys = await kv.list({ prefix: EPISODE_PREFIX, limit });

  // Fetch episodes
  for (const key of keys.keys) {
    const episode = await getEpisode(kv, key.name);
    if (episode) {
      // Filter by smartlink_id if provided
      if (smartlinkId) {
        const input = 'ref' in episode.input ? null : episode.input;
        if (input && input.smartlink_id === smartlinkId) {
          episodes.push(episode);
        }
      } else {
        episodes.push(episode);
      }
    }
  }

  // Sort by timestamp (descending)
  episodes.sort((a, b) => {
    return new Date(b.timestamp_start).getTime() - new Date(a.timestamp_start).getTime();
  });

  return episodes;
}
