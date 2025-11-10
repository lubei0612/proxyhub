# Mobile Enhancement Features - User Guide

**Version:** 1.0  
**Date:** November 10, 2025

---

## 🎯 New Features Overview

This update adds three powerful features to ProxyHub:

1. **Business Scenario Selector** - Filter IPs by your business needs
2. **User-Level Pricing** - Admins can set custom prices per user
3. **Mobile Optimization** - Full platform usability on phones and tablets

---

## 1. Business Scenario Selector (For All Users)

### What It Does
When purchasing static proxies, you can now filter IPs optimized for specific platforms like TikTok, Shopee, Amazon, etc.

### How to Use

1. Navigate to **Static Proxy Purchase** page
2. Look for the **"热门业务场景（可选）"** dropdown
3. Select your business scenario:
   - 🛒 Shopee - Southeast Asian e-commerce
   - 📱 TikTok - Short video social
   - 🛍️ TikTok Shop - Live shopping
   - 📦 AliExpress - Cross-border e-commerce
   - 🎁 Temu - Social commerce
   - ▶️ YouTube - Video marketing
   - 📚 Amazon - Amazon e-commerce
   - And more...
4. The IP inventory will automatically filter to show only IPs suitable for that scenario
5. Complete your purchase as normal

### Tips
- If unsure, leave it blank to see all available IPs
- Scenario-optimized IPs may have better performance for your use case
- You can clear the selection at any time to reset the filter

---

## 2. User-Level Price Override (Admin Only)

### What It Does
Administrators can set custom pricing for individual users, enabling VIP pricing, reseller discounts, or enterprise contracts.

### How to Use (As Admin)

1. Login as admin
2. Navigate to **User Management** page
3. Find the user you want to set custom pricing for
4. Click the **"价格覆盖"** button (💰 icon) in the actions column
5. A modal will open showing all available IP regions
6. **Understanding the Pricing:**
   - **Default Price:** 985Proxy base price
   - **Global Override:** Platform-wide custom price (if set)
   - **User Override:** User-specific price (editable)
7. **Set Custom Price:**
   - Click on the price input field
   - Enter your custom price (USD per month)
   - The card will highlight in orange to show unsaved changes
8. **Save Changes:**
   - Click **"保存修改"** button at bottom
   - Changes are saved immediately
9. **Remove Custom Price:**
   - Set the price to blank/null to remove override
   - User will fall back to global override or default price

### Filtering Options
- **IP Type:** Filter by shared or premium IPs
- **Search:** Find specific countries or cities quickly

### Example Use Cases
- **VIP Client:** Set US premium IP to $12/month (instead of $15)
- **Bulk Reseller:** Set all regions to $8/month for volume discount
- **Enterprise Contract:** Custom pricing per contract terms
- **Beta Tester:** Give special pricing to early adopters

---

## 3. Mobile Optimization (For All Users)

### What It Does
All key pages now work smoothly on smartphones and tablets, allowing you to manage your proxies on-the-go.

### Optimized Pages
- ✅ Dashboard
- ✅ Static Proxy Purchase
- ✅ Static Proxy Management
- ✅ User Management (Admin)
- ✅ Recharge Approval (Admin)
- ✅ Price Override Management (Admin)
- ✅ Orders (Admin)
- ✅ Account Center

### Mobile Features
- **Responsive Layouts:** Single-column layouts on mobile
- **Touch-Friendly:** All buttons and inputs sized for touch
- **Scrollable Tables:** Tables scroll horizontally when needed
- **Stacked Filters:** Filters stack vertically for easy access
- **Full-Width Actions:** Buttons expand to full width on mobile

### How to Use on Mobile

1. Open ProxyHub in your mobile browser (Chrome, Safari, etc.)
2. Navigate as usual - all features work the same
3. **Viewing Tables:**
   - Swipe left/right to see all columns
   - Essential columns stay visible
4. **Using Filters:**
   - Filters stack vertically for easy selection
   - All options remain accessible
5. **Purchasing IPs:**
   - Forms adapt to single-column layout
   - All inputs remain easy to tap and fill

### Recommended Browsers
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Android Firefox
- ✅ Mobile Edge

---

## 📱 Quick Start Examples

### Example 1: Reseller Buying TikTok IPs on Mobile

1. Open ProxyHub on your phone
2. Tap **Static Proxy Purchase**
3. Select **IP Type:** Premium
4. Select **Business Scenario:** TikTok
5. Choose countries: US, UK, CA
6. Set quantities and duration
7. Tap **"确认选购"**
8. Complete payment

**Time:** ~2 minutes on mobile

---

### Example 2: Admin Setting VIP User Pricing

1. Login as admin on desktop or mobile
2. Go to **User Management**
3. Search for user: "vip@example.com"
4. Tap **"价格覆盖"** button
5. Set custom prices:
   - US Shared: $8/month
   - UK Shared: $7/month
   - All others: default
6. Tap **"保存修改"**
7. Done! User sees new pricing immediately on next purchase

**Time:** ~1 minute

---

### Example 3: User Purchasing with Custom Pricing

**Before:** You're a VIP user with custom pricing set by admin

1. Navigate to **Static Proxy Purchase**
2. Select region: US
3. **Notice:** Price shows as $8/month (your custom price)
4. Complete purchase
5. **Confirmed:** You paid $8/month, not the standard $15/month

**Savings:** $7 per IP per month!

---

## 🆘 Troubleshooting

### Issue: Business scenarios not showing
**Cause:** API connection issue  
**Solution:** Refresh the page. If persists, you can still purchase without selecting a scenario.

### Issue: Custom pricing not showing for user
**Cause:** User hasn't refreshed page after admin set pricing  
**Solution:** User should logout and login again, or hard refresh (Ctrl+F5).

### Issue: Mobile layout looks broken
**Cause:** Browser cache or unsupported browser  
**Solution:** Clear browser cache or try a different browser (Chrome/Safari recommended).

### Issue: Can't save price override changes
**Cause:** Network error or insufficient permissions  
**Solution:** Check internet connection. Ensure you're logged in as admin.

---

## ❓ FAQ

### Q: Can I use business scenarios for dynamic proxies?
**A:** Currently, business scenarios only work for static residential proxies. Support for dynamic proxies may be added in future updates.

### Q: How do I remove a user-specific price override?
**A:** Open the price override modal for that user, set the price to blank/null, and save. The user will revert to the global or default price.

### Q: Can users see their own custom pricing?
**A:** Yes, when a user with custom pricing views the purchase page, they see their custom prices automatically. They don't need to do anything special.

### Q: Does mobile work on iPad?
**A:** Yes! iPad is treated as a tablet and gets an optimized layout. Some pages show 2 columns on iPad instead of 1 (due to wider screen).

### Q: Can I set different prices for shared vs premium for the same user?
**A:** Yes! Each IP type and region can have independent pricing. You can set US shared to $8 and US premium to $12, for example.

---

## 📞 Support

Need help? Contact your administrator or support team.

**Documentation:**
- Technical Report: `docs/MOBILE-ENHANCEMENT-IMPLEMENTATION-COMPLETE-2025-11-10.md`
- API Documentation: Backend API endpoints documented in code comments

---

**Enjoy the new features!** 🚀


