/* 
   CHRONÉA Luxury Watches - Main Script
   Handles: Sticky Header, Mobile Menu, Wishlist, Form Validation, Theme Toggle, Profile Dropdown
*/

// Theme Initialization (Immediate)
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.setAttribute('data-theme', 'light');
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('ion-icon');

            if (navMenu.classList.contains('active')) {
                icon.setAttribute('name', 'close-outline');
                document.body.style.overflow = 'hidden'; // Lock background
            } else {
                icon.setAttribute('name', 'menu-outline');
                document.body.style.overflow = ''; // Unlock background
            }
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = mobileToggle.querySelector('ion-icon');
                icon.setAttribute('name', 'menu-outline');
                document.body.style.overflow = '';
            });
        });
    }

    // 3. Theme Toggle Button Logic
    const themeBtn = document.getElementById('theme-toggle');

    // Update icon if theme is already light
    if (savedTheme === 'light' && themeBtn) {
        themeBtn.querySelector('ion-icon').setAttribute('name', 'moon-outline');
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const icon = themeBtn.querySelector('ion-icon');

            if (currentTheme === 'light') {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
                icon.setAttribute('name', 'sunny-outline');
            } else {
                document.body.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                icon.setAttribute('name', 'moon-outline');
            }
        });
    }

    // 4. Profile Dropdown Logic Removed
    // Buttons replaced with separate Login / Sign Up links in HTML

    // 5. Wishlist System
    const wishlistKey = 'chronea_wishlist';

    // Helper: Get Wishlist
    function getWishlist() {
        return JSON.parse(localStorage.getItem(wishlistKey)) || [];
    }

    // Helper: Save Wishlist
    function saveWishlist(wishlist) {
        localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
        updateWishlistBadge();
    }

    // Update Badge
    function updateWishlistBadge() {
        const wishlist = getWishlist();
        const badges = document.querySelectorAll('.wishlist-badge');
        badges.forEach(badge => {
            badge.textContent = wishlist.length;
            if (wishlist.length > 0) {
                badge.classList.add('show');
            } else {
                badge.classList.remove('show');
            }
        });
    }

    // Add to Wishlist
    function addToWishlist(product) {
        let wishlist = getWishlist();
        // Check for duplicate
        if (!wishlist.some(item => item.name === product.name)) {
            wishlist.push(product);
            saveWishlist(wishlist);

            // Visual feedback if button clicked
            const btn = document.querySelector(`.wishlist-btn-card[data-name="${product.name}"] ion-icon`);
            if (btn) {
                btn.setAttribute('name', 'heart');
                btn.parentElement.classList.add('active');
            }
        } else {
            // Optional: Remove if already added (toggle behavior)
            removeFromWishlist(product.name);
        }
    }

    // Remove from Wishlist
    function removeFromWishlist(productName) {
        let wishlist = getWishlist();
        wishlist = wishlist.filter(item => item.name !== productName);
        saveWishlist(wishlist);

        // Update UI if on wishlist page
        if (window.location.pathname.includes('wishlist.html')) {
            renderWishlistPage();
        }

        // Reset button state if visible
        const btn = document.querySelector(`.wishlist-btn-card[data-name="${productName}"] ion-icon`);
        if (btn) {
            btn.setAttribute('name', 'heart-outline');
            btn.parentElement.classList.remove('active');
        }
    }

    // Render Wishlist Page
    function renderWishlistPage() {
        const container = document.getElementById('wishlist-container');
        const emptyMsg = document.getElementById('empty-wishlist-msg');
        if (!container) return; // Not on wishlist page

        const wishlist = getWishlist();

        // clear existing (except empty msg)
        Array.from(container.children).forEach(child => {
            if (child.id !== 'empty-wishlist-msg') container.removeChild(child);
        });

        if (wishlist.length === 0) {
            if (emptyMsg) emptyMsg.style.display = 'block';
        } else {
            if (emptyMsg) emptyMsg.style.display = 'none';
            wishlist.forEach(item => {
                const article = document.createElement('article');
                article.className = 'product-card';
                article.innerHTML = `
                    <div style="position: relative;">
                        <img src="${item.img}" alt="${item.name}" class="product-img">
                    </div>
                    <div class="product-info">
                        <div class="product-cat">${item.cat}</div>
                        <h3 class="product-title">${item.name}</h3>
                        <div class="product-price">${item.price}</div>
                        <a href="${item.link}" class="btn btn-outline" style="width: 100%;">View Details</a>
                        <button class="remove-btn" onclick="window.removeItemFromWishlist('${item.name}')">Remove from Wishlist</button>
                    </div>
                `;
                container.appendChild(article);
            });
        }
    }

    // Expose remove function globally for onclick event
    window.removeItemFromWishlist = removeFromWishlist;

    // Initial Load
    updateWishlistBadge();
    renderWishlistPage();

    // Attach Event Listeners to "Add to Wishlist" buttons (Delegation)
    document.body.addEventListener('click', (e) => {
        // Case 1: Card Button
        const cardBtn = e.target.closest('.wishlist-btn-card');
        if (cardBtn) {
            e.preventDefault();
            e.stopPropagation();

            const card = cardBtn.closest('.product-card');
            const name = card.querySelector('.product-title').innerText;

            const product = {
                name: name,
                cat: card.querySelector('.product-cat').innerText,
                price: card.querySelector('.product-price').innerText,
                img: card.querySelector('img').src,
                link: card.querySelector('a').href
            };

            addToWishlist(product);
            return;
        }

        // Case 2: Details Page Button
        const detailsBtn = e.target.closest('.wishlist-btn-details');
        if (detailsBtn) {
            e.preventDefault();
            // Scrape details from page
            const name = document.querySelector('h1').innerText;
            const cat = document.querySelector('.product-cat').innerText;
            const price = document.querySelector('h2').innerText; // Price is h2
            const img = document.querySelector('.detail-img-wrapper img').src;

            const product = {
                name: name,
                cat: cat, // "Moonphase Collection"
                price: price,
                img: img,
                link: window.location.href
            };

            addToWishlist(product);

            // Toggle visual state
            const icon = detailsBtn.querySelector('ion-icon');
            const isFilled = icon.getAttribute('name') === 'heart';
            if (!isFilled) {
                icon.setAttribute('name', 'heart');
                detailsBtn.innerHTML = '<ion-icon name="heart" style="vertical-align: middle; margin-right: 5px; color: var(--color-accent);"></ion-icon> Added to Wishlist';
            } else {
                // Optional: remove?
                removeFromWishlist(name);
                icon.setAttribute('name', 'heart-outline');
                detailsBtn.innerHTML = '<ion-icon name="heart-outline" style="vertical-align: middle; margin-right: 5px;"></ion-icon> Add to Wishlist';
            }
        }
    });

    // Mark existing buttons as active
    const wishlist = getWishlist();
    wishlist.forEach(item => {
        // Card Buttons
        const btn = document.querySelector(`.wishlist-btn-card[data-name="${item.name}"]`);
        if (btn) {
            btn.classList.add('active');
            btn.querySelector('ion-icon').setAttribute('name', 'heart');
        }

        // Details Button (match by H1 text)
        const h1 = document.querySelector('h1');
        if (h1 && h1.innerText === item.name) {
            const dBtn = document.querySelector('.wishlist-btn-details');
            if (dBtn) {
                dBtn.innerHTML = '<ion-icon name="heart" style="vertical-align: middle; margin-right: 5px; color: var(--color-accent);"></ion-icon> Added to Wishlist';
            }
        }
    });

    // 6. Form Validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            const inputs = form.querySelectorAll('input, textarea');

            inputs.forEach(input => {
                if (input.hasAttribute('required') && !input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = 'red';
                } else {
                    input.style.borderColor = 'var(--color-border)';
                }
            });

            const submitBtn = form.querySelector('button[type="submit"]');
            if (isValid && submitBtn) {
                const originalText = submitBtn.innerText;
                submitBtn.innerText = 'Sent Successfully';
                submitBtn.style.backgroundColor = 'green';
                submitBtn.style.color = 'white';
                setTimeout(() => {
                    form.reset();
                    submitBtn.innerText = originalText;
                    submitBtn.style.backgroundColor = 'var(--color-accent)';
                }, 3000);
            }
        });
    });


    // 7. Shop Filtering & Sorting
    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
        const products = Array.from(productGrid.getElementsByClassName('product-card'));
        const genderCheckboxes = document.querySelectorAll('input[name="gender"]');
        const sortSelect = document.getElementById('sort-select');

        function filterAndSort() {
            // 1. Filter
            const selectedGenders = Array.from(genderCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            products.forEach(product => {
                const productGender = product.getAttribute('data-gender');
                // If no gender selected, show all. If selected, check if product gender is in list.
                const isVisible = selectedGenders.length === 0 || selectedGenders.includes(productGender);
                product.style.display = isVisible ? 'block' : 'none';
            });

            // 2. Sort
            if (sortSelect) {
                const sortValue = sortSelect.value;
                const visibleProducts = products.filter(p => p.style.display !== 'none');

                // We sort the full array to keep DOM order consistent when filters change/reset
                products.sort((a, b) => {
                    if (sortValue === 'name') {
                        return a.dataset.name.localeCompare(b.dataset.name);
                    } else if (sortValue === 'new') {
                        return new Date(b.dataset.date) - new Date(a.dataset.date);
                    } else if (sortValue === 'movement') {
                        return a.dataset.movement.localeCompare(b.dataset.movement);
                    } else if (sortValue === 'material') {
                        return a.dataset.material.localeCompare(b.dataset.material);
                    }
                    return 0; // Default
                });

                // Re-append ordered products
                products.forEach(p => productGrid.appendChild(p));
            }
        }

        // Attach Listeners
        genderCheckboxes.forEach(cb => cb.addEventListener('change', filterAndSort));
        if (sortSelect) sortSelect.addEventListener('change', filterAndSort);
    }

    // 8. Back to Top Button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Back to Top');
    backToTopBtn.innerHTML = '<ion-icon name="arrow-up-outline"></ion-icon>';
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    // 9. Scroll Animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Stop observing once visible to run only once
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Auto-select elements to animate if they don't have manual classes yet
    // We target common block elements to apply the default 'fade-up'
    const animateTargets = document.querySelectorAll('.section, .product-card, .hero-content, .hero-btns, .feature-item, footer, .auth-card');

    animateTargets.forEach((el, index) => {
        el.classList.add('animate-on-scroll');

        // Add staggering for grids
        if (el.classList.contains('product-card') || el.classList.contains('feature-item')) {
            // Simple stagger visual within the same container roughly
            // We can randomly assign a delay or based on child index
        }

        scrollObserver.observe(el);
    });

    // Manual Left/Right targets (e.g., text-heavy sections alternating)
    const leftTargets = document.querySelectorAll('.animate-left-prox');
    leftTargets.forEach(el => {
        el.classList.add('animate-on-scroll', 'animate-left');
        scrollObserver.observe(el);
    });
    // 10. Dynamic Product Details Logic
    const productData = {
        'gold-horizon': {
            name: 'Gold Horizon',
            cat: 'Moonphase Collection',
            model: 'REF-2026-GH',
            price: 'Price on Request',
            description: 'A masterpiece of horological engineering, the Gold Horizon features a hand-finished rose gold case and a precision moonphase complication.',
            movement: 'Automatic Caliber 4040',
            case: '18k Rose Gold',
            diameter: '42 mm',
            water: '50 Meters',
            strap: 'Alligator Leather',
            img: 'https://images.pexels.com/photos/9203637/pexels-photo-9203637.jpeg',
            story: 'Every Gold Horizon timepiece takes over 300 hours to assemble. Our master watchmakers in Geneva ensure that every gear, spring, and jewel is placed with absolute perfection.'
        },
        'silver-chrono-ii': {
            name: 'Silver Chrono II',
            cat: 'Chronograph Collection',
            model: 'REF-2026-SC',
            price: 'Price on Request',
            description: 'The Silver Chrono II is designed for those who value precision and performance. Its sleek stainless steel design is perfect for any occasion.',
            movement: 'Automatic Chronograph',
            case: 'Stainless Steel',
            diameter: '40 mm',
            water: '100 Meters',
            strap: 'Metal Bracelet',
            img: 'images/watch-silver.png',
            story: 'Born from the world of high-speed racing, the Silver Chrono II combines rugged durability with refined Swiss elegance.'
        },
        'royal-emblem': {
            name: 'Royal Emblem',
            cat: 'Heritage Series',
            model: 'REF-2026-RE',
            price: 'Price on Request',
            description: 'An icon of timeless design, the Royal Emblem represents the pinnacle of CHRONÉA heritage and traditional watchmaking.',
            movement: 'Manual Wind Caliber 1924',
            case: '18k Yellow Gold',
            diameter: '38 mm',
            water: '30 Meters',
            strap: 'Calfskin Leather',
            img: 'images/watch-gold.png',
            story: 'Inspired by our first creation in 1924, the Royal Emblem is a tribute to a century of uncompromising quality.'
        },
        'aviator-x': {
            name: 'Aviator X',
            cat: 'Pilot Collection',
            model: 'REF-2025-AX',
            price: 'Price on Request',
            description: 'Engineered for the skies, the Aviator X features high visibility and extreme precision in a durable titanium shell.',
            movement: 'Quartz High-Precision',
            case: 'Titanium',
            diameter: '44 mm',
            water: '100 Meters',
            strap: 'Nylon Tech Strap',
            img: 'https://images.pexels.com/photos/3083461/pexels-photo-3083461.jpeg',
            story: 'The Aviator X was developed in collaboration with elite pilots to ensure maximum reliability in the most demanding environments.'
        },
        'celestial-rose': {
            name: 'Celestial Rose',
            cat: 'Moonphase Series',
            model: 'REF-2026-CR',
            price: 'Price on Request',
            description: 'Graceful and evocative, the Celestial Rose captures the beauty of the night sky on your wrist.',
            movement: 'Automatic Caliber 3030',
            case: '18k Rose Gold',
            diameter: '36 mm',
            water: '30 Meters',
            strap: 'Satin Silk Strap',
            img: 'https://images.pexels.com/photos/30639797/pexels-photo-30639797.jpeg',
            story: 'A tribute to the stars, each Celestial Rose features a unique mother-of-pearl dial and hand-set diamonds.'
        },
        'deep-dive-pro': {
            name: 'Deep Dive Pro',
            cat: 'Diver Collection',
            model: 'REF-2025-DD',
            price: 'Price on Request',
            description: 'The ultimate tool for the modern explorer, built to withstand the pressures of the deep ocean.',
            movement: 'Automatic Caliber 5050',
            case: 'Brushed Titanium',
            diameter: '45 mm',
            water: '300 Meters',
            strap: 'Rubber Dive Strap',
            img: 'https://images.pexels.com/photos/11106320/pexels-photo-11106320.jpeg',
            story: 'Tested in the deepest reaches of the Mediterranean, the Deep Dive Pro is more than a watch—it is vital equipment.'
        },
        'pearl-essence': {
            name: 'Pearl Essence',
            cat: 'Jewelry Series',
            model: 'REF-2026-PE',
            price: 'Price on Request',
            description: 'Where fine jewelry meets master horology. A delicate timepiece for the most formal occasions.',
            movement: 'Ultra-Thin Quartz',
            case: 'Platinum',
            diameter: '32 mm',
            water: 'Splashes Only',
            strap: 'Diamond-Set Bracelet',
            img: 'https://images.pexels.com/photos/12215971/pexels-photo-12215971.jpeg',
            story: 'The Pearl Essence takes over 500 hours of jewel-setting alone, ensuring every diamond catches the light perfectly.'
        },
        'grand-master': {
            name: 'Grand Master',
            cat: 'Complication Collection',
            model: 'REF-2025-GM',
            price: 'Price on Request',
            description: 'Our most complex movement yet, featuring a perpetual calendar and minute repeater.',
            movement: 'Manual Wind Complication',
            case: '18k White Gold',
            diameter: '43 mm',
            water: '50 Meters',
            strap: 'Croc-Embossed Leather',
            img: 'https://images.pexels.com/photos/3766111/pexels-photo-3766111.jpeg',
            story: 'The Grand Master represents the summit of our watchmakers\' skill, containing over 800 individual components.'
        },
        'speedster-gt': {
            name: 'Speedster GT',
            cat: 'Racing Series',
            model: 'REF-2025-GT',
            price: 'Price on Request',
            description: 'High-tech materials and high-speed design come together in this lightweight carbon fiber chronograph.',
            movement: 'Automatic Chronograph 9000',
            case: 'Carbon Fiber',
            diameter: '44 mm',
            water: '50 Meters',
            strap: 'Perforated Racing Leather',
            img: 'https://images.pexels.com/photos/10478973/pexels-photo-10478973.jpeg',
            story: 'The Speedster GT uses actual carbon fiber from Formula 1 chassis, making it one of the lightest chronographs in the world.'
        }
    };

    // Populate Details Page
    if (window.location.pathname.includes('product-details.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id') || 'gold-horizon'; // Default
        const product = productData[productId];

        if (product) {
            // Update Title & Meta
            document.title = `${product.name} | CHRONÉA`;

            // Update Image
            const detailImg = document.querySelector('.detail-img-wrapper img');
            if (detailImg) {
                detailImg.src = product.img;
                detailImg.alt = product.name;
            }

            // Update Info
            const catEl = document.querySelector('.product-cat');
            const h1El = document.querySelector('h1');
            const modelEl = document.querySelector('.detail-info p[style*="font-size: 1.2rem"]'); // Model No.
            const priceEl = document.querySelector('.detail-info h2');

            if (catEl) catEl.innerText = product.cat;
            if (h1El) h1El.innerText = product.name;
            if (modelEl) modelEl.innerText = `Model No. ${product.model}`;
            if (priceEl) priceEl.innerText = product.price;

            // Description logic
            const detailInfo = document.querySelector('.detail-info');
            if (detailInfo) {
                const paragraphs = Array.from(detailInfo.querySelectorAll('p'));
                // The description is usually the second p or the one after price h2
                const descP = paragraphs.find(p => !p.style.fontSize); // Simple heuristic
                if (descP) descP.innerText = product.description;
            }

            // Update Specs
            const specItems = document.querySelectorAll('.spec-item');
            if (specItems.length >= 5) {
                specItems[0].querySelector('span:last-child').innerText = product.movement;
                specItems[1].querySelector('span:last-child').innerText = product.case;
                specItems[2].querySelector('span:last-child').innerText = product.diameter;
                specItems[3].querySelector('span:last-child').innerText = product.water;
                specItems[4].querySelector('span:last-child').innerText = product.strap;
            }

            // Update Story
            const storySection = document.querySelector('section.section.bg-darker');
            if (storySection) {
                const storyP = storySection.querySelector('p');
                if (storyP) storyP.innerText = product.story;
            }
        }
    }


    // 7. Curated Selections Scroll (Home 2)
    const curatedScroll = document.getElementById('curated-scroll');
    const prevCuratedBtn = document.getElementById('prev-curated');
    const nextCuratedBtn = document.getElementById('next-curated');

    if (curatedScroll && prevCuratedBtn && nextCuratedBtn) {
        prevCuratedBtn.addEventListener('click', () => {
            curatedScroll.scrollBy({ left: -400, behavior: 'smooth' });
        });

        nextCuratedBtn.addEventListener('click', () => {
            curatedScroll.scrollBy({ left: 400, behavior: 'smooth' });
        });
    }
    // 8. Mobile Filter Toggle (Shop Page)
    const filterBtn = document.getElementById('filter-toggle');
    const filtersSidebar = document.querySelector('.filters');

    if (filterBtn && filtersSidebar) {
        filterBtn.addEventListener('click', () => {
            filtersSidebar.classList.toggle('active');

            const icon = filterBtn.querySelector('ion-icon');
            if (filtersSidebar.classList.contains('active')) {
                icon.setAttribute('name', 'close-outline');
            } else {
                icon.setAttribute('name', 'options-outline');
            }
        });
    }
});
