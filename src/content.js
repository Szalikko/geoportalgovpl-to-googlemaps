// content.js - Extract coordinates from Geoportal and Google Maps

chrome.runtime.onMessage.addListener(function (msg, sender, callback) {
    if (msg.action === 'extractWgs84InDmsFormatFromGeoportal') {
        console.info("Extracting coords from Geoportal");

        // Check if coordinates exist in DOM
        if (document.querySelectorAll(".infoStripe .iy em")[1] != null) {
            // Get lat/lon and fix decimal separator
            let lat = document.querySelectorAll(".infoStripe .ix em")[1].innerText.replace(',', '.');
            let lon = document.querySelectorAll(".infoStripe .iy em")[1].innerText.replace(',', '.');

            console.debug(`Found Geoportal coords: lat=${lat}, lon=${lon}`);
            callback({ lat, lon });
        } else {
            // No coordinates found
            callback();
        }

    } else if (msg.action === 'extractWgs84InDdFormatFromGoogle') {
        console.info("Extracting coords from Google");

        const url = window.location.href;

        // Two URL formats:
        // 1) "@lat,lon,zoom"
        // 2) "/lat,lon"
        const patternAt = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const patternPlace = /\/(-?\d+\.\d+),(-?\d+\.\d+)(?:[/?]|$)/;

        // Match either format
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
