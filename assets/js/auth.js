/* ========================================================================
   UttamThemes Premium Auth JS
   ------------------------------------------------------------------------
   Reusable auth UI controller. Works across login, register, forgot password,
   reset password, 2FA, verify email, and lock-screen pages.
======================================================================== */
(function () {
    'use strict';

    const STORAGE_KEYS = Object.freeze({
        theme: 'uttam-theme',
        rememberedEmail: 'uttam-remembered-email'
    });

    const DEFAULT_THEME = 'cosmic-aurora';
    const REMEMBER_EMAIL_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;

    const themes = Object.freeze({
        light: { name: 'Light', color: '#2563eb', mode: 'light' },
        dark: { name: 'Dark', color: '#38bdf8', mode: 'dark' },
        obsidian: { name: 'Obsidian', color: '#d4af37', mode: 'dark' },
        vercel: { name: 'Vercel Black', color: '#ffffff', mode: 'dark' },
        'deep-space': { name: 'Deep Space', color: '#8b5cf6', mode: 'dark' },
        netflix: { name: 'Netflix Red', color: '#e50914', mode: 'dark' },
        microsoft: { name: 'Microsoft Fluent', color: '#0078d4', mode: 'light' },
        google: { name: 'Google Material 3', color: '#6750a4', mode: 'light' },
        apple: { name: 'Apple SF', color: '#007aff', mode: 'light' },
        vscode: { name: 'VSCode Dark', color: '#007acc', mode: 'dark' },
        aws: { name: 'AWS Orange', color: '#ff9900', mode: 'dark' },
        royal: { name: 'Royal', color: '#9333ea', mode: 'light' },
        spotify: { name: 'Spotify Green', color: '#1db954', mode: 'dark' },
        figma: { name: 'Figma Purple', color: '#a259ff', mode: 'light' },
        slack: { name: 'Slack Sidebar', color: '#611f69', mode: 'light' },
        airbnb: { name: 'Airbnb Pink', color: '#ff5a5f', mode: 'light' },
        uber: { name: 'Uber Black', color: '#ffffff', mode: 'dark' },
        sapphire: { name: 'Sapphire Glass', color: '#2563eb', mode: 'light' },
        nebula: { name: 'Nebula', color: '#c026d3', mode: 'dark' },
        aurora: { name: 'Aurora', color: '#06b6d4', mode: 'light' },
        phoenix: { name: 'Phoenix', color: '#ef4444', mode: 'light' },
        sakura: { name: 'Sakura', color: '#ec4899', mode: 'light' },
        sunset: { name: 'Sunset', color: '#f97316', mode: 'light' },
        rose: { name: 'Rose', color: '#fb7185', mode: 'light' },
        slate: { name: 'Slate', color: '#64748b', mode: 'light' },
        emerald: { name: 'Emerald', color: '#10b981', mode: 'light' },
        ocean: { name: 'Ocean', color: '#0ea5e9', mode: 'light' },
        'midnight-teal': { name: 'Midnight Teal', color: '#14b8a6', mode: 'dark' },
        cyber: { name: 'Cyber', color: '#00ff41', mode: 'dark' },
        'cosmic-aurora': { name: 'Cosmic Aurora', color: '#a855f7', mode: 'dark' }
    });

    function safeStorageGet(key) {
        try {
            return localStorage.getItem(key);
        } catch (_) {
            return null;
        }
    }

    function safeStorageSet(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (_) {}
    }

    function safeStorageRemove(key) {
        try {
            localStorage.removeItem(key);
        } catch (_) {}
    }

    function hasTheme(themeKey) {
        return Object.prototype.hasOwnProperty.call(themes, themeKey);
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
    }

    function getCurrentTheme() {
        const savedTheme = safeStorageGet(STORAGE_KEYS.theme);
        return hasTheme(savedTheme) ? savedTheme : DEFAULT_THEME;
    }

    function applyTheme(themeKey) {
        const safeTheme = hasTheme(themeKey) ? themeKey : DEFAULT_THEME;
        const theme = themes[safeTheme];

        document.documentElement.setAttribute('data-theme', safeTheme);
        document.documentElement.setAttribute('data-bs-theme', theme.mode);
        document.documentElement.style.setProperty('color-scheme', theme.mode);
        safeStorageSet(STORAGE_KEYS.theme, safeTheme);

        document.querySelectorAll('[data-auth-theme-select]').forEach((select) => {
            select.value = safeTheme;
        });
    }

    function buildThemeSelector(select) {
        if (!select) return;

        const fragment = document.createDocumentFragment();

        Object.entries(themes).forEach(([key, theme]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = theme.name;
            option.dataset.mode = theme.mode;
            option.dataset.color = theme.color;
            fragment.appendChild(option);
        });

        select.innerHTML = '';
        select.appendChild(fragment);
        select.value = getCurrentTheme();
    }

    function readRememberedEmail() {
        const raw = safeStorageGet(STORAGE_KEYS.rememberedEmail);
        if (!raw) return '';

        try {
            const parsed = JSON.parse(raw);
            const isFresh = parsed.savedAt && Date.now() - parsed.savedAt < REMEMBER_EMAIL_MAX_AGE_MS;
            const isEmail = typeof parsed.email === 'string' && isValidEmail(parsed.email);

            if (isFresh && isEmail) return parsed.email;
        } catch (_) {
            if (isValidEmail(raw)) return raw;
        }

        safeStorageRemove(STORAGE_KEYS.rememberedEmail);
        return '';
    }

    function saveRememberedEmail(email, remember) {
        if (!remember) {
            safeStorageRemove(STORAGE_KEYS.rememberedEmail);
            return;
        }

        safeStorageSet(STORAGE_KEYS.rememberedEmail, JSON.stringify({
            email: String(email || '').trim(),
            savedAt: Date.now()
        }));
    }

    function createSpinner() {
        return '<span class="auth-btn-spinner" aria-hidden="true"></span>';
    }

    class AuthForm {
        constructor(form) {
            this.form = form;
            this.flow = form.dataset.authFlow || 'login';
            this.isSubmitting = false;
            this.alertTimer = null;
            this.fieldsTouched = new WeakMap();

            this.alert = form.querySelector('[data-auth-alert]');
            this.alertIcon = form.querySelector('[data-auth-alert-icon]');
            this.alertMessage = form.querySelector('[data-auth-alert-message]');
            this.submitButton = form.querySelector('[data-auth-submit]');
            this.rememberCheckbox = form.querySelector('[data-auth-remember]');
            this.emailInput = form.querySelector('[data-auth-field="email"]');
            this.passwordInput = form.querySelector('[data-auth-field="password"]');
        }

        init() {
            this.restoreRememberedEmail();
            this.bindFieldEvents();
            this.bindPasswordToggles();
            this.bindSocialButtons();
            this.bindSubmit();
        }

        restoreRememberedEmail() {
            if (this.flow !== 'login' || !this.emailInput || !this.rememberCheckbox) return;

            const rememberedEmail = readRememberedEmail();
            if (!rememberedEmail) return;

            this.emailInput.value = rememberedEmail;
            this.rememberCheckbox.checked = true;
        }

        bindFieldEvents() {
            this.form.querySelectorAll('[data-auth-field]').forEach((input) => {
                input.addEventListener('input', () => {
                    this.hideAlert();
                    if (this.fieldsTouched.get(input)) this.validateField(input);
                });

                input.addEventListener('blur', () => {
                    this.fieldsTouched.set(input, true);
                    this.validateField(input);
                });

                if (input.dataset.authField === 'password') {
                    input.addEventListener('keydown', (event) => {
                        if (event.getModifierState && event.getModifierState('CapsLock')) {
                            this.showAlert('danger', 'Caps Lock is on. Passwords are case-sensitive.');
                        }
                    });
                }
            });
        }

        bindPasswordToggles() {
            this.form.querySelectorAll('[data-auth-password-toggle]').forEach((button) => {
                button.addEventListener('click', () => {
                    const targetId = button.getAttribute('aria-controls');
                    const input = targetId ? document.getElementById(targetId) : button.closest('.auth-control-group')?.querySelector('input');
                    if (!input) return;

                    const shouldShow = input.getAttribute('type') === 'password';
                    input.setAttribute('type', shouldShow ? 'text' : 'password');

                    const icon = button.querySelector('i');
                    if (icon) {
                        icon.classList.toggle('bi-eye', !shouldShow);
                        icon.classList.toggle('bi-eye-slash', shouldShow);
                    }

                    button.setAttribute('aria-pressed', shouldShow ? 'true' : 'false');
                    button.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password');
                });
            });
        }

        bindSocialButtons() {
            this.form.querySelectorAll('[data-auth-social]').forEach((button) => {
                button.addEventListener('click', async () => {
                    if (this.isSubmitting) return;

                    const provider = button.dataset.authSocial;
                    const adapter = window.UttamAuthAdapter;

                    if (!adapter || typeof adapter.social !== 'function') {
                        this.showAlert('danger', `${provider} sign-in is not configured yet.`);
                        return;
                    }

                    try {
                        const response = await adapter.social(provider);
                        this.handleAdapterResponse(response, `${provider} sign-in started.`);
                    } catch (error) {
                        this.showAlert('danger', error.message || `${provider} sign-in failed.`);
                    }
                });
            });
        }

        bindSubmit() {
            this.form.addEventListener('submit', async (event) => {
                event.preventDefault();

                if (this.isSubmitting) return;
                this.hideAlert();

                if (!this.validateForm()) return;

                if (this.flow === 'login' && this.emailInput) {
                    saveRememberedEmail(this.emailInput.value, Boolean(this.rememberCheckbox?.checked));
                }

                this.setLoading(true);

                try {
                    const adapter = window.UttamAuthAdapter;
                    let response;

                    if (adapter && typeof adapter.submit === 'function') {
                        response = await adapter.submit({
                            form: this.form,
                            flow: this.flow,
                            data: new FormData(this.form)
                        });
                    } else {
                        throw new Error('Authentication adapter is not configured.');
                    }

                    this.handleAdapterResponse(response, 'Request completed successfully.');
                } catch (error) {
                    this.showAlert('danger', error.message || 'Something went wrong. Please try again.');
                    this.focusFirstSensitiveField();
                } finally {
                    this.setLoading(false);
                }
            });
        }

        validateForm() {
            let firstInvalid = null;

            this.form.querySelectorAll('[data-auth-field]').forEach((input) => {
                this.fieldsTouched.set(input, true);
                const isValid = this.validateField(input);
                if (!isValid && !firstInvalid) firstInvalid = input;
            });

            if (firstInvalid) firstInvalid.focus();
            return !firstInvalid;
        }

        validateField(input) {
            const type = input.dataset.authField;
            const value = String(input.value || '').trim();
            const rawValue = String(input.value || '');
            const required = input.required || input.hasAttribute('aria-required');

            if (required && !value) {
                return this.setFieldState(input, false, this.getRequiredMessage(type));
            }

            if (!value && !required) {
                return this.setFieldState(input, true, '');
            }

            if (type === 'email' && !isValidEmail(value)) {
                return this.setFieldState(input, false, 'Enter a valid email address.');
            }

            if (type === 'name' && value.length < 2) {
                return this.setFieldState(input, false, 'Name must be at least 2 characters.');
            }

            if (type === 'password') {
                const minLength = Number(input.dataset.minLength || 8);
                if (rawValue.length < minLength) {
                    return this.setFieldState(input, false, `Password must be at least ${minLength} characters.`);
                }
            }

            if (type === 'confirm-password') {
                const password = this.form.querySelector('[data-auth-field="password"]');
                if (password && rawValue !== password.value) {
                    return this.setFieldState(input, false, 'Passwords do not match.');
                }
            }

            if (type === 'code' && !/^\d{4,8}$/.test(value)) {
                return this.setFieldState(input, false, 'Enter the verification code.');
            }

            return this.setFieldState(input, true, '');
        }

        setFieldState(input, isValid, message) {
            const field = input.closest('.auth-field');
            const group = input.closest('.auth-control-group');
            const fieldName = input.dataset.authField;
            const feedback = this.form.querySelector(`[data-auth-feedback-for="${fieldName}"]`);
            const feedbackMessage = feedback?.querySelector('[data-auth-feedback-message]');

            input.classList.toggle('is-invalid', !isValid);
            input.classList.toggle('is-valid', isValid && Boolean(input.value));
            group?.classList.toggle('is-invalid', !isValid);
            group?.classList.toggle('is-valid', isValid && Boolean(input.value));
            field?.classList.toggle('is-invalid', !isValid);
            field?.classList.toggle('is-valid', isValid && Boolean(input.value));

            if (feedback) {
                feedback.classList.toggle('is-visible', !isValid && Boolean(message));
                feedback.classList.toggle('is-invalid', !isValid);
                feedback.classList.toggle('is-valid', isValid);
            }

            if (feedbackMessage && message) feedbackMessage.textContent = message;

            if (!isValid) {
                input.setAttribute('aria-invalid', 'true');
            } else {
                input.removeAttribute('aria-invalid');
            }

            return isValid;
        }

        getRequiredMessage(type) {
            const messages = {
                email: 'Email is required.',
                password: 'Password is required.',
                'confirm-password': 'Please confirm your password.',
                name: 'Full name is required.',
                code: 'Verification code is required.'
            };

            return messages[type] || 'This field is required.';
        }

        showAlert(type, message) {
            window.clearTimeout(this.alertTimer);
            if (!this.alert || !this.alertMessage) return;

            const safeType = ['success', 'danger', 'info'].includes(type) ? type : 'info';

            this.alert.className = `auth-alert is-visible is-${safeType}`;
            this.alertMessage.textContent = message;

            if (this.alertIcon) {
                const iconClass = {
                    success: 'bi-check-circle-fill',
                    danger: 'bi-x-circle-fill',
                    info: 'bi-info-circle-fill'
                }[safeType];

                this.alertIcon.className = `bi ${iconClass}`;
            }
        }

        hideAlert() {
            window.clearTimeout(this.alertTimer);
            if (!this.alert || !this.alertMessage) return;

            this.alertTimer = window.setTimeout(() => {
                this.alert.className = 'auth-alert';
                this.alertMessage.textContent = '';
                if (this.alertIcon) this.alertIcon.className = 'bi';
            }, 160);
        }

        setLoading(isLoading) {
            this.isSubmitting = isLoading;

            this.form.querySelectorAll('input, button, select, textarea').forEach((control) => {
                control.disabled = isLoading;
            });

            if (!this.submitButton) return;

            const defaultLabel = this.submitButton.dataset.authDefaultLabel || this.submitButton.textContent.trim();
            const loadingLabel = this.submitButton.dataset.authLoadingLabel || 'Processing...';

            this.submitButton.dataset.authDefaultLabel = defaultLabel;
            this.submitButton.setAttribute('aria-busy', isLoading ? 'true' : 'false');
            this.submitButton.innerHTML = isLoading ? `${createSpinner()}<span>${loadingLabel}</span>` : defaultLabel;
        }

        handleAdapterResponse(response, defaultMessage) {
            const result = response || {};
            const ok = result.ok !== false;
            const message = result.message || defaultMessage;

            this.showAlert(ok ? 'success' : 'danger', message);

            if (ok && result.redirect) {
                window.setTimeout(() => {
                    window.location.href = result.redirect;
                }, result.redirectDelay || 700);
            }
        }

        focusFirstSensitiveField() {
            const target = this.form.querySelector('[data-auth-field="password"], [data-auth-field="code"], [data-auth-field="email"]');
            if (!target) return;

            target.focus();
            if (target.select) target.select();
        }
    }

    function initThemeSelectors() {
        document.querySelectorAll('[data-auth-theme-select]').forEach((select) => {
            buildThemeSelector(select);
            select.addEventListener('change', () => applyTheme(select.value));
        });

        applyTheme(getCurrentTheme());
    }

    function initAuthForms() {
        document.querySelectorAll('[data-auth-form]').forEach((form) => {
            new AuthForm(form).init();
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initThemeSelectors();
        initAuthForms();
    });

    window.UttamAuth = Object.freeze({
        themes,
        applyTheme,
        getCurrentTheme,
        AuthForm
    });
})();
