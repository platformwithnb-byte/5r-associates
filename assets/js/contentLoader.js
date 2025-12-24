// Content Loader with i18n support
class ContentLoader {
    constructor() {
        this.currentLang = localStorage.getItem('lang') || 'en';
        this.content = {};
        this.pageName = this.getCurrentPage();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        return page === 'index' ? 'home' : page;
    }

    async loadContent() {
        try {
            const cacheBust = Date.now();

            // Fetch selected language
            const [commonData, pageData] = await Promise.all([
                this.safeFetchJson(`content/${this.currentLang}/common.json?cb=${cacheBust}`),
                this.safeFetchJson(`content/${this.currentLang}/${this.pageName}.json?cb=${cacheBust}`)
            ]);

            // Optional English fallback to fill missing keys when switching to kn
            let baseCommon = {}, basePage = {};
            if (this.currentLang !== 'en') {
                [baseCommon, basePage] = await Promise.all([
                    this.safeFetchJson(`content/en/common.json?cb=${cacheBust}`),
                    this.safeFetchJson(`content/en/${this.pageName}.json?cb=${cacheBust}`)
                ]);
            }

            const base = this.deepMerge(baseCommon, basePage);
            const overlay = this.deepMerge(commonData, pageData);
            this.content = this.deepMerge(base, overlay);
            this.applyContent();
            return true;
        } catch (error) {
            console.error('Error loading content:', error);
            return false;
        }
    }

    applyContent() {
        // Apply text content
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const value = this.getNestedValue(this.content, key);
            if (value) {
                element.textContent = value;
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
                    element.setAttribute(attr, value);
                }
            });
        });

        // Update HTML lang attribute
        document.documentElement.lang = this.currentLang;
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

        this.currentLang = lang;
        localStorage.setItem('lang', lang);
        await this.loadContent();

        // Update language buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });
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
