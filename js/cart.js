/**
 * FLOWER SHOP - CART MANAGEMENT
 * Client-side shopping cart with localStorage persistence
 */

class ShoppingCart {
  constructor() {
    this.storageKey = 'flowerCart';
    this.cart = this.loadCart();
    this.init();
  }

  /**
   * Initialize cart - update UI and set up event listeners
   */
  init() {
    this.updateCartUI();
    this.setupEventListeners();
  }

  /**
   * Load cart from localStorage
   */
  loadCart() {
    try {
      const cartData = localStorage.getItem(this.storageKey);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  }

  /**
   * Save cart to localStorage
   */
  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
      this.updateCartUI();
      this.dispatchCartUpdateEvent();
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  /**
   * Dispatch custom event when cart is updated
   */
  dispatchCartUpdateEvent() {
    const event = new CustomEvent('cartUpdated', {
      detail: {
        cart: this.cart,
        itemCount: this.getItemCount(),
        total: this.getTotal()
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Add item to cart
   * @param {Object} product - Product object
   * @param {Object} variant - Selected variant
   * @param {Number} quantity - Quantity to add
   */
  addItem(product, variant, quantity = 1) {
    const existingItemIndex = this.cart.findIndex(
      item => item.productId === product.id && item.variantSize === variant.size
    );

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      this.cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      this.cart.push({
        productId: product.id,
        name: product.name,
        variantSize: variant.size,
        price: variant.price,
        quantity: quantity,
        image: product.images.default[0],
        slug: product.slug
      });
    }

    this.saveCart();
    this.showNotification(`Added ${product.name} to cart!`);
    return true;
  }

  /**
   * Remove item from cart
   * @param {Number} index - Index of item to remove
   */
  removeItem(index) {
    if (index >= 0 && index < this.cart.length) {
      const item = this.cart[index];
      this.cart.splice(index, 1);
      this.saveCart();
      this.showNotification(`Removed ${item.name} from cart`);
    }
  }

  /**
   * Update item quantity
   * @param {Number} index - Index of item
   * @param {Number} quantity - New quantity
   */
  updateQuantity(index, quantity) {
    if (index >= 0 && index < this.cart.length) {
      if (quantity <= 0) {
        this.removeItem(index);
      } else {
        this.cart[index].quantity = quantity;
        this.saveCart();
      }
    }
  }

  /**
   * Clear entire cart
   */
  clearCart() {
    this.cart = [];
    this.saveCart();
    this.showNotification('Cart cleared');
  }

  /**
   * Get cart items
   */
  getItems() {
    return this.cart;
  }

  /**
   * Get total number of items in cart
   */
  getItemCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Get cart subtotal
   */
  getSubtotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  /**
   * Get shipping cost (free over $50, otherwise $8)
   */
  getShipping() {
    const subtotal = this.getSubtotal();
    return subtotal >= 50 ? 0 : 8;
  }

  /**
   * Get cart total (including shipping)
   */
  getTotal() {
    return this.getSubtotal() + this.getShipping();
  }

  /**
   * Update cart badge and UI elements
   */
  updateCartUI() {
    // Update cart badge
    const cartBadges = document.querySelectorAll('.cart-badge');
    const itemCount = this.getItemCount();
    
    cartBadges.forEach(badge => {
      badge.textContent = itemCount;
      badge.style.display = itemCount > 0 ? 'block' : 'none';
    });

    // Update cart sidebar if it exists
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
      this.renderCartSidebar(cartSidebar);
    }

    // Update checkout page if it exists
    const checkoutContainer = document.getElementById('checkout-items');
    if (checkoutContainer) {
      this.renderCheckoutItems(checkoutContainer);
    }
  }

  /**
   * Render cart sidebar
   */
  renderCartSidebar(container) {
    const items = this.getItems();
    
    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon">🌹</div>
          <p>Your cart is empty</p>
          <a href="shop.html" class="btn btn-primary">Shop Now</a>
        </div>
      `;
      return;
    }

    const itemsHTML = items.map((item, index) => `
      <div class="cart-item" data-index="${index}">
        <img src="img/${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='img/placeholder.jpg'">
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.name}</h4>
          <p class="cart-item-variant">${item.variantSize}</p>
          <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-actions">
          <div class="quantity-controls">
            <button class="quantity-btn" onclick="cart.updateQuantity(${index}, ${item.quantity - 1})" aria-label="Decrease quantity">−</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn" onclick="cart.updateQuantity(${index}, ${item.quantity + 1})" aria-label="Increase quantity">+</button>
          </div>
          <button class="cart-item-remove" onclick="cart.removeItem(${index})" aria-label="Remove item">🗑️</button>
        </div>
      </div>
    `).join('');

    const subtotal = this.getSubtotal();
    const shipping = this.getShipping();
    const total = this.getTotal();

    container.innerHTML = `
      <div class="cart-items">
        ${itemsHTML}
      </div>
      <div class="cart-summary">
        <div class="cart-summary-row">
          <span>Subtotal:</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="cart-summary-row">
          <span>Shipping:</span>
          <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
        </div>
        ${subtotal < 50 ? `<div class="cart-shipping-note">💡 Free shipping on orders over $50!</div>` : ''}
        <div class="cart-summary-row cart-total">
          <span>Total:</span>
          <span>$${total.toFixed(2)}</span>
        </div>
        <a href="checkout.html" class="btn btn-primary btn-lg" style="width: 100%; margin-top: var(--spacing-md);">
          Proceed to Checkout
        </a>
      </div>
    `;
  }

  /**
   * Render checkout items
   */
  renderCheckoutItems(container) {
    const items = this.getItems();
    
    if (items.length === 0) {
      window.location.href = 'shop.html';
      return;
    }

    const itemsHTML = items.map((item, index) => `
      <div class="checkout-item">
        <img src="img/${item.image}" alt="${item.name}" onerror="this.src='img/placeholder.jpg'">
        <div class="checkout-item-details">
          <h4>${item.name}</h4>
          <p>${item.variantSize}</p>
        </div>
        <div class="checkout-item-quantity">×${item.quantity}</div>
        <div class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `).join('');

    const subtotal = this.getSubtotal();
    const shipping = this.getShipping();
    const total = this.getTotal();

    container.innerHTML = `
      ${itemsHTML}
      <div class="checkout-summary">
        <div class="checkout-summary-row">
          <span>Subtotal:</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="checkout-summary-row">
          <span>Shipping:</span>
          <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
        </div>
        <div class="checkout-summary-row checkout-total">
          <span>Total:</span>
          <span>$${total.toFixed(2)}</span>
        </div>
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Cart toggle button
    const cartToggle = document.getElementById('cart-toggle');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartClose = document.getElementById('cart-close');

    if (cartToggle && cartOverlay) {
      cartToggle.addEventListener('click', () => {
        cartOverlay.classList.add('active');
      });
    }

    if (cartClose && cartOverlay) {
      cartClose.addEventListener('click', () => {
        cartOverlay.classList.remove('active');
      });

      // Close on overlay click
      cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) {
          cartOverlay.classList.remove('active');
        }
      });
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: var(--color-primary);
      color: white;
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  /**
   * Get recommendations based on cart items
   */
  getRecommendations(allProducts, limit = 5) {
    const complementaryProducts = allProducts.filter(p => p.isComplementary);
    
    // If cart is empty, return random complementary products
    if (this.cart.length === 0) {
      return this.shuffleArray(complementaryProducts).slice(0, limit);
    }

    // Get occasions from cart items
    const cartProductIds = this.cart.map(item => item.productId);
    const cartProducts = allProducts.filter(p => cartProductIds.includes(p.id));
    const cartOccasions = [...new Set(cartProducts.flatMap(p => p.tags))];

    // Prioritize complementary products matching cart occasions
    const matchingProducts = complementaryProducts.filter(p => 
      p.tags.some(tag => cartOccasions.includes(tag))
    );

    const recommendations = matchingProducts.length >= limit
      ? this.shuffleArray(matchingProducts).slice(0, limit)
      : [
          ...matchingProducts,
          ...this.shuffleArray(complementaryProducts.filter(p => !matchingProducts.includes(p)))
        ].slice(0, limit);

    return recommendations;
  }

  /**
   * Shuffle array (Fisher-Yates algorithm)
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate order ID
   */
  generateOrderId() {
    return 'ORD-' + Date.now().toString(36).toUpperCase();
  }

  /**
   * Submit order
   */
  async submitOrder(orderData, endpoint) {
    try {
      const orderId = this.generateOrderId();
      const orderDetails = {
        orderId,
        items: this.getItems(),
        subtotal: this.getSubtotal(),
        shipping: this.getShipping(),
        total: this.getTotal(),
        customer: orderData,
        timestamp: new Date().toISOString()
      };

      // Save order to localStorage for thank you page
      localStorage.setItem('lastOrder', JSON.stringify(orderDetails));

      // Submit to endpoint (if provided)
      if (endpoint) {
        const formData = new FormData();
        formData.append('orderData', JSON.stringify(orderDetails));

        await fetch(endpoint, {
          method: 'POST',
          body: formData
        });
      }

      // Clear cart
      this.clearCart();

      // Redirect to thank you page
      window.location.href = `thank-you.html?order=${orderId}`;
      
      return true;
    } catch (error) {
      console.error('Error submitting order:', error);
      throw error;
    }
  }
}

// Initialize cart
const cart = new ShoppingCart();

// Make cart globally accessible
window.cart = cart;

// Add notification styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
