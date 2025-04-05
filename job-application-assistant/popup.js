document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const statusElement = document.getElementById('status');
    const generateButton = document.getElementById('generate-response');
    const responseElement = document.getElementById('response');
    const formalButton = document.getElementById('formal');
    const casualButton = document.getElementById('casual');
    const detailedButton = document.getElementById('detailed');
    const copyButton = document.getElementById('copy');
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsPanel = document.getElementById('settings-panel');
    const apiKeyInput = document.getElementById('api-key');
    const wordLimitSelect = document.getElementById('word-limit');
    const saveSettingsButton = document.getElementById('save-settings');

    // Load saved settings
    loadSettings();

    // Settings toggle
    settingsToggle.addEventListener('click', function() {
        settingsPanel.classList.toggle('hidden');
    });

    // Save settings
    saveSettingsButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        const wordLimit = parseInt(wordLimitSelect.value);
        
        if (apiKey) {
            config.apiKey = apiKey;
            config.wordLimit = wordLimit;
            saveConfig();
            updateStatus('Settings saved successfully', 'success');
            settingsPanel.classList.add('hidden');
        } else {
            updateStatus('Please enter a valid API key', 'error');
        }
    });

    // Generate response for selected text
    generateButton.addEventListener('click', function() {
        if (!config.apiKey) {
            updateStatus('Please set your API key first', 'error');
            settingsPanel.classList.remove('hidden');
            return;
        }
        
        updateStatus('Generating response...');
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['content.js']
            }).then(() => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'generateResponse',
                    wordLimit: config.wordLimit
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        updateStatus('Please select some text first', 'error');
                        return;
                    }
                    
                    if (response && response.text) {
                        responseElement.textContent = response.text;
                        updateStatus('Response generated successfully', 'success');
                    } else if (response && response.error) {
                        updateStatus(response.error, 'error');
                    } else {
                        updateStatus('Failed to generate response', 'error');
                    }
                });
            }).catch(error => {
                updateStatus('Error: ' + error.message, 'error');
            });
        });
    });

    // Response variation buttons
    formalButton.addEventListener('click', function() {
        generateVariation('formal');
    });

    casualButton.addEventListener('click', function() {
        generateVariation('casual');
    });

    detailedButton.addEventListener('click', function() {
        generateVariation('detailed');
    });

    // Copy response to clipboard
    copyButton.addEventListener('click', function() {
        const responseText = responseElement.textContent;
        navigator.clipboard.writeText(responseText).then(function() {
            updateStatus('Response copied to clipboard', 'success');
        }).catch(function() {
            updateStatus('Failed to copy response', 'error');
        });
    });

    // Helper functions
    function updateStatus(message, type = 'info') {
        statusElement.textContent = message;
        statusElement.className = 'status ' + type;
    }

    function loadSettings() {
        chrome.storage.local.get(['config'], function(result) {
            if (result.config) {
                config.apiKey = result.config.apiKey;
                config.wordLimit = result.config.wordLimit;
                apiKeyInput.value = config.apiKey;
                wordLimitSelect.value = config.wordLimit;
            }
        });
    }

    function generateVariation(style) {
        const currentResponse = responseElement.textContent;
        if (!currentResponse) {
            updateStatus('No response to modify', 'error');
            return;
        }

        if (!config.apiKey) {
            updateStatus('Please set your API key first', 'error');
            settingsPanel.classList.remove('hidden');
            return;
        }

        updateStatus('Generating variation...');
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['content.js']
            }).then(() => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'generateResponse',
                    text: currentResponse,
                    style: style,
                    wordLimit: config.wordLimit
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        updateStatus('Error: ' + chrome.runtime.lastError.message, 'error');
                        return;
                    }
                    
                    if (response && response.text) {
                        responseElement.textContent = response.text;
                        updateStatus(`${style} variation generated`, 'success');
                    } else if (response && response.error) {
                        updateStatus(response.error, 'error');
                    } else {
                        updateStatus('Failed to generate variation', 'error');
                    }
                });
            }).catch(error => {
                updateStatus('Error: ' + error.message, 'error');
            });
        });
    }
}); 