# DL Free Translate for Bob

[简体中文](README_CN.md)

Translate selected or typed text with DL directly in Bob. The plugin requires Bob 1.21.0 or later and works without an API key or a local server. It supports automatic source language detection, Simplified and Traditional Chinese, and multiline text.

## Install

1. Double-click the `.bobplugin` package. If you built it locally, find it in `dist/`.
2. In Bob, open **Preferences → Translation → Services**. Under **Text Translation**, click `+`, select **DL Free Translate**, then enable and save the service.
3. Select or type text to translate it.

The plugin uses DL's `oneshot-free` endpoint, which is outside the public developer API and may change. Errors show the HTTP status and DL error code when available. The plugin distinguishes rate limits from exhausted quotas.

## Build locally

On macOS, run `sh scripts/build.sh` from the repository root. The script writes the package to `dist/` and prints its full path. The plugin has no JavaScript dependencies. Set the release version in `src/info.json`.

## Contributing and acknowledgments

Issues and pull requests are welcome. When reporting a bug, include your Bob and plugin versions and the steps to reproduce it.

Thanks to akl7777777 for the [original plugin](https://github.com/akl7777777/bob-plugin-akl-deepl-free-translate) and to Dark15 for adapting it to the `oneshot-free` endpoint in [PR #26](https://github.com/akl7777777/bob-plugin-akl-deepl-free-translate/pull/26). This implementation follows the [Bob plugin development guide](https://bobtranslate.com/plugin/).

## License

Released under the [MIT License](LICENSE).
