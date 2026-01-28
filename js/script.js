/* 
   CHRONÉA Luxury Watches - Main Script
   Handles: Sticky Header, Mobile Menu, Wishlist, Form Validation, Theme Toggle, Profile Dropdown
*/

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
    const navContainer = document.querySelector('.header .container');
    const existingNav = document.querySelector('.nav-menu');

    if (navContainer && window.innerWidth < 1024) {
        const toggleBtn = document.createElement('button');
        toggleBtn.classList.add('icon-btn', 'mobile-toggle');
        toggleBtn.innerHTML = '<ion-icon name="menu-outline"></ion-icon>';
        toggleBtn.style.cssText = 'font-size: 2rem; z-index: 1001; order: -1; margin-right: auto;';

        // Insert at the start of container (left side) or before Logo? 
        // User wants Left: Brand. Right: Icons. Center: Menu.
        // For mobile, Hamburger usually goes Left or Right.
        // Let's put it on the far right for now to avoid breaking logo layout.
        const headerIcons = document.querySelector('.header-icons');
        headerIcons.insertBefore(toggleBtn, headerIcons.firstChild);

        toggleBtn.addEventListener('click', () => {
            existingNav.classList.toggle('active');
            const icon = toggleBtn.querySelector('ion-icon');

            if (existingNav.classList.contains('active')) {
                icon.setAttribute('name', 'close-outline');
                // Styles are now handled in CSS for better control
            } else {
                icon.setAttribute('name', 'menu-outline');
                existingNav.removeAttribute('style'); // Clean up any lingering inline styles
            }
        });
    }

    // 3. Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');

    // Apply saved theme
    if (savedTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        if (themeBtn) themeBtn.querySelector('ion-icon').setAttribute('name', 'moon-outline');
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

    // 4. Profile Dropdown
    const profileBtn = document.getElementById('profile-btn');
    const profileWrapper = document.querySelector('.profile-wrapper');

    if (profileBtn && profileWrapper) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileWrapper.classList.toggle('active');
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!profileWrapper.contains(e.target)) {
                profileWrapper.classList.remove('active');
            }
        });
    }

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
});
