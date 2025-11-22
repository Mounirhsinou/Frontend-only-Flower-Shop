/**
 * FLOWER SHOP - MAIN JAVASCRIPT
 * Theme management, utilities, and UI interactions
 */

// ===================================
// THEME MANAGEMENT
// ===================================

class ThemeManager {
    constructor() {
        this.storageKey = 'theme';
        this.theme = this.loadTheme();
        this.init();
    }

    /**
     * Initialize theme
     */
    init() {
        this.applyTheme(this.theme);
        this.setupEventListeners();
    }

    /**
     * Load theme from localStorage or system preference
     */
    loadTheme() {
        const savedTheme = localStorage.getItem(this.storageKey);

        if (savedTheme) {
            return savedTheme;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    }

    /**
     * Apply theme
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.theme = theme;
        localStorage.setItem(this.storageKey, theme);
        this.updateToggleButton();
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    /**
     * Update toggle button icon
     */
    updateToggleButton() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = this.theme === 'light' ? '🌙' : '☀️';
            toggleBtn.setAttribute('aria-label', `Switch to ${this.theme === 'light' ? 'dark' : 'light'} mode`);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(this.storageKey)) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
}

// ===================================
// PRODUCT LOADING
// ===================================

class ProductLoader {
    constructor() {
        this.products = [];
        this.currentPersona = localStorage.getItem('persona') || 'default';
    }

    /**
     * Load products from JSON
     */
    async loadProducts() {
        try {
            const response = await fetch('data/products.json');
            this.products = await response.json();
            return this.products;
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        }
    }

    /**
     * Get product by ID
     */
    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    /**
     * Get product by slug
     */
    getProductBySlug(slug) {
        return this.products.find(p => p.slug === slug);
    }

    /**
     * Filter products
     */
    filterProducts(filters) {
        let filtered = [...this.products];

        // Filter by occasion
        if (filters.occasion && filters.occasion !== 'all') {
            filtered = filtered.filter(p => p.tags.includes(filters.occasion));
        }

        // Filter by color
        if (filters.color && filters.color !== 'all') {
            filtered = filtered.filter(p => p.color === filters.color);
        }

        // Filter by price range
        if (filters.minPrice !== undefined) {
            filtered = filtered.filter(p =>
                p.variants.some(v => v.price >= filters.minPrice)
            );
        }

        if (filters.maxPrice !== undefined) {
            filtered = filtered.filter(p =>
                p.variants.some(v => v.price <= filters.maxPrice)
            );
        }

        // Filter out complementary products unless specifically requested
        if (!filters.includeComplementary) {
            filtered = filtered.filter(p => !p.isComplementary);
        }

        return filtered;
    }

    /**
     * Get featured products
     */
    getFeaturedProducts() {
        return this.products.filter(p => p.featured && !p.isComplementary);
    }

    /**
     * Get image for current persona
     */
    getProductImage(product, index = 0) {
        if (this.currentPersona === 'man' && product.images.persona_man.length > 0) {
            return product.images.persona_man[index] || product.images.persona_man[0];
        } else if (this.currentPersona === 'woman' && product.images.persona_woman.length > 0) {
            return product.images.persona_woman[index] || product.images.persona_woman[0];
        }
        return product.images.default[index] || product.images.default[0];
    }

    /**
     * Set persona
     */
    setPersona(persona) {
        this.currentPersona = persona;
        localStorage.setItem('persona', persona);

        // Trigger persona change event
        const event = new CustomEvent('personaChanged', { detail: { persona } });
        window.dispatchEvent(event);
    }

    /**
     * Render product card
     */
    renderProductCard(product) {
        const image = this.getProductImage(product);
        const minPrice = Math.min(...product.variants.map(v => v.price));
        const maxPrice = Math.max(...product.variants.map(v => v.price));
        const priceDisplay = minPrice === maxPrice
            ? `$${minPrice.toFixed(2)}`
            : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;

        return `
      <div class="card product-card fade-in">
        ${product.featured ? '<span class="product-badge">Featured</span>' : ''}
        <div class="card-img-wrapper">
          <img src="img/${image}" alt="${product.name}" class="card-img" onerror="this.src='img/placeholder.jpg'">
        </div>
        <div class="card-body">
          <h3 class="card-title">${product.name}</h3>
          <div class="product-tags">
            ${product.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <p class="card-text">${product.description}</p>
          <div class="card-footer">
            <div>
              <div class="product-price">${priceDisplay}</div>
              <div class="product-price-label">Starting at</div>
            </div>
            <button class="btn btn-primary" onclick="openProductModal('${product.id}')" aria-label="View ${product.name}">
              View Details
            </button>
          </div>
        </div>
      </div>
    `;
    }
}

// ===================================
// MOBILE MENU
// ===================================

class MobileMenu {
    constructor() {
        this.init();
    }

    init() {
        const toggle = document.getElementById('mobile-menu-toggle');
        const nav = document.querySelector('.nav');
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9998;
      display: none;
    `;
        document.body.appendChild(overlay);

        if (toggle && nav) {
            toggle.addEventListener('click', () => {
                nav.classList.toggle('active');
                overlay.style.display = nav.classList.contains('active') ? 'block' : 'none';
                document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
            });

            overlay.addEventListener('click', () => {
                nav.classList.remove('active');
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            });

            // Close menu when clicking nav links
            const navLinks = nav.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    nav.classList.remove('active');
                    overlay.style.display = 'none';
                    document.body.style.overflow = '';
                });
            });
        }
    }
}

// ===================================
// SCROLL ANIMATIONS
// ===================================

class ScrollAnimations {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, options);

        // Observe all elements with fade-in class
        this.observeElements();

        // Re-observe when new elements are added
        const mutationObserver = new MutationObserver(() => {
            this.observeElements();
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    observeElements() {
        const elements = document.querySelectorAll('.fade-in:not(.visible)');
        elements.forEach(el => this.observer.observe(el));
    }
}

// ===================================
// PRODUCT MODAL
// ===================================

function openProductModal(productId) {
    const product = productLoader.getProductById(productId);
    if (!product) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'product-modal';

    const defaultVariant = product.variants[0];
    let selectedVariant = defaultVariant;
    let selectedQuantity = 1;

    const variantOptions = product.variants.map((variant, index) => `
    <label class="variant-option">
      <input type="radio" name="variant" value="${index}" ${index === 0 ? 'checked' : ''}>
      <span>${variant.size} - $${variant.price.toFixed(2)}</span>
    </label>
  `).join('');

    modal.innerHTML = `
    <div class="modal" role="dialog" aria-labelledby="modal-title" aria-modal="true">
      <div class="modal-header">
        <h2 id="modal-title">${product.name}</h2>
        <button class="modal-close" aria-label="Close modal">✕</button>
      </div>
      <div class="modal-body">
        <div class="product-modal-grid">
          <div class="product-images">
            <img src="img/${productLoader.getProductImage(product)}" alt="${product.name}" class="product-main-image" onerror="this.src='img/placeholder.jpg'">
            ${!product.isComplementary ? `
              <div class="persona-toggle">
                <button class="persona-btn ${productLoader.currentPersona === 'default' ? 'active' : ''}" data-persona="default">Default</button>
                <button class="persona-btn ${productLoader.currentPersona === 'man' ? 'active' : ''}" data-persona="man">Man</button>
                <button class="persona-btn ${productLoader.currentPersona === 'woman' ? 'active' : ''}" data-persona="woman">Woman</button>
              </div>
            ` : ''}
          </div>
          <div class="product-details">
            <div class="product-tags">
              ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <p class="product-description">${product.description}</p>
            
            <div class="variant-selector">
              <h4>Select Size:</h4>
              ${variantOptions}
            </div>
            
            <div class="quantity-selector">
              <h4>Quantity:</h4>
              <div class="quantity-controls">
                <button class="quantity-btn" id="qty-decrease">−</button>
                <span class="quantity" id="qty-display">1</span>
                <button class="quantity-btn" id="qty-increase">+</button>
              </div>
            </div>
            
            <div class="product-price-display">
              <span class="product-price" id="modal-price">$${defaultVariant.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeProductModal()">Cancel</button>
        <button class="btn btn-primary" id="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    // Event listeners
    modal.querySelector('.modal-close').addEventListener('click', closeProductModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeProductModal();
    });

    // Variant selection
    modal.querySelectorAll('input[name="variant"]').forEach(input => {
        input.addEventListener('change', (e) => {
            selectedVariant = product.variants[parseInt(e.target.value)];
            updateModalPrice();
        });
    });

    // Quantity controls
    const qtyDisplay = modal.querySelector('#qty-display');
    modal.querySelector('#qty-decrease').addEventListener('click', () => {
        if (selectedQuantity > 1) {
            selectedQuantity--;
            qtyDisplay.textContent = selectedQuantity;
            updateModalPrice();
        }
    });

    modal.querySelector('#qty-increase').addEventListener('click', () => {
        selectedQuantity++;
        qtyDisplay.textContent = selectedQuantity;
        updateModalPrice();
    });

    // Persona toggle
    modal.querySelectorAll('.persona-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const persona = e.target.dataset.persona;
            productLoader.setPersona(persona);
            modal.querySelectorAll('.persona-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const mainImage = modal.querySelector('.product-main-image');
            mainImage.src = `img/${productLoader.getProductImage(product)}`;
        });
    });

    // Add to cart
    modal.querySelector('#add-to-cart-btn').addEventListener('click', () => {
        cart.addItem(product, selectedVariant, selectedQuantity);
        closeProductModal();
    });

    function updateModalPrice() {
        const priceEl = modal.querySelector('#modal-price');
        const totalPrice = selectedVariant.price * selectedQuantity;
        priceEl.textContent = `$${totalPrice.toFixed(2)}`;
    }
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// ===================================
// NEWSLETTER SUBSCRIPTION
// ===================================

function subscribeNewsletter(email) {
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }

    // In a real app, this would submit to a backend
    // For now, just show success message
    showNotification('Thank you for subscribing! 🌹', 'success');

    // Save to localStorage (optional)
    const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
    if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('subscribers', JSON.stringify(subscribers));
    }

    return true;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${type === 'error' ? 'var(--color-error)' : 'var(--color-primary)'};
    color: white;
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
  `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===================================
// UTILITIES
// ===================================

/**
 * Format currency
 */
function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

/**
 * Debounce function
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
 * Set active nav link
 */
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ===================================
// INITIALIZATION
// ===================================

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize theme
    window.themeManager = new ThemeManager();

    // Initialize mobile menu
    new MobileMenu();

    // Initialize scroll animations
    new ScrollAnimations();

    // Initialize product loader
    window.productLoader = new ProductLoader();
    await productLoader.loadProducts();

    // Set active nav link
    setActiveNavLink();

    // Make functions globally accessible
    window.openProductModal = openProductModal;
    window.closeProductModal = closeProductModal;
    window.subscribeNewsletter = subscribeNewsletter;
    window.showNotification = showNotification;
    window.formatCurrency = formatCurrency;
});

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
    // Close modals on Escape
    if (e.key === 'Escape') {
        const productModal = document.getElementById('product-modal');
        if (productModal) closeProductModal();

        const cartOverlay = document.getElementById('cart-overlay');
        if (cartOverlay && cartOverlay.classList.contains('active')) {
            cartOverlay.classList.remove('active');
        }
    }
});
