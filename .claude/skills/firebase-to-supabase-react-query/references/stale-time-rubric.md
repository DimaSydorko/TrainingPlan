# staleTime rubric

Global defaults (in `app/lib/query-client.ts`): `staleTime: 0`, `gcTime: 24 h` (must be ≥ the persister `maxAge`
so the offline cache survives restarts), queries `networkMode: 'offlineFirst'`.

| Data                                 | `staleTime`        | Refresh trigger                                      |
| ------------------------------------ | ------------------ | ---------------------------------------------------- |
| Own plans / workouts                 | `5 * 60_000`       | own mutations invalidate; app focus refetches stale  |
| Publications feed                    | `60_000`           | pull-to-refresh → `refetch()`                        |
| A single publication                 | `5 * 60_000`       | publish/unpublish invalidates                        |
| Profile                              | `5 * 60_000`       | profile mutations invalidate                         |
| Exercise images catalogue            | `24 * 60 * 60_000` | rarely changes                                       |

## Rules

-   Put the value in the entity's `*.constants.ts` (`WORKOUTS_STALE_TIME_MS`), with a unit suffix.
-   Don't override `gcTime` per query unless there is a reason (large, rarely used data may use a shorter one; it
    then won't be available offline after a restart).
-   `staleTime: Infinity` only for data that never changes during a session.
-   Default retries are fine; Supabase errors with a 4xx status should not be retried (configure once in
    `query-client.ts`, not per hook).
