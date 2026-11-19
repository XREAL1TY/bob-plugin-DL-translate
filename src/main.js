const TRANSLATE_URL = 'https://oneshot-free.www.deepl.com/v1/translate';

const LANGUAGES = [
    'ar', 'bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fi', 'fr', 'hu',
    'id', 'it', 'ja', 'ko', 'lt', 'lv', 'nb', 'nl', 'pl', 'pt', 'pt-br', 'pt-pt',
    'ro', 'ru', 'sk', 'sl', 'sv', 'tr', 'uk', 'zh-Hans', 'zh-Hant',
];

const PORTUGUESE_TAGS = new Map([
    ['pt', 'pt-BR'],
    ['pt-br', 'pt-BR'],
    ['pt-pt', 'pt-PT'],
]);

function supportLanguages() {
    return ['auto', ...LANGUAGES];
}

function dlTag(language) {
    if (LANGUAGES.includes(language)) return PORTUGUESE_TAGS.get(language) ?? language;
}

function detectedSource(code, fallback) {
    if (typeof code !== 'string') return fallback;
    const normalized = code.toLowerCase();
    // DL may report only the base language. Keep Bob's regional variant if available.
    if (normalized === 'zh') return fallback === 'zh-Hant' ? 'zh-Hant' : 'zh-Hans';
    if (normalized === 'pt') return PORTUGUESE_TAGS.has(fallback) ? fallback : 'pt';
    if (normalized === 'en-us' || normalized === 'en-gb') return 'en';
    return LANGUAGES.find(language => language.toLowerCase() === normalized) ?? fallback;
}

function errorResult(type, message) {
    return { error: { type, message } };
}

function requestError(status) {
    switch (status) {
        case 400:
        case 422:
            return errorResult('param', 'DL 无法处理这段原文，请检查文本和所选语言。');
        case 401:
        case 403:
            return errorResult('network', 'DL 当前拒绝此请求，请稍后重试。');
        case 413:
            return errorResult('param', '原文太长，请分段翻译。');
        case 429:
            return errorResult('network', 'DL 请求过于频繁，请稍后重试。');
        default:
            return errorResult('network', status
                ? `DL 请求失败（HTTP ${status}），请稍后重试。`
                : '无法连接 DL，请检查网络后重试。');
    }
}

async function translate(query) {
    const text = query.text;
    if (typeof text !== 'string' || !text.trim()) {
        return query.onCompletion(errorResult('param', '请输入需要翻译的文本。'));
    }

    const autoSource = !query.from || query.from === 'auto';
    const from = autoSource ? query.detectFrom : query.from;
    const to = query.to && query.to !== 'auto' ? query.to : query.detectTo;
    const source = autoSource ? undefined : dlTag(from);
    // DL accepts 'en' as a source but requires a regional tag for an English target.
    const target = to === 'en' ? 'en-US' : dlTag(to);
    if (!target || (!autoSource && !source)) {
        return query.onCompletion(errorResult('unsupportedLanguage', 'DL 不支持所选语言。'));
    }

    const body = { text: [text], target_lang: target };
    if (source) body.source_lang = source;
    const request = {
        method: 'POST',
        url: TRANSLATE_URL,
        header: { 'Content-Type': 'application/json' },
        body,
        timeout: 12,
    };
    if (query.cancelSignal) request.cancelSignal = query.cancelSignal;

    let response;
    try {
        response = await $http.request(request);
    } catch {
        return query.onCompletion(requestError());
    }

    const status = response?.response?.statusCode;
    if (status !== 200 || response.error) {
        return query.onCompletion(requestError(status === 200 ? undefined : status));
    }
    const translation = response.data?.translations?.[0];
    if (typeof translation?.text !== 'string' || !translation.text.trim()) {
        return query.onCompletion(errorResult('api', 'DL 没有返回可显示的译文。'));
    }

    query.onCompletion({
        result: {
            from: autoSource ? detectedSource(translation.detected_source_language, from) : from,
            to,
            content: { format: 'plain', text: translation.text },
        },
    });
}
