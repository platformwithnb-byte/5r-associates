// Content Loader with i18n support
class ContentLoader {
    constructor() {
        this.currentLang = localStorage.getItem('lang') || 'en';
        this.content = {};
        this.pageName = this.getCurrentPage();
        this.foundingYear = 1999;
        this.yearOverride = this.getYearOverride();
        this.cache = {
            en: { common: null, pages: {} },
            kn: { common: null, pages: {} }
        };
        this._switching = false;
        this._initialLoad = true;
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const last = path.split('/').filter(Boolean).pop() || '';

        // If the URL ends with a folder (no file name), treat as home.
        if (!last || !last.includes('.')) return 'home';

        const page = last.replace('.html', '');
        if (!page || page === 'index') return 'home';
        return page;
    }

    async loadContent() {
        // Only use cache-bust on initial load, not on language switches
        const cacheBust = this._initialLoad !== false ? Date.now() : '';
        if (this._initialLoad !== false) this._initialLoad = false;

        try {
            this.content = await this.fetchContentForPage(this.pageName, cacheBust);
            this.applyContent();
            return true;
        } catch (error) {
            console.error(`Error loading content for page "${this.pageName}":`, error);

            // Fallback: if the specific page JSON is missing, try home so UI isn't blank
            if (this.pageName !== 'home') {
                try {
                    this.content = await this.fetchContentForPage('home', cacheBust);
                    this.applyContent();
                    return true;
                } catch (fallbackError) {
                    console.error('Fallback to home content failed:', fallbackError);
                }
            }
            return false;
        }
    }

    async fetchContentForPage(page, cacheBust) {
        // Use in-memory cache when available to reduce fetch latency
        const langCache = this.cache[this.currentLang];
        const commonPromise = (async () => {
            if (langCache.common) return langCache.common;
            const data = await this.safeFetchJson(`content/${this.currentLang}/common.json?cb=${cacheBust}`);
            langCache.common = data; return data;
        })();

        const pagePromise = (async () => {
            if (langCache.pages[page]) return langCache.pages[page];
            const data = await this.safeFetchJson(`content/${this.currentLang}/${page}.json?cb=${cacheBust}`);
            langCache.pages[page] = data; return data;
        })();

        const [commonData, pageData] = await Promise.all([commonPromise, pagePromise]);

        // Optional English fallback to fill missing keys when switching to kn
        let baseCommon = {}, basePage = {};
        if (this.currentLang !== 'en') {
            const enCache = this.cache['en'];
            const enCommonPromise = (async () => {
                if (enCache.common) return enCache.common;
                const data = await this.safeFetchJson(`content/en/common.json?cb=${cacheBust}`);
                enCache.common = data; return data;
            })();
            const enPagePromise = (async () => {
                if (enCache.pages[page]) return enCache.pages[page];
                const data = await this.safeFetchJson(`content/en/${page}.json?cb=${cacheBust}`);
                enCache.pages[page] = data; return data;
            })();
            [baseCommon, basePage] = await Promise.all([enCommonPromise, enPagePromise]);
        }

        const base = this.deepMerge(baseCommon, basePage);
        const overlay = this.deepMerge(commonData, pageData);
        return this.deepMerge(base, overlay);
    }

    applyContent() {
        console.log('Applying content:', this.content);
        // Apply text content
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const value = this.getNestedValue(this.content, key);
            if (value !== undefined && value !== null) {
                element.textContent = this.interpolate(String(value));
            } else {
                console.warn(`Missing i18n key: ${key}`);
            }
        });

        // Apply attributes (alt, title, placeholder, aria-label)
        document.querySelectorAll('[data-i18n-attr]').forEach(element => {
            const attrMap = element.getAttribute('data-i18n-attr');
            if (!attrMap) return;
            attrMap.split(',').forEach(mapping => {
                const trimmed = mapping.trim();
                if (!trimmed) return;
                const parts = trimmed.split(':');
                const attr = (parts[0] || '').trim();
                const key = (parts[1] || '').trim();
                if (!attr || !key) return;
                const value = this.getNestedValue(this.content, key);
                if (value !== undefined && value !== null) {
                    element.setAttribute(attr, this.interpolate(String(value)));
                }
            });
        });

        // Update HTML lang attribute
        document.documentElement.lang = this.currentLang;

        // Notify listeners that i18n content is ready
        try {
            document.dispatchEvent(new CustomEvent('i18n:ready', { detail: { lang: this.currentLang, page: this.pageName } }));
        } catch (e) { }
    }

    interpolate(text) {
        try {
            const years = this.calculateYearsSince(this.foundingYear);
            return text
                .replaceAll('{{years}}', String(years))
                .replaceAll('{{years_since_1999}}', String(years));
        } catch (e) {
            return text;
        }
    }

    calculateYearsSince(year) {
        const currentYear = this.yearOverride ?? new Date().getFullYear();
        return Math.max(0, currentYear - year);
    }

    getYearOverride() {
        try {
            const params = new URLSearchParams(window.location.search);
            const candidate = params.get('year') || params.get('mockYear') || localStorage.getItem('mockYear');
            if (!candidate) return null;
            const y = parseInt(candidate, 10);
            if (!isNaN(y) && y >= 1999 && y <= 9999) return y;
            return null;
        } catch (e) {
            return null;
        }
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    deepMerge(target = {}, source = {}) {
        const result = Array.isArray(target) ? [...target] : { ...target };
        Object.keys(source || {}).forEach(key => {
            const srcVal = source[key];
            const tgtVal = result[key];
            const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
            if (isObj(srcVal) && isObj(tgtVal)) {
                result[key] = this.deepMerge(tgtVal, srcVal);
            } else {
                result[key] = srcVal;
            }
        });
        return result;
    }

    async safeFetchJson(url) {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
        return res.json();
    }

    async switchLanguage(lang) {
        if (this.currentLang === lang) return;
        if (this._switching) return; // Prevent double-clicks

        this._switching = true;

        // Immediate visual feedback
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
            btn.disabled = true;
        });

        this.currentLang = lang;
        localStorage.setItem('lang', lang);

        try {
            await this.loadContent();
        } finally {
            // Re-enable buttons
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.disabled = false;
            });
            this._switching = false;
        }
    }
}

// Initialize on page load
const contentLoader = new ContentLoader();

document.addEventListener('DOMContentLoaded', async () => {
    await contentLoader.loadContent();

    // Set up language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === contentLoader.currentLang);
        btn.addEventListener('click', () => {
            contentLoader.switchLanguage(btn.getAttribute('data-lang'));
        });
    });
});
