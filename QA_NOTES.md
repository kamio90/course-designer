# QA Notes

This document lists known browser quirks and limitations discovered during cross-browser testing.

## Firefox
- Focus rings sometimes appear offset when the canvas is scaled. No functional impact.

## Safari
- Context menu positioning may lag slightly on older iOS versions.
- Pointer Events support is partial; touch fallbacks are used.

## Edge/Chrome
- Two-finger pinch may trigger page zoom if the canvas is not focused. The app now captures focus automatically.

If a required API is unavailable, the app displays a message recommending a modern browser.
