# Legacy redux-persist hand-over (settings)

redux-persist (config `key: 'root'`, no whitelist) stores the whole Redux state in AsyncStorage under
**`persist:root`**. The value is a JSON object whose values are themselves JSON strings, one per slice:

```json
{ "settingsReducer": "{\"colors\":{…},\"isVibration\":true,…}", "workoutReducer": "…", "_persist": "{…}" }
```

## One-time import

When the settings store's own key is absent (first launch after the update), read `persist:root`, parse
`settingsReducer`, map it, and set the store:

```ts
const importLegacySettings = async (): Promise<Partial<Settings> | null> => {
  const raw = await AsyncStorage.getItem(LEGACY_PERSIST_KEY)

  if (!raw) return null

  const root = JSON.parse(raw) as Record<string, string>
  const legacy = root.settingsReducer ? (JSON.parse(root.settingsReducer) as LegacySettings) : null

  return legacy ? mapLegacySettings(legacy) : null
}
```

-   Map the stored palette to `themeName` (compare with `colorsDark.background`), keep TTS, sound, vibration, battery
    mode and weight step; ignore `internet`.
-   Wire it through `persist`'s `onRehydrateStorage` (when rehydrated state is empty) or an explicit
    `bootstrapSettings()` called before first render; whichever you choose, make it run once.
-   Don't delete `persist:root` while Redux still uses it; removal is the last step of the removal checklist.

## Tests

-   No legacy key → defaults
-   Legacy dark palette → `themeName: 'dark'`, other fields carried over
-   Corrupt JSON → defaults, no crash
-   Store key already present → legacy ignored
