// Listen for messages from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'generateResponseForText') {
        generateResponseForText(request.text, request.wordLimit)
            .then(response => sendResponse({ text: response }))
            .catch(error => sendResponse({ error: error.message }));
        return true; // Required for async response
    }
});

async function generateResponseForText(text, wordLimit = 50) {
    return new Promise((resolve, reject) => {
        // Get the Gemini API key from storage
        chrome.storage.local.get(['config'], function(result) {
            if (!result.config || !result.config.apiKey) {
                reject(new Error('Gemini API key not found'));
                return;
            }

            // Get the memory data
            fetch(chrome.runtime.getURL('memory.txt'))
                .then(response => response.text())
                .then(memoryData => {
                    const prompt = createPromptForText(text, memoryData, wordLimit);
                    return callGeminiAPI(prompt, result.config.apiKey);
                })
                .then(response => resolve(response))
                .catch(error => reject(error));
        });
    });
}

function createPromptForText(text, memoryData, wordLimit) {
    return `Using the following personal information:
${memoryData}

Generate a concise, professional response for the following text from a job application:
"${text}"

The response should be:
- Maximum ${wordLimit} words
- Direct and to the point
- Focus on key achievements and skills
- Use active voice
- Avoid filler words and phrases
- Maintain professional tone
- Include specific metrics or results when possible
- Based on the provided personal information`;
}

async function callGeminiAPI(prompt, apiKey) {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        })
    });

    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error.message);
    }
    
    return data.candidates[0].content.parts[0].text;
} 