// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Sticky navbar on scroll
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Services accordion (single-open behavior)
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            const contentId = header.getAttribute('aria-controls');
            const content = document.getElementById(contentId);

            // Close all accordions
            document.querySelectorAll('.accordion-header').forEach(h => {
                h.setAttribute('aria-expanded', 'false');
                const c = document.getElementById(h.getAttribute('aria-controls'));
                if (c) c.classList.remove('active');
            });

            // Open clicked accordion if it was closed
            if (!isExpanded) {
                header.setAttribute('aria-expanded', 'true');
                if (content) content.classList.add('active');
            }
        });
    });

    // Services card "Learn More" single-open details
    const detailButtons = document.querySelectorAll('.service-card .service-link[data-action="toggle-details"]');
    const cards = document.querySelectorAll('.service-card');

    detailButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.service-card');
            const details = card.querySelector('.service-details');

            // Close all other cards
            cards.forEach(c => {
                if (c !== card) {
                    c.classList.remove('open');
                    const d = c.querySelector('.service-details');
                    if (d) {
                        d.setAttribute('aria-hidden', 'true');
                    }
                }
            });

            // Toggle current card
            const isOpen = card.classList.contains('open');
            if (isOpen) {
                card.classList.remove('open');
                details.setAttribute('aria-hidden', 'true');
            } else {
                card.classList.add('open');
                details.setAttribute('aria-hidden', 'false');
            }
        });
    });

    // Portfolio filter
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            loadPortfolioItems(filter);
        });
    });

    // Load portfolio items
    if (document.getElementById('portfolioGrid')) {
        loadPortfolioItems('all');
    }

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Initialize coverage interactions when i18n is ready
    document.addEventListener('i18n:ready', (ev) => {
        if (ev.detail?.page === 'services') {
            initCoverageInteractions();
        }
    });

    // Also initialize once on DOM ready in case data arrives later
    if (document.querySelector('.coverage-grid')) {
        initCoverageInteractions();
    }

    // Global delegation as ultimate fallback
    document.addEventListener('click', (e) => {
        const cardEl = e.target.closest && e.target.closest('.coverage-card[data-coverage]');
        const grid = document.querySelector('.coverage-grid');
        const detailsContainer = document.getElementById('coverageDetails');
        if (cardEl && grid && detailsContainer) {
            grid.querySelectorAll('.coverage-card').forEach(c => c.classList.remove('active'));
            cardEl.classList.add('active');
            const key = cardEl.getAttribute('data-coverage');
            const fallbackTitle = cardEl.querySelector('h3')?.textContent?.trim();
            const dataNow = (window.contentLoader?.content?.services?.coverage?.coverageData || {});
            renderCoverageDetails(detailsContainer, dataNow[key], fallbackTitle);
        }
    });
});

// Portfolio items loader
async function loadPortfolioItems(filter = 'all') {
    try {
        const response = await fetch('data/portfolio.items.json');
        const data = await response.json();
        let items = data.items || [];

        // Filter items
        if (filter !== 'all') {
            items = items.filter(item => item.serviceType === filter);
        }

        renderPortfolioItems(items);
    } catch (error) {
        console.error('Error loading portfolio items:', error);
        const grid = document.getElementById('portfolioGrid');
        if (grid) {
            const msg = (window.contentLoader?.content?.common?.messages?.portfolio?.comingSoon) || 'Portfolio items coming soon...';
            grid.innerHTML = `<p class="no-items">${msg}</p>`;
        }
    }
}

function renderPortfolioItems(items) {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;

    if (items.length === 0) {
        const msg = (window.contentLoader?.content?.common?.messages?.portfolio?.noItems) || 'No projects found in this category.';
        grid.innerHTML = `<p class="no-items">${msg}</p>`;
        return;
    }

    grid.innerHTML = items.map(item => `
        <div class="portfolio-item" data-service="${item.serviceType}">
            <div class="portfolio-image">
                <img src="${item.coverImage || 'assets/images/placeholder.jpg'}" alt="${item.title}">
                <div class="portfolio-overlay">
                    <span class="service-badge">${formatServiceType(item.serviceType)}</span>
                </div>
            </div>
            <div class="portfolio-content">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <div class="portfolio-meta">
                    <span>${item.location?.city || ''}</span>
                    ${item.year ? `<span>${item.year}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function formatServiceType(type) {
    const lang = window.contentLoader?.currentLang || 'en';
    if (lang === 'kn') {
        const kn = {
            'construction': 'ನಿರ್ಮಾಣ',
            'interior': 'ಒಳಾಂಗಣ ವಿನ್ಯಾಸ',
            'painting': 'ಪೇಂಟಿಂಗ್'
        };
        return kn[type] || type;
    }
    const en = {
        'construction': 'Construction',
        'interior': 'Interior Design',
        'painting': 'Painting'
    };
    return en[type] || type;
}

// Coverage list rendering
function initCoverageInteractions() {
    const detailsContainer = document.getElementById('coverageDetails');
    const grid = document.querySelector('.coverage-grid');
    if (!detailsContainer || !grid || !window.contentLoader) return;

    // Delegated handler for robustness
    const handleActivate = (cardEl) => {
        if (!cardEl) return;
        const key = cardEl.getAttribute('data-coverage');
        grid.querySelectorAll('.coverage-card').forEach(c => c.classList.remove('active'));
        cardEl.classList.add('active');
        const fallbackTitle = cardEl.querySelector('h3')?.textContent?.trim();
        const dataNow = (contentLoader.content?.services?.coverage?.coverageData || {});
        renderCoverageDetails(detailsContainer, dataNow[key], fallbackTitle);
    };

    grid.addEventListener('click', (e) => {
        const cardEl = e.target.closest('.coverage-card[data-coverage]');
        if (cardEl) handleActivate(cardEl);
    });

    grid.querySelectorAll('.coverage-card').forEach(card => {
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleActivate(card);
            }
        });
    });

    // Auto-select first available card so details show on load
    const firstCard = grid.querySelector('.coverage-card[data-coverage]');
    if (firstCard) {
        firstCard.classList.add('active');
        const firstKey = firstCard.getAttribute('data-coverage');
        const fallbackTitle = firstCard.querySelector('h3')?.textContent?.trim();
        const dataNow = (contentLoader.content?.services?.coverage?.coverageData || {});
        renderCoverageDetails(detailsContainer, dataNow[firstKey], fallbackTitle);
    }
}

function renderCoverageDetails(container, datum, fallbackTitle) {
    if (!datum) {
        const pendingText = contentLoader.content?.services?.coverage?.coveragePending || 'Coverage details coming soon.';
        const title = fallbackTitle || '';
        container.innerHTML = title ? `
            <h3 class="coverage-title">${title}</h3>
            <p class="coverage-placeholder">${pendingText}</p>
        ` : '';
        return;
    }
    const title = datum.placesTitle || datum.title || fallbackTitle || '';
    const places = Array.isArray(datum.places) ? datum.places : [];

    // Show placeholder if places are empty
    if (places.length === 0) {
        const pendingText = contentLoader.content?.services?.coverage?.coveragePending || 'Coverage details coming soon.';
        container.innerHTML = `
            <h3 class="coverage-title">${title}</h3>
            <p class="coverage-placeholder">${pendingText}</p>
        `;
    } else {
        container.innerHTML = `
            <h3 class="coverage-title">${title}</h3>
            <ul class="coverage-list">
                ${places.map(p => `<li>${p}</li>`).join('')}
            </ul>
        `;
    }
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Contact form handler
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const messageDiv = document.getElementById('formMessage');

    // Simple validation
    if (!data.name || !data.email || !data.phone || !data.service || !data.message) {
        showMessage(messageDiv, 'Please fill in all fields.', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showMessage(messageDiv, 'Please enter a valid email address.', 'error');
        return;
    }

    // Show success message (in production, send to backend)
    showMessage(messageDiv, 'Thank you for your message! We will contact you soon.', 'success');
    e.target.reset();

    // In production, you would send data to server:
    // try {
    //     const response = await fetch('/api/contact', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(data)
    //     });
    //     if (response.ok) {
    //         showMessage(messageDiv, 'Message sent successfully!', 'success');
    //     }
    // } catch (error) {
    //     showMessage(messageDiv, 'Error sending message. Please try again.', 'error');
    // }
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `form-message ${type}`;
    element.style.display = 'block';

    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}
