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
            grid.innerHTML = '<p class="no-items">Portfolio items coming soon...</p>';
        }
    }
}

function renderPortfolioItems(items) {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;

    if (items.length === 0) {
        grid.innerHTML = '<p class="no-items">No projects found in this category.</p>';
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
    const types = {
        'construction': 'Construction',
        'interior': 'Interior Design',
        'painting': 'Painting'
    };
    return types[type] || type;
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
