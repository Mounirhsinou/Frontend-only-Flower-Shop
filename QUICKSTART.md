# 🚀 Quick Start Guide - Petals & Blooms

Welcome to your new flower shop website! Follow these steps to get started.

## ✅ Step 1: Verify Installation

Your website is already set up and ready to use! All files have been created in:
```
c:\xampp\htdocs\FlowerShop
```

## 🌐 Step 2: View Your Website

Since you're using XAMPP, simply open your web browser and go to:
```
http://localhost/FlowerShop
```

Or if XAMPP is configured differently:
```
http://127.0.0.1/FlowerShop
```

## 🎨 Step 3: Test Features

Try these features to see everything in action:

1. **Dark Mode**: Click the 🌙 button in the header
2. **Shopping Cart**: Browse shop → Add items → View cart (🛒 icon)
3. **Product Filtering**: Go to Shop page → Use filters on the left
4. **Persona Toggle**: In Shop page → Toggle between Default/Man/Woman views
5. **Checkout Flow**: Add items to cart → Click cart → Proceed to Checkout
6. **Mobile View**: Resize your browser to see responsive design

## 📝 Step 4: Customize Your Site

### Update Contact Information

Search and replace these placeholders across all files:

- `hello@petalsblooms.com` → Your email
- `+1 (555) 123-4567` → Your phone number
- `123 Flower Street, Garden City` → Your address

### Add More Products

Edit `data/products.json` to add new products. Copy an existing product structure and modify:

```json
{
  "id": "rose-009",
  "name": "New Product Name",
  "slug": "new-product-slug",
  "variants": [
    {"size": "Small", "price": 29}
  ],
  "tags": ["romantic", "anniversary"],
  "occasion": "romantic",
  "color": "red",
  "images": {
    "default": ["new-product.jpg"],
    "persona_man": [],
    "persona_woman": []
  },
  "description": "Product description here",
  "featured": false
}
```

Then add the corresponding image to the `img/` folder.

### Change Theme Colors

Edit `css/style.css` and modify the CSS variables at the top:

```css
:root {
  --color-primary: hsl(340, 82%, 65%);     /* Main color */
  --color-secondary: hsl(25, 95%, 75%);    /* Accent color */
  /* ... customize other colors ... */
}
```

## 📧 Step 5: Configure Order Submission

By default, orders are saved to localStorage. To receive orders:

### Option A: Email (Easiest - No Setup)

Orders will open the user's email client with pre-filled details. This works out of the box!

### Option B: Formspree (Recommended)

1. Sign up at https://formspree.io/ (free)
2. Create a new form
3. Copy your form endpoint URL
4. Open `checkout.html`
5. Find line ~220: `const formspreeEndpoint = '...'`
6. Replace with your Formspree URL
7. Uncomment the Formspree fetch block (remove `/*` and `*/` around it)

### Option C: Google Sheets

See detailed instructions in `README.md` under "Order Management".

## 🎯 Step 6: Add Payment Processing

The site is ready for Stripe or PayPal integration. See `README.md` for detailed instructions.

For now, payment is simulated (no actual charges).

## 🖼️ Step 7: Add More Images

Some products are using placeholder images. To add real product images:

1. Generate or source photos of your products
2. Name them according to the pattern in `products.json`:
   - `rose-003-1.jpg` for default view
   - `rose-003-man-1.jpg` for man holding bouquet
   - `rose-003-woman-1.jpg` for woman holding bouquet
3. Place in the `img/` folder
4. Refresh the website!

### AI Image Generation Prompts

Use these prompts with AI image generators (DALL-E, Midjourney, etc.):

**For product photos:**
```
High-quality photorealistic bouquet of [COLOR] roses for [OCCASION], 
studio lighting, shallow depth of field, white background, 
professional flower arrangement, ultra-detailed.
```

**For persona photos:**
```
Photorealistic: [male/female] model holding beautiful bouquet of 
[COLOR] roses, natural smile, soft bokeh, professional photography.
```

## 🚀 Step 8: Deploy to the Web

When you're ready to go live:

### GitHub Pages (Free & Easy)

1. Create a GitHub account if you don't have one
2. Create a new repository
3. Upload all files from `FlowerShop` folder
4. Go to Settings → Pages
5. Select your branch → Save
6. Your site will be live at `yourusername.github.io/FlowerShop`!

### Netlify (Recommended)

1. Go to https://www.netlify.com/
2. Sign up (free)
3. Drag and drop your `FlowerShop` folder
4. Site goes live instantly!
5. Get a free HTTPS domain

See `README.md` for more deployment options.

## ✨ Testing Checklist

Before going live, test these:

- [ ] All pages load correctly
- [ ] Dark mode works
- [ ] Can add items to cart
- [ ] Cart persists after page refresh
- [ ] Can proceed through checkout
- [ ] Thank you page shows after checkout
- [ ] All forms work (contact, newsletter)
- [ ] Site looks good on mobile (test on phone)
- [ ] All links work
- [ ] Images load properly

## 🆘 Need Help?

1. Check `README.md` for detailed documentation
2. Review code comments in source files
3. All JavaScript functions are documented with comments
4. CSS is organized with clear section headers

## 🎉 You're All Set!

Your flower shop is ready to bloom! 🌹

**Happy Selling!**

---

**Quick Reference:**

- Site URL: `http://localhost/FlowerShop`
- Products: Edit `data/products.json`
- Styles: Edit `css/style.css`
- Contact Info: Search & replace in all `.html` files
- Orders: See `README.md` → Order Management
- Deploy: See `README.md` → Deployment

---

**Pro Tips:**

1. Use dark mode during development - easier on the eyes! 🌙
2. Open browser dev tools (F12) to see console logs
3. Cart data is in localStorage - check Application tab in dev tools
4. Test on real mobile devices, not just browser resize
5. Take photos of your real flower arrangements for best results!
