import { MOD_DATA } from "./index";
import { logger } from "./logging";
import { US, RU, UA, CN, JP, DE, FR, IN } from "country-flag-icons/string/3x2";
import { eventBus } from "./events";

export interface LanguageEntry {
    locale: Locale;
    name: string;
    flag: string;
}

export const LANGUAGES: LanguageEntry[] = [
    { locale: "en", name: "English", flag: US },
    { locale: "ru", name: "Русский", flag: RU },
    { locale: "uk", name: "Українська", flag: UA },
    { locale: "zh", name: "中文", flag: CN },
    { locale: "ja", name: "日本語", flag: JP },
    { locale: "de", name: "Deutsch", flag: DE },
    { locale: "fr", name: "Français", flag: FR },
    { locale: "hi", name: "हिन्दी", flag: IN },
];

export type Locale = "en" | "ru" | "uk" | "zh" | "ja" | "de" | "fr" | "hi";

export type TranslationData = Record<string, unknown>;

export interface CustomTranslationRecord {
    name: string;
    modKey: string;
    data: TranslationData;
}

const SETTINGS_KEY = "ZC_LOCALE";
const IDB_NAME = "zc-custom-translations";
const IDB_VERSION = 2;
const IDB_STORE_TRANSLATIONS = "translations";
const IDB_STORE_ACTIVE = "active";

let officialTranslations: Partial<Record<Locale, TranslationData>> = {};
let activeCustomTranslation: CustomTranslationRecord | null = null;

export function getLocale(): Locale | null {
    const stored = Player?.ExtensionSettings?.[SETTINGS_KEY] as string | undefined;
    if (stored && LANGUAGES.some((l) => l.locale === stored)) {
        return stored as Locale;
    }

    const gameLocale = TranslationLanguage.toLowerCase();
    if (LANGUAGES.some((l) => l.locale === gameLocale)) {
        return gameLocale as Locale;
    }

    return null;
}

export function setLocale(locale: Locale): void {
    Player.ExtensionSettings[SETTINGS_KEY] = locale;
    ServerPlayerExtensionSettingsSync(SETTINGS_KEY);
    eventBus?.emit("localeChanged", { locale });
}

function openTranslationsDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(IDB_NAME, IDB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(IDB_STORE_TRANSLATIONS)) {
                const store = db.createObjectStore(IDB_STORE_TRANSLATIONS, {
                    keyPath: "name",
                });
                store.createIndex("modKey", "modKey", { unique: false });
            }

            if (!db.objectStoreNames.contains(IDB_STORE_ACTIVE)) {
                db.createObjectStore(IDB_STORE_ACTIVE);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
    });
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
    });
}

export async function addCustomTranslation(
    name: string,
    data: TranslationData,
    modKey: string
): Promise<void> {
    const record: CustomTranslationRecord = { name, modKey, data };
    const db = await openTranslationsDb();
    try {
        const tx = db.transaction(IDB_STORE_TRANSLATIONS, "readwrite");
        const store = tx.objectStore(IDB_STORE_TRANSLATIONS);
        await idbRequest(store.put(record));
    } finally {
        db.close();
    }
}

export async function removeCustomTranslation(name: string): Promise<void> {
    const db = await openTranslationsDb();
    try {
        const tx = db.transaction(
            [IDB_STORE_TRANSLATIONS, IDB_STORE_ACTIVE],
            "readwrite"
        );
        const translationsStore = tx.objectStore(IDB_STORE_TRANSLATIONS);
        const activeStore = tx.objectStore(IDB_STORE_ACTIVE);

        const record = await idbRequest<CustomTranslationRecord | undefined>(
            translationsStore.get(name)
        );

        await idbRequest(translationsStore.delete(name));

        if (!record) return;

        const activeName = await idbRequest<string | undefined>(
            activeStore.get(record.modKey)
        );

        if (activeName === name) {
            await idbRequest(activeStore.delete(record.modKey));
            if (record.modKey === MOD_DATA.key) {
                eventBus?.emit("customTranslationChanged", { targetMod: record.modKey });
            }
        }
    } finally {
        db.close();
    }
}

export async function getCustomTranslation(
    name: string
): Promise<CustomTranslationRecord | null> {
    const db = await openTranslationsDb();
    try {
        const tx = db.transaction(IDB_STORE_TRANSLATIONS, "readonly");
        const store = tx.objectStore(IDB_STORE_TRANSLATIONS);
        const record = await idbRequest<CustomTranslationRecord | undefined>(store.get(name));
        return record ?? null;
    } finally {
        db.close();
    }
}

export async function getAllCustomTranslations(): Promise<CustomTranslationRecord[]> {
    const db = await openTranslationsDb();
    try {
        const tx = db.transaction(IDB_STORE_TRANSLATIONS, "readonly");
        const store = tx.objectStore(IDB_STORE_TRANSLATIONS);
        return await idbRequest(store.getAll());
    } finally {
        db.close();
    }
}

export async function setActiveCustomTranslation(name: string): Promise<void> {
    const record = await getCustomTranslation(name);
    if (!record) {
        throw new Error(`Custom translation "${name}" was not found`);
    }

    const db = await openTranslationsDb();
    try {
        const tx = db.transaction(IDB_STORE_ACTIVE, "readwrite");
        const store = tx.objectStore(IDB_STORE_ACTIVE);
        await idbRequest(store.put(name, record.modKey));
    } finally {
        db.close();
    }

    eventBus?.emit("customTranslationChanged", { targetMod: record.modKey });
}

export async function getActiveCustomTranslation(modKey: string): Promise<CustomTranslationRecord | null> {
    const db = await openTranslationsDb();
    try {
        const tx = db.transaction(IDB_STORE_ACTIVE, "readonly");
        const store = tx.objectStore(IDB_STORE_ACTIVE);
        const name = await idbRequest<string | undefined>(store.get(modKey));
        if (!name) return null;
        return getCustomTranslation(name);
    } finally {
        db.close();
    }
}

export async function clearActiveCustomTranslation(name: string): Promise<void> {
    const record = await getCustomTranslation(name);
    if (!record) {
        throw new Error(`Custom translation "${name}" was not found`);
    }

    const db = await openTranslationsDb();
    try {
        const tx = db.transaction(IDB_STORE_ACTIVE, "readwrite");
        const store = tx.objectStore(IDB_STORE_ACTIVE);
        const activeName = await idbRequest<string | undefined>(
            store.get(record.modKey)
        );

        if (activeName === name) {
            await idbRequest(store.delete(record.modKey));
            eventBus?.emit("customTranslationChanged", { targetMod: record.modKey });
        }
    } finally {
        db.close();
    }
}

export async function fetchTranslation(
    locale: Locale
): Promise<TranslationData> {
    if (!MOD_DATA.localization) {
        throw new Error("Localization is not configured");
    }

    const response = await fetch(
        `${MOD_DATA.localization.translationsFolderPath}/${locale}.json?=${Date.now()}`
    );
    if (!response.ok) {
        throw new Error(
            `Failed to fetch ${locale} translation at ${response.url}`
        );
    }

    const data = (await response.json()) as TranslationData;
    officialTranslations[locale] = data;
    logger.log(`Fetched official translations for locale: ${locale}`, data);
    return data;
}

async function loadOfficialTranslation(): Promise<void> {
    if (!MOD_DATA.localization) return;

    const supportedLocales = MOD_DATA.localization.locales.supported;
    const defaultLocale = MOD_DATA.localization.locales.default;
    const locale = getLocale() ?? defaultLocale;

    if (!officialTranslations[defaultLocale]) {
        try {
            await fetchTranslation(defaultLocale);
        } catch (error) {
            logger.error("Failed to load default official translations", error);
        }
    }

    if (
        locale !== defaultLocale &&
        supportedLocales.includes(locale) &&
        !officialTranslations[locale]
    ) {
        try {
            await fetchTranslation(locale);
        } catch (error) {
            logger.error(
                `Failed to load official translations for ${locale}`,
                error
            );
        }
    }
}

async function loadCustomTranslation(): Promise<void> {
    activeCustomTranslation = await getActiveCustomTranslation(MOD_DATA.key);
}

export async function loadLocalization(): Promise<void> {
    if (MOD_DATA.localization === undefined) {
        logger.log("Skip localization procedure because it is not configured");
        return;
    }

    const supportedLocales = MOD_DATA.localization.locales.supported;
    const defaultLocale = MOD_DATA.localization.locales.default;

    if (!supportedLocales.includes(defaultLocale)) {
        logger.warn(
            `Default locale ${defaultLocale} isn't supported, fix configuration`
        );
        return;
    }

    eventBus?.on("localeChanged", (event) => {
        logger.log("Reloading official translation");
        loadOfficialTranslation();
    });

    eventBus?.on("customTranslationChanged", (event) => {
        if (event.targetMod !== MOD_DATA.key) return;
        logger.log("Reloading custom translation");
        loadCustomTranslation();
    });

    loadOfficialTranslation();
    loadCustomTranslation();
}

function getNestedValue(obj: unknown, path: string): string | undefined {
    if (!obj || !path) return undefined;

    return path.split(".").reduce<unknown>((current, key) => {
        if (current && typeof current === "object" && key in current) {
            return (current as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj) as string | undefined;
}

export function processReplacements(
    text: string,
    replacements: Record<string, string | number>
): string {
    for (const [key, value] of Object.entries(replacements)) {
        text = text.replaceAll("$" + key, value.toString());
    }
    return text;
}

export function getText(
    tag: string,
    replacements?: Record<string, string | number>
): string {
    if (MOD_DATA.localization === undefined) {
        logger.warn("Attempt to call getText() without configuring localization");
        return tag;
    }

    const defaultLocale = MOD_DATA.localization.locales.default;
    const locale = getLocale() ?? defaultLocale;

    const value = (
        getNestedValue(activeCustomTranslation?.data ?? null, tag) ??
        getNestedValue(officialTranslations[locale], tag) ??
        getNestedValue(officialTranslations[defaultLocale], tag)
    );

    if (!value || typeof value !== "string") {
        logger.warn("Unknown translation tag:", tag);
        return tag;
    }

    return replacements ? processReplacements(value, replacements) : value;
}