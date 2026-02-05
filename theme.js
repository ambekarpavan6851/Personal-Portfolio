// theme.js

// Constants
const THEME_KEY = 'theme-preference';
const TOGGLE_ID = 'theme-toggle';
const SECTIONS_SELECTOR = 'section';
const NAV_LINKS_SELECTOR = '.main-nav a';

// --- Theme Management ---

function getStoredTheme() {
    return localStorage.getItem(THEME_KEY);
}

function storeTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
}

function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    const btn = document.getElementById(TOGGLE_ID);
    if (btn) {
        const isDark = theme === 'dark';
        btn.textContent = isDark ? '☀️' : '🌙';
        btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        btn.setAttribute('aria-pressed', isDark);
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storeTheme(next);
}

function initTheme() {
    const stored = getStoredTheme();
    const system = getSystemTheme();

    // Apply initial theme: stored > system > light
    applyTheme(stored || system);

    // Watch for system changes if no preference is stored
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!getStoredTheme()) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Toggle button listener
    const btn = document.getElementById(TOGGLE_ID);
    if (btn) {
        btn.addEventListener('click', toggleTheme);
    }
}

// --- Scroll Animations & Navigation ---

function initScrollObserver() {
    const sections = document.querySelectorAll(SECTIONS_SELECTOR);
    const navLinks = document.querySelectorAll(NAV_LINKS_SELECTOR);

    // 1. Section Reveal Animation
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.15, // Trigger when 15% of section is visible
        rootMargin: '0px 0px -50px 0px'
    });

    sections.forEach(section => {
        revealObserver.observe(section);
    });

    // 2. Active Link Highlighting
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active from all
                navLinks.forEach(link => link.classList.remove('active'));

                // Add active to current
                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`.main-nav a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the section is visible
    });

    sections.forEach(section => {
        navObserver.observe(section);
    });
}

// --- Smooth Scroll Fix (Optional for older browsers, adds nice offset) ---
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Update URL without jump
                history.pushState(null, null, targetId);
            }
        });
    });
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initScrollObserver();
    initSmoothScroll();

    // Force header visible immediately
    const header = document.querySelector('.header');
    if (header) header.style.opacity = '1';
});
