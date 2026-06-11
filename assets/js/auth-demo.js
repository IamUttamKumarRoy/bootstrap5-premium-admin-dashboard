/* ========================================================================
   UttamThemes Auth Demo Adapter
   ------------------------------------------------------------------------
   Demo-only adapter. Replace this file with backend auth calls in production.
======================================================================== */
(function () {
    'use strict';

    function wait(ms) {
        return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    function value(data, key) {
        return String(data.get(key) || '').trim();
    }

    window.UttamAuthAdapter = Object.freeze({
        async submit({ flow, data }) {
            await wait(900);

            if (flow === 'login') {
                if (value(data, 'email') === 'demo@example.com' && value(data, 'password').length >= 8) {
                    return {
                        ok: true,
                        message: 'Signed in successfully! Redirecting…'
                        // redirect: 'dashboard.html'
                    };
                }

                return {
                    ok: false,
                    message: 'Invalid email or password. Use demo@example.com and any 8+ character password.'
                };
            }

            const messages = {
                register: 'Account created successfully. Check your email to verify your account.',
                forgot: 'Password reset instructions have been sent to your email.',
                reset: 'Password reset successfully. You can sign in now.',
                twofactor: 'Verification successful. Redirecting…',
                verify: 'Verification email sent again.',
                lock: 'Session unlocked successfully.'
            };

            return {
                ok: true,
                message: messages[flow] || 'Request completed successfully.'
            };
        },

        async social(provider) {
            await wait(250);
            return {
                ok: false,
                message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in is demo-only. Connect your OAuth app in production.`
            };
        }
    });
})();
