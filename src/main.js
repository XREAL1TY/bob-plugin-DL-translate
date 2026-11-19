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

function errorResult(type, message, addition) {
    const error = { type, message };
    if (addition && Object.keys(addition).length) error.addition = addition;
    return { error };
}

function failureReason(status, code, hasTranslationResponse) {
    if ((!status || status === 400) && code === 'invalid_content_type') {
        return ['api', 'DL 拒绝了请求格式'];
    }
    switch (status) {
        case 400:
        case 422:
            return ['param', 'DL 无法处理这段原文，请检查文本和所选语言'];
        case 401:
        case 403:
            return ['network', 'DL 当前拒绝此请求'];
        case 404:
            return ['network', 'DL 翻译接口不可用'];
        case 413:
            return ['param', '原文太长，请分段翻译'];
        case 429:
        case 529:
            return ['network', 'DL 请求过于频繁，请稍后重试'];
        case 456:
            return ['network', 'DL 已达到使用配额'];
        case 500:
        case 502:
        case 503:
        case 504:
            return ['network', 'DL 服务暂时不可用，请稍后重试'];
        default:
            if (status) return ['network', 'DL 请求失败，请稍后重试'];
            if (hasTranslationResponse) return ['api', 'DL 没有返回可显示的译文'];
            return ['network', '无法连接 DL，请检查网络后重试'];
    }
}

function parseErrorBody(data) {
    if (typeof data !== 'string') return data;
    try {
        return JSON.parse(data);
    } catch {
        return undefined;
    }
}

function requestError(response) {
    const httpStatus = response?.response?.statusCode;
    const body = parseErrorBody(response?.data);
    const rawCode = [body?.code, body?.error?.code].find(value =>
        ['number', 'string'].includes(typeof value) && /^[\w.-]{1,64}$/.test(value));
    const code = rawCode === undefined ? undefined : String(rawCode);
    const reportedStatus = [body?.status, body?.error?.status, code].find(value =>
        ['number', 'string'].includes(typeof value) && /^[45]\d{2}$/.test(value));
    const status = httpStatus && httpStatus !== 200 ? httpStatus : Number(reportedStatus) || undefined;

    // The free endpoint can return field validation errors, while the edge can nest errors.
    const fields = body?.errors && typeof body.errors === 'object' ? Object.values(body.errors).flat() : [];
    const detail = [body?.message, body?.error?.message, body?.detail, ...fields, body?.title]
        .find(value => typeof value === 'string' && value.trim());
    const addition = {};
    if (httpStatus) addition.httpStatus = httpStatus;
    if (status && status !== httpStatus) addition.status = status;
    if (code) addition.code = code;
    if (detail) addition.message = detail.trim().slice(0, 240);
    const headers = response?.response?.headers ?? {};
    const traceId = body?.traceId ?? Object.entries(headers)
        .find(([name]) => name.toLowerCase() === 'x-trace-id')?.[1];
    if (typeof traceId === 'string') addition.traceId = traceId;

    const [type, message] = failureReason(status, code, httpStatus === 200 && !response.error);
    const labels = [];
    if (httpStatus && httpStatus !== 200) labels.push(`HTTP ${httpStatus}`);
    if (code && code !== String(httpStatus)) labels.push(`DL ${code}`);
    if (!labels.length && status) labels.push(`DL ${status}`);
    const suffix = labels.length ? `（${labels.join('，')}）` : '';
    return errorResult(type, `${message}${suffix}。`, addition);
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
    } catch (error) {
        return query.onCompletion(requestError(error));
    }

    const status = response?.response?.statusCode;
    if (status !== 200 || response.error) {
        return query.onCompletion(requestError(response));
    }
    const translation = response.data?.translations?.[0];
    if (typeof translation?.text !== 'string' || !translation.text.trim()) {
        return query.onCompletion(requestError(response));
    }

    query.onCompletion({
        result: {
            from: autoSource ? detectedSource(translation.detected_source_language, from) : from,
            to,
            content: { format: 'plain', text: translation.text },
        },
    });
}
