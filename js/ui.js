/**
 * UI & Interactions Module
 * Handles custom cursor, scroll effects, navigation, and visual polish
 */

export const initUI = () => {
    // ----------------------------------------------------------------------
    // CUSTOM CURSOR
    // ----------------------------------------------------------------------
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');

    if (window.matchMedia("(pointer: fine)").matches && cursor && follower) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            setTimeout(() => {
                follower.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            }, 50);
        });

        const hoverables = document.querySelectorAll('a, button, .project-card, .timeline-content');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('hover-effect'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('hover-effect'));
        });
    }

    // ----------------------------------------------------------------------
    // SCROLL REVEAL (Observer)
    // ----------------------------------------------------------------------
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    const hiddenElements = [
        ...document.querySelectorAll('.section-title'),
        ...document.querySelectorAll('.project-card'),
        ...document.querySelectorAll('.timeline-item'),
        ...document.querySelectorAll('.skill-category')
    ];

    hiddenElements.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        observer.observe(el);
    });

    // ----------------------------------------------------------------------
    // NAVBAR SCROLL EFFECT
    // ----------------------------------------------------------------------
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
    }

    // ----------------------------------------------------------------------
    // MOBILE MENU
    // ----------------------------------------------------------------------
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Icon animation
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // ----------------------------------------------------------------------
    // SMOOTH SCROLL
    // ----------------------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ----------------------------------------------------------------------
    // TILT EFFECT
    // ----------------------------------------------------------------------
    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            card.style.transform = `perspective(1000px) rotateX(${((y - centerY) / centerY) * -5}deg) rotateY(${((x - centerX) / centerX) * 5}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}
