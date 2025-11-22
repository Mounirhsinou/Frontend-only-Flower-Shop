# 🌹 Petals & Blooms - Premium Rose & Flower Shop

A modern, responsive, frontend-only e-commerce website for a rose and flower shop. Built with vanilla HTML, CSS, and JavaScript featuring dark mode, client-side cart, and production-quality UI/UX.

## 📋 Table of Contents

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Installation & Setup](#installation--setup)
4. [Configuration](#configuration)
5. [Order Management](#order-management)
6. [Payment Integration](#payment-integration)
7. [AI Image Generation](#ai-image-generation)
8. [Customization](#customization)
9. [Deployment](#deployment)
10. [Browser Support](#browser-support)

---

## ✨ Features

### Core Functionality
- **4 Main Pages**: Home, Shop, About, Contact
- **Legal Pages**: Terms of Service, Privacy Policy, Shipping & Returns
- **Thank You Page**: Post-purchase confirmation with recommendations
- **Fully Responsive**: Mobile-first design with clear breakpoints
- **Dark Mode**: Toggle with localStorage persistence and system preference detection
- **Shopping Cart**: Client-side cart with localStorage persistence
- **Product Filtering**: By occasion, color, and price range
- **Persona Toggle**: Switch between "Man", "Woman", and "Default" product images
- **Recommendations Engine**: Client-side complementary product suggestions

### Design & UX
- **Modern Aesthetic**: Soft pastel color palette with rose tones
- **Glassmorphism**: Subtle glass effects on navigation and cards
- **Micro-Animations**: Smooth hover effects, transitions, and entrance animations
- **Accessible**: Semantic HTML, ARIA attributes, keyboard navigation
- **Premium Look**: Professional typography (Poppins + Playfair Display)

### E-Commerce Features
- **Product Variants**: Multiple size/price options per product
- **Add to Cart**: From product cards or detailed modal view
- **Cart Management**: Add, remove, update quantities
- **Checkout Flow**: Customer info, delivery address, payment method selection
- **Order Submission**: Configurable endpoints (Google Sheets, email, Formspree)
- **Free Shipping**: Automatically applies on orders over $50

---

## 📁 Project Structure

```
FlowerShop/
├── index.html              # Home page
├── shop.html               # Product listing with filters
├── about.html              # Brand story & info
├── contact.html            # Contact form
├── checkout.html           # Checkout page
├── thank-you.html          # Order confirmation
├── terms.html              # Terms of Service
├── privacy.html            # Privacy Policy
├── shipping.html           # Shipping & Returns Policy
├── css/
│   └── style.css           # Main stylesheet with theme variables
├── js/
│   ├── main.js             # Theme, modals, product loading
│   └── cart.js             # Shopping cart functionality
├── data/
│   └── products.json       # Product database
└── img/                    # Product and site images
    ├── hero-bouquet.jpg
    ├── rose-001-1.jpg
    ├── rose-001-man-1.jpg
    ├── rose-001-woman-1.jpg
    └── ... (other images)
```

---

## 🚀 Installation & Setup

### 1. Basic Setup

Simply open `index.html` in a web browser. No build process required!

For local development with live reload, you can use:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Since you're using XAMPP, the site is already accessible at:
```
http://localhost/FlowerShop
```

### 2. Configuration

The site works out of the box with localStorage for cart and orders. For production use, configure order submission endpoints (see [Order Management](#order-management)).

---

## 🛒 Order Management

Orders are currently saved to localStorage and can be submitted to external services. Here's how to configure different options:

### Option 1: Google Sheets via Apps Script

**Step 1**: Create a Google Apps Script Web App

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Paste this code:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  // Add a new row with order data
  sheet.appendRow([
    data.orderId,
    data.timestamp,
    data.customer.name,
    data.customer.email,
    data.customer.phone,
    data.customer.address,
    data.total,
    JSON.stringify(data.items)
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Deploy as Web App (Anyone can access)
5. Copy the Web App URL

**Step 2**: Update `checkout.html`

Find this line in `checkout.html`:
```javascript
const googleSheetsEndpoint = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```

Replace with your Web App URL and uncomment the fetch block.

### Option 2: Formspree (Easiest)

1. Sign up at [Formspree.io](https://formspree.io/) (free tier available)
2. Create a new form
3. Copy your form endpoint
4. In `checkout.html`, update:

```javascript
const formspreeEndpoint = 'https://formspree.io/f/YOUR_FORM_ID';
```

5. Uncomment the Formspree fetch block

### Option 3: Email Fallback (No Setup Required)

The site includes a mailto: fallback that opens the user's email client with pre-filled order details. This works by default but requires users to send the email manually.

### Option 4: Custom Backend

To integrate with your own backend:

1. Create an API endpoint that accepts POST requests with order JSON
2. Update the `cart.submitOrder()` method in `js/cart.js`:

```javascript
await fetch('https://your-api.com/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(orderDetails)
});
```

---

## 💳 Payment Integration

The site is ready for payment gateway integration. Currently shows placeholder options.

### Stripe Integration

1. Sign up at [Stripe](https://stripe.com/)
2. Get your publishable and secret keys
3. Add Stripe.js to `checkout.html`:

```html
<script src="https://js.stripe.com/v3/"></script>
```

4. Create a payment intent on your backend
5. Update the checkout form submission:

```javascript
const stripe = Stripe('YOUR_PUBLISHABLE_KEY');

// Create payment intent via your backend
const response = await fetch('/create-payment-intent', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({amount: cart.getTotal() * 100})
});

const {clientSecret} = await response.json();

// Confirm payment
const {error} = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {name: customerData.name}
  }
});
```

### PayPal Integration

1. Sign up for [PayPal Business](https://www.paypal.com/business)
2. Get your Client ID
3. Add PayPal SDK to `checkout.html`:

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID"></script>
```

4. Create PayPal button:

```javascript
paypal.Buttons({
  createOrder: function(data, actions) {
    return actions.order.create({
      purchase_units: [{
        amount: {value: cart.getTotal().toFixed(2)}
      }]
    });
  },
  onApprove: function(data, actions) {
    return actions.order.capture().then(function(details) {
      // Order captured successfully
      cart.submitOrder(customerData, null);
    });
  }
}).render('#paypal-button-container');
```

---

## 🎨 AI Image Generation

Some images have been generated using Gemini AI. Here are the prompts used:

### Product Images (Generic)
```
High-quality photorealistic bouquet of [COLOR] roses for [OCCASION], studio lighting, shallow depth of field, 3:4 aspect ratio, white background, realistic petals and natural leaves, professional flower arrangement, ultra-detailed.
```

### Persona Images (Man/Woman holding bouquet)
```
Photorealistic image: a [male/female] model gently holding a bouquet of [COLOR] roses, natural warm smiling expression, soft bokeh background in warm tones, three-quarter body shot, realistic skin tones, professional photography, high detail, romantic atmosphere.
```

### Hero & Lifestyle Images
```
Warm lifestyle scene: cozy living room with bouquet of roses on wooden table by window, morning light streaming, soft cinematic look, 16:9 aspect ratio, ultra detailed, warm color tones, inviting atmosphere.
```

### Category Images
```
[Elegant romantic / Beautiful wedding / Cheerful birthday / Peaceful sympathy] scene: [description] bouquet, professional photography, 4:3 aspect ratio, ultra detailed.
```

### To Generate More Images

Use any AI image generator (DALL-E, Midjourney, Stable Diffusion, etc.) with the prompts above. Save images to the `img/` folder with appropriate filenames matching `products.json`.

### Image Naming Convention

- **Default product images**: `rose-001-1.jpg`, `rose-001-2.jpg`, etc.
- **Persona images (man)**: `rose-001-man-1.jpg`, `rose-001-man-2.jpg`, etc.
- **Persona images (woman)**: `rose-001-woman-1.jpg`, `rose-001-woman-2.jpg`, etc.
- **Complementary products**: `chocolate-001-1.jpg`, `vase-001-1.jpg`, etc.

---

## 🎨 Customization

### Theme Colors

Edit CSS variables in `css/style.css`:

```css
:root {
  --color-primary: hsl(340, 82%, 65%);     /* Main pink/rose color */
  --color-secondary: hsl(25, 95%, 75%);    /* Accent peach color */
  --color-accent: hsl(340, 100%, 95%);     /* Light background */
  /* ... */
}
```

### Products

Edit `data/products.json` to add/modify products:

```json
{
  "id": "rose-009",
  "name": "Your Product Name",
  "slug": "your-product-slug",
  "variants": [
    {"size": "Small", "price": 29},
    {"size": "Medium", "price": 45}
  ],
  "tags": ["occasion", "color"],
  "occasion": "romantic",
  "color": "red",
  "images": {
    "default": ["image1.jpg", "image2.jpg"],
    "persona_man": ["man-image.jpg"],
    "persona_woman": ["woman-image.jpg"]
  },
  "description": "Product description here",
  "featured": false
}
```

### Contact Information

Update contact details in:
- Footer sections in all HTML files
- `contact.html` page
- Legal pages (terms.html, privacy.html, shipping.html)

Search for `hello@mounirhsinou.com` and `+1 (555) 123-4567` to replace globally.

---

## 🌐 Deployment

### GitHub Pages (Free)

1. Create a GitHub repository
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/flower-shop.git
git push -u origin main
```

3. Go to repository Settings → Pages
4. Select `main` branch
5. Your site will be live at `https://yourusername.github.io/flower-shop/`

### Netlify (Free)

1. Sign up at [Netlify](https://www.netlify.com/)
2. Drag and drop your project folder
3. Site is live instantly!
4. Optional: Connect to GitHub for automatic deployments

### Vercel (Free)

1. Sign up at [Vercel](https://vercel.com/)
2. Install Vercel CLI:
```bash
npm i -g vercel
```
3. Deploy:
```bash
cd FlowerShop
vercel
```

### Traditional Web Hosting

Upload all files via FTP to your web hosting provider. Works on any shared hosting (HostGator, Bluehost, SiteGround, etc.).

---

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Note**: Requires modern browsers with ES6+ JavaScript support.

---

## 🔧 Technical Stack

- **HTML5**: Semantic markup
- **CSS3**: Custom properties (variables), Grid, Flexbox, animations
- **JavaScript (ES6+)**: Modules, classes, async/await, localStorage
- **No frameworks or libraries**: Pure vanilla code for maximum performance

---

## 📝 Key Features Implementation

### Dark Mode
- Persisted in localStorage with key `theme`
- Respects system preference on first visit
- Smooth transitions between themes
- All colors adapt via CSS custom properties

### Shopping Cart
- Stored in localStorage with key `flowerCart`
- Persists across sessions
- Real-time updates across all pages
- Quantity management
- Automatic shipping calculation

### Persona Toggle
- Stored in localStorage with key `persona`
- Switches between default, man, and woman images
- Works on shop page and product modals
- Seamless image swapping

### Product Recommendations
- Client-side algorithm
- Based on cart contents and product tags
- Shows 5 complementary items
- Displayed on thank-you page

---

## 📄 License

This is a demonstration project. Feel free to use, modify, and distribute as needed.

---

## 🙋 Support

For questions or issues:

1. Check this README
2. Review code comments in source files
3. Contact: hello@mounirhsinou.com

---

## 🎉 Credits

- **Design**: Custom modern UI/UX
- **Fonts**: Google Fonts (Poppins, Playfair Display)
- **Icons**: Unicode emoji characters
- **Images**: AI-generated (Gemini)

---

## 🚀 Quick Start Checklist

- [ ] Replace `hello@petalsblooms.com` with your email
- [ ] Replace `+1 (555) 123-4567` with your phone
- [ ] Configure order submission endpoint (Google Sheets, Formspree, or custom)
- [ ] Add more product images to `img/` folder
- [ ] Update legal pages with your specific terms
- [ ] Test on mobile devices
- [ ] Configure payment gateway (Stripe/PayPal)
- [ ] Deploy to hosting provider
- [ ] Set up SSL certificate (HTTPS)
- [ ] Add Google Analytics or tracking (optional)

---

**Built with ❤️ for flower lovers everywhere 🌹** 
By Mounir hsinou


