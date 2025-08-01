// Content script for Smart Typing Paste extension
(function() {
    let selectedElement = null;
    let isSelectionMode = false;
    let originalOverlay = null;
    let elementSelector = null; // Store CSS selector for the selected element

    // Create overlay for field selection
    function createSelectionOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'smart-typing-overlay';
        overlay.innerHTML = `
            <div class="overlay-content">
                <div class="overlay-text">
                    Click on any text field to select it
                </div>
                <button class="overlay-cancel">Cancel</button>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    // Remove selection overlay
    function removeSelectionOverlay() {
        const overlay = document.getElementById('smart-typing-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // Highlight element on hover
    function highlightElement(element) {
        if (element && isTextInput(element)) {
            element.style.outline = '3px solid #4CAF50';
            element.style.outlineOffset = '2px';
        }
    }

    // Remove highlight from element
    function removeHighlight(element) {
        if (element) {
            element.style.outline = '';
            element.style.outlineOffset = '';
        }
    }

    // Check if element is a text input
    function isTextInput(element) {
        if (!element) return false;
        
        const tagName = element.tagName.toLowerCase();
        const type = element.type ? element.type.toLowerCase() : '';
        
        return (
            tagName === 'textarea' ||
            (tagName === 'input' && (
                type === 'text' ||
                type === 'email' ||
                type === 'password' ||
                type === 'search' ||
                type === 'tel' ||
                type === 'url' ||
                type === 'number' ||
                type === '' ||
                !type
            )) ||
            element.contentEditable === 'true' ||
            element.getAttribute('contenteditable') === 'true'
        );
    }

    // Generate a unique selector for an element
    function generateElementSelector(element) {
        if (!element) return null;
        
        // Try to use ID first
        if (element.id) {
            return `#${element.id}`;
        }
        
        // Try to use name attribute
        if (element.name) {
            const tagName = element.tagName.toLowerCase();
            return `${tagName}[name="${element.name}"]`;
        }
        
        // Use tag name with index as fallback
        const tagName = element.tagName.toLowerCase();
        const siblings = Array.from(document.querySelectorAll(tagName));
        const index = siblings.indexOf(element);
        
        return `${tagName}:nth-of-type(${index + 1})`;
    }

    // Find element by stored selector
    function findElementBySelector(selector) {
        if (!selector) return null;
        
        try {
            const element = document.querySelector(selector);
            return isTextInput(element) ? element : null;
        } catch (e) {
            console.error('Error finding element:', e);
            return null;
        }
    }

    // Load saved element selection
    function loadSavedSelection() {
        chrome.storage.local.get(['elementSelector'], function(result) {
            if (result.elementSelector) {
                elementSelector = result.elementSelector;
                selectedElement = findElementBySelector(elementSelector);
                
                if (!selectedElement) {
                    // Element not found, clear saved state
                    chrome.storage.local.set({ 
                        fieldSelected: false, 
                        elementSelector: null 
                    });
                }
            }
        });
    }

    // Simulate natural typing with random delays
    function getRandomDelay(baseDelay) {
        // Add 20% random variation to make typing look more natural
        const variation = baseDelay * 0.2;
        return baseDelay + (Math.random() * variation * 2 - variation);
    }

    // Simulate key events
    function simulateKeyEvent(element, eventType, char) {
        const event = new KeyboardEvent(eventType, {
            key: char,
            char: char,
            charCode: char.charCodeAt(0),
            keyCode: char.charCodeAt(0),
            which: char.charCodeAt(0),
            bubbles: true,
            cancelable: true
        });
        
        element.dispatchEvent(event);
    }

    // Simulate input event
    function simulateInputEvent(element) {
        const inputEvent = new Event('input', {
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(inputEvent);

        const changeEvent = new Event('change', {
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(changeEvent);
    }

    // Type text character by character
    async function typeText(element, text, baseDelay) {
        if (!element || !text) {
            throw new Error('Invalid element or text');
        }

        // Focus the element
        element.focus();
        
        // Clear existing text
        if (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'input') {
            element.value = '';
        } else if (element.contentEditable === 'true') {
            element.textContent = '';
        }

        // Type each character
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            // Simulate keydown
            simulateKeyEvent(element, 'keydown', char);
            
            // Add character to element
            if (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'input') {
                element.value += char;
            } else if (element.contentEditable === 'true') {
                element.textContent += char;
            }
            
            // Simulate keypress and keyup
            simulateKeyEvent(element, 'keypress', char);
            simulateKeyEvent(element, 'keyup', char);
            
            // Trigger input event
            simulateInputEvent(element);
            
            // Random delay for natural typing
            if (i < text.length - 1) {
                const delay = getRandomDelay(baseDelay);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        // Final events
        element.blur();
        element.focus();
    }

    // Handle mouse events during selection mode
    function handleMouseOver(event) {
        if (!isSelectionMode) return;
        
        if (isTextInput(event.target)) {
            highlightElement(event.target);
        }
    }

    function handleMouseOut(event) {
        if (!isSelectionMode) return;
        
        removeHighlight(event.target);
    }

    function handleClick(event) {
        if (!isSelectionMode) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        if (isTextInput(event.target)) {
            selectedElement = event.target;
            elementSelector = generateElementSelector(event.target);
            removeHighlight(event.target);
            disableSelectionMode();
            
            // Save field selection state and element selector
            chrome.storage.local.set({ 
                fieldSelected: true,
                elementSelector: elementSelector
            });
            
            chrome.runtime.sendMessage({
                action: 'fieldSelected'
            });
        }
    }

    // Enable selection mode
    function enableSelectionMode() {
        isSelectionMode = true;
        originalOverlay = createSelectionOverlay();
        
        // Add event listeners
        document.addEventListener('mouseover', handleMouseOver, true);
        document.addEventListener('mouseout', handleMouseOut, true);
        document.addEventListener('click', handleClick, true);
        
        // Handle cancel button
        const cancelBtn = document.querySelector('.overlay-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                disableSelectionMode();
                chrome.runtime.sendMessage({
                    action: 'selectionCancelled'
                });
            });
        }
    }

    // Disable selection mode
    function disableSelectionMode() {
        isSelectionMode = false;
        removeSelectionOverlay();
        
        // Remove event listeners
        document.removeEventListener('mouseover', handleMouseOver, true);
        document.removeEventListener('mouseout', handleMouseOut, true);
        document.removeEventListener('click', handleClick, true);
        
        // Remove any remaining highlights
        document.querySelectorAll('*').forEach(el => removeHighlight(el));
    }

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'enableFieldSelection') {
            enableSelectionMode();
            sendResponse({ success: true });
        } else if (request.action === 'cancelFieldSelection') {
            disableSelectionMode();
            sendResponse({ success: true });
        } else if (request.action === 'clearSelection') {
            selectedElement = null;
            elementSelector = null;
            sendResponse({ success: true });
        } else if (request.action === 'startTyping') {
            // Try to restore element if not available
            if (!selectedElement && elementSelector) {
                selectedElement = findElementBySelector(elementSelector);
            }
            
            if (!selectedElement) {
                // Clear saved state if element can't be found
                chrome.storage.local.set({ 
                    fieldSelected: false, 
                    elementSelector: null 
                });
                
                chrome.runtime.sendMessage({
                    action: 'typingError',
                    error: 'Selected field is no longer available. Please select a field again.'
                });
                return;
            }

            typeText(selectedElement, request.text, request.delay)
                .then(() => {
                    chrome.runtime.sendMessage({
                        action: 'typingComplete'
                    });
                })
                .catch((error) => {
                    chrome.runtime.sendMessage({
                        action: 'typingError',
                        error: error.message
                    });
                });
            
            sendResponse({ success: true });
        }
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', function() {
        disableSelectionMode();
    });

    // Initialize - load saved selection when content script loads
    loadSavedSelection();
})();