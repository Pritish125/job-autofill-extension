// Configuration settings
const config = {
    apiKey: 'AIzaSyCFHhM54A-W00_lKYRWr-9ftA2gq32hewU', // Your Gemini API key will be stored here
    wordLimit: 50, // Default word limit
    wordLimitOptions: [25, 50, 75, 100, 150, 200] // Available word limit options
};

// Save configuration to Chrome storage
function saveConfig() {
    chrome.storage.local.set({ config: config }, function() {
        console.log('Configuration saved');
    });
}

// Load configuration from Chrome storage
function loadConfig() {
    chrome.storage.local.get(['config'], function(result) {
        if (result.config) {
            Object.assign(config, result.config);
        }
    });
}

// Initialize config
loadConfig(); 