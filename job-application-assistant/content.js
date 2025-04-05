// Common form field selectors
const FORM_FIELD_SELECTORS = [
    'input[type="text"]',
    'input[type="email"]',
    'input[type="tel"]',
    'textarea',
    'select',
    '[role="textbox"]',
    '[contenteditable="true"]',
    'input:not([type])', // Fallback for inputs without type
    'input[type="search"]',
    'input[type="url"]',
    'input[type="number"]',
    'input[type="password"]'
];

// Common field labels and their corresponding memory sections
const FIELD_MAPPINGS = {
    'name': 'Personal Information',
    'email': 'Contact Information',
    'phone': 'Contact Information',
    'education': 'Education',
    'experience': 'Work Experience',
    'skills': 'Technical Skills',
    'projects': 'Projects',
    'about': 'Objective',
    'why': 'Why should we hire you',
    'strengths': 'Core Competencies',
    'weaknesses': 'Self-Assessment',
    'salary': 'Compensation',
    'availability': 'Availability',
    'linkedin': 'Contact Information',
    'github': 'Technical Skills',
    'portfolio': 'Projects',
    'resume': 'Work Experience',
    'cover': 'Objective',
    'references': 'Contact Information'
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'scanFields') {
        const fields = scanFormFields();
        console.log('Detected fields:', fields); // Debug log
        sendResponse({ fields: fields });
    } else if (request.action === 'fillAllFields') {
        fillAllFields().then(success => {
            sendResponse({ success: success });
        });
        return true; // Required for async response
    } else if (request.action === 'generateResponse') {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            generateResponseForText(selectedText)
                .then(response => sendResponse({ text: response }))
                .catch(error => sendResponse({ error: error.message }));
            return true; // Required for async response
        } else {
            sendResponse({ error: 'No text selected' });
        }
    }
});

function scanFormFields() {
    const fields = [];
    
    // Find all form elements
    const formElements = document.querySelectorAll(FORM_FIELD_SELECTORS.join(', '));
    console.log('Found elements:', formElements.length); // Debug log
    
    formElements.forEach(element => {
        const field = analyzeField(element);
        if (field) {
            fields.push(field);
        }
    });
    
    return fields;
}

function analyzeField(element) {
    // Skip hidden or disabled fields
    if (element.offsetParent === null || element.disabled) {
        return null;
    }
    
    // Skip already filled fields
    if (element.value && element.value.trim() !== '') {
        return null;
    }
    
    const field = {
        element: element,
        name: element.name || element.id || '',
        label: getFieldLabel(element),
        type: element.type || element.tagName.toLowerCase(),
        maxLength: element.maxLength || null,
        required: element.required || false,
        placeholder: element.placeholder || ''
    };
    
    // Try to determine the field's purpose
    field.purpose = determineFieldPurpose(field);
    
    // Debug log
    console.log('Analyzed field:', field);
    
    return field;
}

function getFieldLabel(element) {
    // Try to find associated label
    if (element.id) {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label) return label.textContent.trim();
    }
    
    // Check for aria-label
    if (element.getAttribute('aria-label')) {
        return element.getAttribute('aria-label').trim();
    }
    
    // Check for placeholder
    if (element.placeholder) {
        return element.placeholder.trim();
    }
    
    // Check for parent label
    const parentLabel = element.closest('label');
    if (parentLabel) {
        return parentLabel.textContent.trim();
    }
    
    // Check for nearby text
    const nearbyText = findNearbyText(element);
    if (nearbyText) {
        return nearbyText.trim();
    }
    
    // Check for data-label attribute
    if (element.getAttribute('data-label')) {
        return element.getAttribute('data-label').trim();
    }
    
    return '';
}

function findNearbyText(element) {
    // Check previous sibling
    let sibling = element.previousElementSibling;
    while (sibling) {
        if (sibling.textContent.trim()) {
            return sibling.textContent;
        }
        sibling = sibling.previousElementSibling;
    }
    
    // Check parent's previous sibling
    const parent = element.parentElement;
    if (parent) {
        sibling = parent.previousElementSibling;
        while (sibling) {
            if (sibling.textContent.trim()) {
                return sibling.textContent;
            }
            sibling = sibling.previousElementSibling;
        }
    }
    
    // Check for nearby div with class containing 'label'
    const nearbyLabel = document.querySelector(`div[class*="label"]:not(:empty)`);
    if (nearbyLabel) {
        return nearbyLabel.textContent;
    }
    
    return null;
}

function determineFieldPurpose(field) {
    const name = field.name.toLowerCase();
    const label = field.label.toLowerCase();
    const placeholder = field.placeholder.toLowerCase();
    
    // Check for exact matches
    for (const [key, value] of Object.entries(FIELD_MAPPINGS)) {
        if (name.includes(key) || label.includes(key) || placeholder.includes(key)) {
            return value;
        }
    }
    
    // Check for partial matches
    for (const [key, value] of Object.entries(FIELD_MAPPINGS)) {
        if (name.includes(key.slice(0, 3)) || label.includes(key.slice(0, 3)) || placeholder.includes(key.slice(0, 3))) {
            return value;
        }
    }
    
    return 'Other';
}

async function fillAllFields() {
    const fields = scanFormFields();
    let success = true;
    
    for (const field of fields) {
        try {
            await fillField(field);
        } catch (error) {
            console.error('Error filling field:', error);
            success = false;
        }
    }
    
    return success;
}

async function fillField(field) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            action: 'generateResponse',
            field: field
        }, function(response) {
            if (response && response.text) {
                // Fill the field with the generated response
                if (field.element.tagName === 'INPUT' || field.element.tagName === 'TEXTAREA') {
                    field.element.value = response.text;
                } else if (field.element.hasAttribute('contenteditable')) {
                    field.element.textContent = response.text;
                }
                
                // Trigger input event to ensure any listeners are notified
                const event = new Event('input', { bubbles: true });
                field.element.dispatchEvent(event);
                
                resolve();
            } else {
                reject(new Error('Failed to generate response'));
            }
        });
    });
}

async function generateResponseForText(selectedText) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            action: 'generateResponseForText',
            text: selectedText
        }, function(response) {
            if (response && response.text) {
                resolve(response.text);
            } else if (response && response.error) {
                reject(new Error(response.error));
            } else {
                reject(new Error('Failed to generate response'));
            }
        });
    });
} 