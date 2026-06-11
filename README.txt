UttamThemes Premium Auth Module 10/10
=====================================

This package is a refactored, production-ready Bootstrap 5 auth module based on the previous centered login page.
It is now reusable across login, register, forgot password, reset password, two-factor verification, email verification,
and lock-screen pages.

Included pages
--------------
- index.html
- login.html
- register.html
- forgot-password.html
- reset-password.html
- two-factor.html
- verify-email.html
- lock-screen.html

Included assets
---------------
- assets/css/theme_tokens.css
- assets/css/auth.css
- assets/js/theme-boot.js
- assets/js/auth.js
- assets/js/auth-demo.js

Vendor dependencies required
----------------------------
Copy your existing vendor files into these paths:
- assets/vendor/bootstrap/css/bootstrap.min.css
- assets/vendor/bootstrap/js/bootstrap.bundle.min.js
- assets/vendor/bootstrap-icons/bootstrap-icons.css

What changed from the old login version
---------------------------------------
- .login-card changed to .auth-card
- .theme-selector changed to .auth-theme-select
- .brand-mark changed to .auth-brand-mark
- .brand-title changed to .auth-brand-title
- .alert-auth changed to .auth-alert
- .social-btn changed to .auth-social-btn
- .btn-spinner changed to .auth-btn-spinner
- wd-lg-500px changed to .auth-container-md
- login-only wrapper IDs changed to .auth-page, .auth-layout, .auth-wrapper, .auth-container
- login-only CSS variables changed to auth variables such as --auth-card-radius and --auth-control-radius
- CSS is rearranged according to page shell, layout, container, card, theme selector, brand, alerts, form fields,
  password field, actions row, submit button, divider, social buttons, footer, accessibility, responsive, and motion safety
- Theme boot is separated into assets/js/theme-boot.js and loaded before CSS to prevent theme flash
- Auth UI logic is separated into assets/js/auth.js
- Demo-only authentication behavior is separated into assets/js/auth-demo.js

Demo login
----------
Email: demo@example.com
Password: any password with 8 or more characters

Production integration
----------------------
1. Remove or replace assets/js/auth-demo.js.
2. Create your own window.UttamAuthAdapter with a submit() method and optional social() method.
3. Add a real CSRF token value in the hidden csrf_token field.
4. Add real action URLs or AJAX/fetch logic in your adapter.

Example production adapter
--------------------------
window.UttamAuthAdapter = {
    async submit({ flow, data }) {
        const response = await fetch('/auth/' + flow, {
            method: 'POST',
            body: data,
            credentials: 'same-origin'
        });

        const result = await response.json();

        return {
            ok: response.ok,
            message: result.message || 'Request completed.',
            redirect: result.redirect || null
        };
    },

    async social(provider) {
        window.location.href = '/auth/' + provider;
        return { ok: true, message: 'Redirecting...' };
    }
};

Recommended final class system
------------------------------
- auth-page
- auth-layout
- auth-wrapper
- auth-container
- auth-container-sm
- auth-container-md
- auth-container-lg
- auth-card
- auth-card-glass
- auth-theme-select
- auth-header
- auth-brand-mark
- auth-brand-title
- auth-brand-subtitle
- auth-alert
- auth-field
- auth-control
- auth-control-group
- auth-control-addon
- auth-actions
- auth-submit
- auth-btn-spinner
- auth-divider
- auth-social
- auth-social-btn
- auth-footer

Notes
-----
The module keeps your original --t-* theme token system and preserves the 30 theme names, including Cosmic Aurora.
The new auth CSS is scoped to .auth-page to avoid leaking styles into dashboard pages.
