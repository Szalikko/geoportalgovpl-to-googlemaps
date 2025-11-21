// content.js - Extract coordinates from Geoportal and Google Maps
// Uses MutationObserver to ensure Geoportal coords are available

chrome.runtime.onMessage.addListener(function (msg, sender, callback) {
    // GEOportal coordinates (DMS)
    if (msg.action === 'extractWgs84InDmsFormatFromGeoportal') {
        console.info("Extracting coords from Geoportal");

        const infoStripe = document.querySelector('.infoStripe');

        if (!infoStripe) {
            console.warn("InfoStripe not found");
            callback();
            return;
        }

        // Use MutationObserver to wait until coords exist in DOM
        const observer = new MutationObserver(() => {
            const latEl = document.querySelectorAll(".infoStripe .ix em")[1];
            const lonEl = document.querySelectorAll(".infoStripe .iy em")[1];

            if (latEl && lonEl) {
                observer.disconnect(); // stop observing
                const lat = latEl.innerText.replace(',', '.');
                const lon = lonEl.innerText.replace(',', '.');

                console.debug(`Found Geoportal coords: lat=${lat}, lon=${lon}`);
                callback({ lat, lon });
            }
        });

        // Start observing child nodes and subtree for changes
        observer.observe(infoStripe, { childList: true, subtree: true });

    } 
    // Google Maps coordinates (DD)
    else if (msg.action === 'extractWgs84InDdFormatFromGoogle') {
        console.info("Extracting coords from Google");

        const url = window.location.href;

        // Two URL formats:
        // 1) "@lat,lon,zoom"
        // 2) "/lat,lon"
        const patternAt = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const patternPlace = /\/(-?\d+\.\d+),(-?\d+\.\d+)(?:[/?]|$)/;

        const match = url.match(patternAt) || url.match(patternPlace);

        if (match) {
            const lat = match[1];
            const lon = match[2];
            console.debug(`Found Google coords: lat=${lat}, lon=${lon}`);
            callback({ lat, lon });
        } else {
            console.warn("No coords found in URL");
            callback();
        }
    }
});
