/**
 * Statistics aggregation for SmartLink MOVA 4.0.0
 * 
 * Pure functions to build ds.smartlink_stats_report_v1 from episodes/clicks
 */

import type {
  SmartlinkStatsQuery,
  SmartlinkStatsReport,
  SmartlinkResolutionEpisode,
  StatsSummary,
  StatsRow,
  StatsGroupBy,
} from './types-mova4.js';

/**
 * Extract dimension value from episode
 */
function getDimensionValue(episode: SmartlinkResolutionEpisode, dimension: StatsGroupBy): string {
  // Handle input reference vs inline
  const input =
    'ref' in episode.input ? null : episode.input;

  // Handle output reference vs inline
  const output =
    episode.output && typeof episode.output === 'object' && 'ref' in episode.output
      ? null
      : episode.output;

  switch (dimension) {
    case 'target_id':
      return output?.resolved_target_id || 'unknown';

    case 'country':
      return input?.country || 'unknown';

    case 'device':
      return input?.device || 'unknown';

    case 'utm_source':
      return input?.utm?.source || 'unknown';

    case 'utm_campaign':
      return input?.utm?.campaign || 'unknown';

    case 'outcome':
      return output?.outcome || 'unknown';

    case 'hour': {
      const date = new Date(episode.timestamp_start);
      return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
        date.getUTCDate()
      ).padStart(2, '0')}T${String(date.getUTCHours()).padStart(2, '0')}:00:00Z`;
    }

    case 'day': {
      const date = new Date(episode.timestamp_start);
      return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
        2,
        '0'
      )}-${String(date.getUTCDate()).padStart(2, '0')}`;
    }

    default:
      return 'unknown';
  }
}

/**
 * Check if episode matches filters
 */
function matchesFilters(episode: SmartlinkResolutionEpisode, query: SmartlinkStatsQuery): boolean {
  if (!query.filters) return true;

  const input =
    'ref' in episode.input ? null : episode.input;

  const output =
    episode.output && typeof episode.output === 'object' && 'ref' in episode.output
      ? null
      : episode.output;

  const { filters } = query;

  // Target ID filter
  if (filters.target_id) {
    const targetIds = Array.isArray(filters.target_id)
      ? filters.target_id
      : [filters.target_id];
    if (!output || !targetIds.includes(output.resolved_target_id || '')) {
      return false;
    }
  }

  // Country filter
  if (filters.country) {
    const countries = Array.isArray(filters.country) ? filters.country : [filters.country];
    if (!input || !countries.includes(input.country || '')) {
      return false;
    }
  }

  // Device filter
  if (filters.device) {
    const devices = Array.isArray(filters.device) ? filters.device : [filters.device];
    if (!input || !devices.includes(input.device || '')) {
      return false;
    }
  }

  // Outcome filter
  if (filters.outcome) {
    const outcomes = Array.isArray(filters.outcome) ? filters.outcome : [filters.outcome];
    if (!output || !outcomes.includes(output.outcome)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if episode is in time range
 */
function inTimeRange(episode: SmartlinkResolutionEpisode, query: SmartlinkStatsQuery): boolean {
  if (!query.time_range) return true;

  const episodeTime = new Date(episode.timestamp_start).getTime();
  const from = new Date(query.time_range.from).getTime();
  const to = new Date(query.time_range.to).getTime();

  return episodeTime >= from && episodeTime <= to;
}

/**
 * Build statistics report from episodes
 * 
 * @param episodes - Array of resolution episodes
 * @param query - Statistics query (filters, grouping, etc.)
 * @returns Statistics report (ds.smartlink_stats_report_v1)
 */
export function buildStatsReport(
  episodes: SmartlinkResolutionEpisode[],
  query: SmartlinkStatsQuery
): SmartlinkStatsReport {
  const startTime = Date.now();

  // Filter episodes
  const filteredEpisodes = episodes.filter((ep) => {
    // SmartLink ID filter
    if (query.smartlink_id) {
      const input = 'ref' in ep.input ? null : ep.input;
      if (!input || input.smartlink_id !== query.smartlink_id) {
        return false;
      }
    }

    // Time range filter
    if (!inTimeRange(ep, query)) {
      return false;
    }

    // Additional filters
    if (!matchesFilters(ep, query)) {
      return false;
    }

    return true;
  });

  // Calculate summary
  const summary: StatsSummary = {
    total_clicks: filteredEpisodes.length,
    successful_redirects: filteredEpisodes.filter((ep) => {
      const output =
        ep.output && typeof ep.output === 'object' && 'ref' in ep.output
          ? null
          : ep.output;
      return output && (output.outcome === 'OK' || output.outcome === 'DEFAULT_USED');
    }).length,
    errors: filteredEpisodes.filter((ep) => {
      const output =
        ep.output && typeof ep.output === 'object' && 'ref' in ep.output
          ? null
          : ep.output;
      return output && output.outcome === 'ERROR';
    }).length,
  };

  // Calculate avg latency
  const latencies = filteredEpisodes
    .map((ep) => ep.metrics?.latency_ms)
    .filter((l): l is number => l !== undefined);

  if (latencies.length > 0) {
    summary.avg_latency_ms = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
  }

  // Group by dimensions
  const rows: StatsRow[] = [];

  if (!query.group_by || query.group_by.length === 0) {
    // No grouping - return summary only
    rows.push({
      dimensions: {},
      metrics: {
        clicks: summary.total_clicks,
        successful_redirects: summary.successful_redirects,
        errors: summary.errors,
        avg_latency_ms: summary.avg_latency_ms,
      },
    });
  } else {
    // Group episodes by dimensions
    const grouped = new Map<string, SmartlinkResolutionEpisode[]>();

    for (const episode of filteredEpisodes) {
      const dimensionValues = query.group_by!.map((dim) =>
        getDimensionValue(episode, dim)
      );
      const key = JSON.stringify(dimensionValues);

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(episode);
    }

    // Build rows
    for (const [key, groupEpisodes] of grouped.entries()) {
      const dimensionValues = JSON.parse(key) as string[];
      const dimensions: Record<string, string> = {};

      query.group_by!.forEach((dim, i) => {
        dimensions[dim] = dimensionValues[i];
      });

      const groupLatencies = groupEpisodes
        .map((ep) => ep.metrics?.latency_ms)
        .filter((l): l is number => l !== undefined);

      rows.push({
        dimensions,
        metrics: {
          clicks: groupEpisodes.length,
          successful_redirects: groupEpisodes.filter((ep) => {
            const output =
              ep.output && typeof ep.output === 'object' && 'ref' in ep.output
                ? null
                : ep.output;
            return output && (output.outcome === 'OK' || output.outcome === 'DEFAULT_USED');
          }).length,
          errors: groupEpisodes.filter((ep) => {
            const output =
              ep.output && typeof ep.output === 'object' && 'ref' in ep.output
                ? null
                : ep.output;
            return output && output.outcome === 'ERROR';
          }).length,
          avg_latency_ms:
            groupLatencies.length > 0
              ? groupLatencies.reduce((sum, l) => sum + l, 0) / groupLatencies.length
              : undefined,
        },
      });
    }

    // Sort rows by total clicks (descending)
    rows.sort((a, b) => b.metrics.clicks - a.metrics.clicks);

    // Apply pagination
    if (query.limit !== undefined) {
      const offset = query.offset || 0;
      rows.splice(0, offset);
      rows.splice(query.limit);
    }
  }

  return {
    query,
    summary,
    rows,
    meta: {
      generated_at: new Date().toISOString(),
      query_latency_ms: Date.now() - startTime,
      total_rows: rows.length,
    },
  };
}

/**
 * Simple in-memory statistics (for testing/demo)
 * In production, this would query a database or analytics service
 */
export function calculateBasicStats(
  episodes: SmartlinkResolutionEpisode[],
  smartlinkId?: string
): StatsSummary {
  const filtered = smartlinkId
    ? episodes.filter((ep) => {
        const input = 'ref' in ep.input ? null : ep.input;
        return input && input.smartlink_id === smartlinkId;
      })
    : episodes;

  const latencies = filtered
    .map((ep) => ep.metrics?.latency_ms)
    .filter((l): l is number => l !== undefined);

  const uniqueCountries = new Set(
    filtered
      .map((ep) => {
        const input = 'ref' in ep.input ? null : ep.input;
        return input?.country;
      })
      .filter((c): c is string => !!c)
  );

  const uniqueTargets = new Set(
    filtered
      .map((ep) => {
        const output =
          ep.output && typeof ep.output === 'object' && 'ref' in ep.output
            ? null
            : ep.output;
        return output?.resolved_target_id;
      })
      .filter((t): t is string => !!t)
  );

  return {
    total_clicks: filtered.length,
    successful_redirects: filtered.filter((ep) => {
      const output =
        ep.output && typeof ep.output === 'object' && 'ref' in ep.output
          ? null
          : ep.output;
      return output && (output.outcome === 'OK' || output.outcome === 'DEFAULT_USED');
    }).length,
    errors: filtered.filter((ep) => {
      const output =
        ep.output && typeof ep.output === 'object' && 'ref' in ep.output
          ? null
          : ep.output;
      return output && output.outcome === 'ERROR';
    }).length,
    unique_countries: uniqueCountries.size,
    unique_targets: uniqueTargets.size,
    avg_latency_ms:
      latencies.length > 0 ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length : undefined,
  };
}
