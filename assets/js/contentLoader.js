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
            // Load common and page-specific content in parallel
            const [commonData, pageData] = await Promise.all([
                fetch(`content/${this.currentLang}/common.json`).then(r => r.json()),
                fetch(`content/${this.currentLang}/${this.pageName}.json`).then(r => r.json())
            ]);

            this.content = { ...commonData, ...pageData };
            this.applyContent();
            return true;
        } catch (error) {
            console.error('Error loading content:', error);
            // Fallback to English if language fails
            if (this.currentLang !== 'en') {
                this.currentLang = 'en';
                localStorage.setItem('lang', 'en');
                return this.loadContent();
            }
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
            attrMap.split(',').forEach(mapping => {
                const [attr, key] = mapping.trim().split(':');
                const value = this.getNestedValue(this.content, key);
                if (value) {
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
