<p align="center">
  <img src="src/icon.png" alt="DL Translate logo" width="128" height="128">
</p>

# Bob 的 DL 翻译插件（免 API 密钥）

[English](README.md)

在 Bob 中划词或输入文本，译文直接显示在翻译结果里。无需 API 密钥或本地服务，支持自动识别源语言、简繁中文和多行文本。需要 Bob 1.21.0 或更新版本。

## 安装

1. 双击 `dl-translate-*.bobplugin` 安装包。本地打包后可在 `dist/` 找到安装包。
2. 打开 Bob 的「偏好设置 → 翻译 → 服务」，在「文本翻译」里点 `+`，选择 **DL Translate（免 API 密钥）**，启用并保存。
3. 划词或输入文本即可使用。

插件使用 DL 的 `oneshot-free` 接口。该接口未列入公开开发者 API，可用性由 DL 决定。失败时会显示可用的 HTTP 状态和 DL 错误码，并区分限流与配额用尽。

## 本地打包

在 macOS 上运行 `sh scripts/build.sh`，脚本会在 `dist/` 生成安装包，并输出完整路径。插件没有 JavaScript 依赖。发布新版时更新 `src/info.json` 中的版本号。

## 贡献与致谢

欢迎提交 Issue 和 Pull Request。反馈问题时，请附上 Bob 和插件版本，以及复现步骤。

感谢 [akl7777777 的原版插件](https://github.com/akl7777777/bob-plugin-akl-deepl-free-translate) 提供实现参考，也感谢 Dark15 在 [PR #26](https://github.com/akl7777777/bob-plugin-akl-deepl-free-translate/pull/26) 中提供 `oneshot-free` 接口适配。插件实现参考了 [Bob 插件开发文档](https://bobtranslate.com/plugin/)。

## 开源许可

本项目采用 [MIT 许可证](LICENSE)。
