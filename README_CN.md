# Bob 的 DL Free Translate 插件

[English](README.md)

在 Bob 中划词或输入文本，译文直接显示在翻译结果里。无需 API 密钥或本地服务，支持自动识别源语言、简繁中文和多行文本。需要 Bob 1.21.0 或更新版本。

## 安装

1. 双击 `.bobplugin` 安装包。本地打包后可在 `dist/` 找到安装包。
2. 打开 Bob 的「偏好设置 → 翻译 → 服务」，在「文本翻译」里点 `+`，选择 **DL Free Translate**，启用并保存。
3. 划词或输入文本即可使用。

插件使用 DL 的 `oneshot-free` 接口。该接口未列入公开开发者 API，可用性由 DL 决定。收到限流响应时，插件会提示稍后重试。

## 本地打包

在 macOS 上运行 `sh scripts/build.sh`，脚本会在 `dist/` 生成安装包，并输出完整路径。插件没有 JavaScript 依赖。发布新版时更新 `src/info.json` 中的版本号。

## 贡献与致谢

欢迎提交 Issue 和 Pull Request。反馈问题时，请附上 Bob 和插件版本，以及复现步骤。

感谢 [akl7777777 的原版插件](https://github.com/akl7777777/bob-plugin-akl-deepl-free-translate) 提供实现参考，也感谢 Dark15 在 [PR #26](https://github.com/akl7777777/bob-plugin-akl-deepl-free-translate/pull/26) 中提供 `oneshot-free` 接口适配。插件实现参考了 [Bob 插件开发文档](https://bobtranslate.com/plugin/)。
