/**
 * @file script.js
 * @description Skrip utama untuk fungsionalitas interaktif, animasi, dan optimasi performa.
 * @version 1.1.0
 * @date 27 Juni 2025
 */

// =================================================================================
// FUNGSI BANTU (HELPER FUNCTIONS)
// Definisi fungsi-fungsi ini bisa berada di luar karena tidak berinteraksi
// langsung dengan DOM saat didefinisikan.
// =================================================================================

/**
 * Mencegah fungsi dijalankan berulang kali dalam waktu singkat.
 * Sangat berguna untuk event seperti 'scroll' atau 'resize' untuk meningkatkan performa.
 * @param {Function} func Fungsi yang ingin dijalankan setelah waktu tunggu.
 * @param {number} wait Waktu tunggu dalam milidetik (ms).
 * @returns {Function} Fungsi baru yang sudah di-debounce.
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Fungsi untuk validasi form (Contoh).
 * @param {HTMLFormElement} form Elemen form yang akan divalidasi.
 * @returns {boolean} True jika valid, false jika tidak.
 */
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });
    return isValid;
}

/**
 * Fungsi untuk animasi mengetik (Contoh).
 * @param {HTMLElement} element Elemen untuk menampilkan teks.
 * @param {string} text Teks yang akan diketik.
 * @param {number} speed Kecepatan mengetik dalam ms.
 */
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}


// =================================================================================
// SKRIP UTAMA (MAIN SCRIPT)
// Semua kode yang memanipulasi DOM dibungkus dalam 'DOMContentLoaded' untuk
// memastikan semua elemen HTML sudah siap saat skrip dijalankan.
// =================================================================================

document.addEventListener('DOMContentLoaded', function() {

    // --- 1. SELEKSI ELEMEN PENTING ---
    // Menyimpan elemen yang sering diakses ke dalam variabel untuk performa lebih baik.
    const navbar = document.querySelector('.navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const allSections = document.querySelectorAll('section[id]');
    const floatingElements = document.querySelectorAll('.floating-element');
    const themeToggle = document.getElementById('themeToggle');
    const serviceCards = document.querySelectorAll('.service-card');
    const featureBoxes = document.querySelectorAll('.feature-box');
    const buttons = document.querySelectorAll('.btn');
    const lazyImages = document.querySelectorAll('img[data-src]');


    // --- 2. LOGIKA HAMBURGER MENU (TERPUSAT DAN BERSIH) ---
    if (hamburger && navMenu) {
        // Buka/tutup menu saat ikon hamburger di-klik
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation(); // Mencegah event 'click' menyebar ke document
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Tutup menu saat link di dalam menu di-klik (penting untuk UX mobile)
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        });

        // Tutup menu saat pengguna meng-klik di luar area menu
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }


    // --- 3. FUNGSI UNTUK SEMUA EVENT SCROLL (TEROPTIMASI) ---
    const handleScrollEvents = () => {
        const scrollY = window.scrollY;

        // a. Efek background pada navbar
        if (navbar) {
            if (scrollY > 50) {
                navbar.style.background = 'rgba(10, 14, 39, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
            } else {
                navbar.style.background = 'rgba(10, 14, 39, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        }

        // b. Menandai link navigasi yang sedang aktif
        let currentSectionId = '';
        allSections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= (sectionTop - 200)) { // Offset 200px untuk akurasi
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            // Gunakan `endsWith` untuk mencocokkan '#id' dengan lebih aman
            if (link.href && link.href.endsWith('#' + currentSectionId)) {
                link.classList.add('active');
            }
        });

        // c. Efek Parallax pada elemen 'floating'
        floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.08; // Kecepatan berbeda untuk setiap elemen
            const movement = scrollY * -0.2 * speed;
            element.style.transform = `translateY(${movement}px)`;
        });
    };

    // Menerapkan fungsi scroll dengan debounce untuk mencegah pemanggilan berlebihan
    window.addEventListener('scroll', debounce(handleScrollEvents, 10));


    // --- 4. SMOOTH SCROLLING UNTUK JANGKAR (ANCHOR LINKS) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });


    // --- 5. INTERSECTION OBSERVER UNTUK ANIMASI DAN LAZY LOADING ---
    // a. Observer untuk animasi elemen yang masuk ke viewport
    const animateObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target); // Hentikan observasi setelah animasi berjalan
            }
        });
    }, { threshold: 0.1 });

    serviceCards.forEach(el => animateObserver.observe(el));
    featureBoxes.forEach(el => animateObserver.observe(el));

    // b. Observer untuk Lazy Loading gambar
    const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src; // Ganti src dengan data-src
                img.removeAttribute('data-src');
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => lazyLoadObserver.observe(img));


    // --- 6. EFEK INTERAKTIF LAINNYA ---
    // a. Efek hover pada kartu layanan
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-8px) scale(1.02)');
        card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0) scale(1)');
    });

    // b. Efek riak (ripple) pada tombol
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            setTimeout(() => ripple.remove(), 500);
        });
    });

    // c. Toggle tema (light/dark mode)
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('night-mode');
            const icon = themeToggle.querySelector('i');
            const isNightMode = document.body.classList.contains('night-mode');
            // Ganti ikon berdasarkan tema
            icon.classList.toggle('fa-sun', isNightMode);
            icon.classList.toggle('fa-moon', !isNightMode);
            // Simpan preferensi tema di localStorage (opsional)
            // localStorage.setItem('theme', isNightMode ? 'night' : 'light');
        });
    }


    // --- 7. LOADING SCREEN ---
    // Menghilangkan layar loading setelah semua aset halaman dimuat
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        const preloader = document.getElementById('preloader');
        if(preloader) {
            setTimeout(() => preloader.style.display = 'none', 500);
        }
    });

    // --- PANGGIL FUNGSI TAMBAHAN DI SINI JIKA DIPERLUKAN ---
    // Contoh:
    // const heroTitle = document.querySelector('.hero-title');
    // if(heroTitle) {
    //     typeWriter(heroTitle, "Selamat Datang di Website Kami", 120);
    // }
});