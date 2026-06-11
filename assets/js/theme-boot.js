/* ========================================================================
   UttamThemes Auth Theme Boot
   ------------------------------------------------------------------------
   Must load synchronously in <head> before CSS to prevent theme flash.
======================================================================== */
(function () {
    'use strict';

    const STORAGE_KEY = 'uttam-theme';
    const DEFAULT_THEME = 'cosmic-aurora';

    const themeModes = Object.freeze({
        light: 'light',
        dark: 'dark',
        obsidian: 'dark',
        vercel: 'dark',
        'deep-space': 'dark',
        netflix: 'dark',
        microsoft: 'light',
        google: 'light',
        apple: 'light',
        vscode: 'dark',
        aws: 'dark',
        royal: 'light',
        spotify: 'dark',
        figma: 'light',
        slack: 'light',
        airbnb: 'light',
        uber: 'dark',
        sapphire: 'light',
        nebula: 'dark',
        aurora: 'light',
        phoenix: 'light',
        sakura: 'light',
        sunset: 'light',
        rose: 'light',
        slate: 'light',
        emerald: 'light',
        ocean: 'light',
        'midnight-teal': 'dark',
        cyber: 'dark',
        'cosmic-aurora': 'dark'
    });

    function getSavedTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (_) {
            return null;
        }
    }

    const savedTheme = getSavedTheme();
    const theme = Object.prototype.hasOwnProperty.call(themeModes, savedTheme) ? savedTheme : DEFAULT_THEME;
    const mode = themeModes[theme];

    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', mode);
    document.documentElement.style.colorScheme = mode;
})();
