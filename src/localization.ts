import { MOD_DATA } from "./index";
import { logger } from "./logging";
import { hookFunction, HookPriority } from "./modSdk";

let translations: Record<string, Record<string, string>> = {};

export function getText(tag: string, replacements?: Record<string, string | number>) {
    if (MOD_DATA.localization === undefined) {
        logger.warn("Attempt to call getText() without configuring localization");
        return tag;
    }
    const defaultLocale = MOD_DATA.localization.locales.default;
    const preferredLocale = TranslationLanguage;
    const value = getNestedValue(translations[preferredLocale], tag) ?? getNestedValue(translations[defaultLocale], tag);
    if (!value) {
        logger.warn("Unknown translation tag:", tag);
        return tag;
    };
    return replacements ? processReplacements(value, replacements) : value;
}

function getNestedValue(obj: any, path: string): string | undefined {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((current, key) => {
        if (current && typeof current === 'object' && key in current) {
            return current[key];
        }
        return undefined;
    }, obj);
}

export function processReplacements(text: string, replacements: Record<string, string | number>) {
    for (const [key, value] of Object.entries(replacements)) {
        text = text.replaceAll("$" + key, value.toString());
    }
    return text;
}

export async function loadLocalization() {
    if (MOD_DATA.localization === undefined) {
        logger.log("Skip localization procedure because its not configured");
        return;
    }

    const supportedLocales = MOD_DATA.localization.locales.supported;
    const defaultLocale = MOD_DATA.localization.locales.default;
    const preferredLocale = TranslationLanguage;

    if (!supportedLocales.includes(defaultLocale)) {
        logger.warn(`Default locale ${defaultLocale} isn't supported, fix configuration`);
        return;
    }

    hookFunction("TranslationSwitchLanguage", HookPriority.OBSERVE, (args, next) => {
        const value = next(args);
        if (supportedLocales.includes(TranslationLanguage) && !(TranslationLanguage in translations)) {
            fetchTranslationsForLocale(TranslationLanguage);
        }
        return value;
    });

    await fetchTranslationsForLocale(defaultLocale);

    if (preferredLocale !== defaultLocale && supportedLocales.includes(preferredLocale)) {
        await fetchTranslationsForLocale(preferredLocale);
    }
}

export async function fetchTranslationsForLocale(locale: string) {
    const response = await fetch(MOD_DATA.localization!.translationsFolderPath + "/" + locale + ".json?=" + Date.now());
    if (!response.ok) return logger.error(`Failed to fetch ${locale} translations at ${response.url}` + locale);
    const data = await response.json();
    logger.log(`Fetched translations for locale: ${locale}`, data);
    translations[locale] = data;
}