// background.js - handles shortcut and button clicks
// Converts coordinates between Geoportal and Google Maps using proj4

import proj4 from 'https://cdn.jsdelivr.net/npm/proj4@2.9.0/+esm';

// Enable/disable extension button based on active tab
chrome.tabs.onActivated.addListener(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) return;

    const url = tab.url;
    if (url.includes("geoportal.gov.pl") || url.includes("google.")) {
        chrome.action.enable(tab.id);  // Enable button
    } else {
        chrome.action.disable(tab.id); // Disable button
    }
});

// Handle action button click or keyboard shortcut
chrome.action.onClicked.addListener(async (tab) => {
    if (!tab || !tab.url) return;

    const hostname = new URL(tab.url).hostname;
    console.debug(`Hostname: ${hostname}`);

    // GEOportal -> Google Maps
    if (hostname.includes("geoportal.gov.pl")) {
        chrome.tabs.sendMessage(tab.id, { action: 'extractWgs84InDmsFormatFromGeoportal' }, (response) => {
            if (!response) return;

            const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${response.lat},${response.lon}`;
            chrome.tabs.create({ url: gmapsUrl });
        });
    }

    // Google Maps -> GEOportal
    else if (hostname.includes("google.")) {
        chrome.tabs.sendMessage(tab.id, { action: 'extractWgs84InDdFormatFromGoogle' }, (response) => {
            if (!response) return;

            // Define projections
            proj4.defs('GOOGLE_MAPS', "+proj=longlat +datum=WGS84 +no_defs");
            proj4.defs('GEOPORTAL', "+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

            // Convert WGS84 -> Geoportal coordinates
            const [geopLon, geopLat] = proj4('GOOGLE_MAPS', 'GEOPORTAL', [parseFloat(response.lon), parseFloat(response.lat)]);

            const geoportalUrl = `https://mapy.geoportal.gov.pl/imap/Imgp_2.html?bbox=${geopLon},${geopLat},${geopLon},${geopLat}`;
            chrome.tabs.create({ url: geoportalUrl });
        });
    }
});
