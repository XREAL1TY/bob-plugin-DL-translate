# AGENTS.md

- Use documented Bob APIs and keep the plugin dependency-free in Bob's JavaScriptCore runtime. Set `minBobVersion` to match the newest API used.
- Use `DL` in user-facing text. Keep `README.md` and `README_CN.md` in sync when behavior or installation changes.
- After runtime or packaging changes, run `sh scripts/build.sh` on macOS and verify that `info.json` and `main.js` are at the archive root. Keep generated packages out of Git.
- Make atomic commits with English Conventional Commit subjects, such as `fix(translate): handle invalid responses`.

## References

- [Bob plugin development guide](https://bobtranslate.com/plugin/)
- [Original plugin repository](https://github.com/akl7777777/bob-plugin-akl-deepl-free-translate)
- [`oneshot-free` endpoint migration (PR #26)](https://github.com/akl7777777/bob-plugin-akl-deepl-free-translate/pull/26)
