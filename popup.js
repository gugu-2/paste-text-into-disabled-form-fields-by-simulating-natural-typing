document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    const speedSlider = document.getElementById('speedSlider');
    const speedDisplay = document.getElementById('speedDisplay');
    const selectFieldBtn = document.getElementById('selectFieldBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const status = document.getElementById('status');
    const fieldIndicator = document.getElementById('fieldIndicator');

    let selectedField = false;
    let isSelecting = false;

    // Speed mapping (milliseconds per character)
    const speedMap = {
        1: { delay: 200, text: 'Very Slow (200ms)' },
        2: { delay: 150, text: 'Slow (150ms)' },
        3: { delay: 120, text: 'Slow-Medium (120ms)' },
        4: { delay: 90, text: 'Medium-Slow (90ms)' },
        5: { delay: 50, text: 'Medium (50ms)' },
        6: { delay: 30, text: 'Medium-Fast (30ms)' },
        7: { delay: 20, text: 'Fast (20ms)' },
        8: { delay: 15, text: 'Very Fast (15ms)' },
        9: { delay: 10, text: 'Super Fast (10ms)' },
        10: { delay: 5, text: 'Lightning (5ms)' }
    };

    // Load saved data
    chrome.storage.local.get(['savedText', 'typingSpeed', 'fieldSelected'], function(result) {
        if (result.savedText) {
            textInput.value = result.savedText;
        }
        if (result.typingSpeed) {
            speedSlider.value = result.typingSpeed;
            updateSpeedDisplay();
        }
        if (result.fieldSelected) {
            selectedField = true;
            updateFieldIndicator(true);
            updateButtonStates();
        }
    });

    // Update speed display
    function updateSpeedDisplay() {
        const speed = parseInt(speedSlider.value);
        speedDisplay.textContent = speedMap[speed].text;
    }

    // Save text and speed when changed
    textInput.addEventListener('input', function() {
        chrome.storage.local.set({ savedText: textInput.value });
        updateButtonStates();
    });

    speedSlider.addEventListener('input', function() {
        updateSpeedDisplay();
        chrome.storage.local.set({ typingSpeed: parseInt(speedSlider.value) });
    });

    // Update button states based on current conditions
    function updateButtonStates() {
        const hasText = textInput.value.trim().length > 0;
        
        if (!hasText) {
            selectFieldBtn.disabled = true;
            pasteBtn.disabled = true;
            updateStatus('Enter some text to get started', 'info');
        } else if (!selectedField) {
            selectFieldBtn.disabled = false;
            pasteBtn.disabled = true;
        } else {
            selectFieldBtn.disabled = false;
            pasteBtn.disabled = false;
        }
    }

    // Update status message
    function updateStatus(message, type = 'info') {
        status.textContent = message;
        status.className = `status ${type}`;
        
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                if (status.textContent === message) {
                    status.textContent = '';
                    status.className = 'status';
                }
            }, 4000);
        }
    }

    // Update field indicator
    function updateFieldIndicator(isSelected) {
        if (isSelected) {
            fieldIndicator.classList.add('selected');
        } else {
            fieldIndicator.classList.remove('selected');
        }
    }

    // Select field button
    selectFieldBtn.addEventListener('click', function() {
        if (!textInput.value.trim()) {
            updateStatus('Please enter some text first!', 'error');
            textInput.focus();
            return;
        }

        if (isSelecting) {
            // Cancel selection if already selecting
            cancelFieldSelection();
            return;
        }

        isSelecting = true;
        selectFieldBtn.textContent = 'Cancel Selection';
        selectFieldBtn.classList.remove('btn-secondary');
        selectFieldBtn.classList.add('btn-cancel');
        updateStatus('🎯 Now click on any text field on the webpage!', 'info');

        // Send message to content script to enable field selection
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'enableFieldSelection'
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error('Error:', chrome.runtime.lastError);
                        resetSelectionState();
                        updateStatus('Error: Please refresh the page and try again', 'error');
                    }
                });
            }
        });
    });

    // Reset selection state
    function resetSelectionState() {
        isSelecting = false;
        selectFieldBtn.textContent = 'Select Field';
        selectFieldBtn.classList.remove('btn-cancel');
        selectFieldBtn.classList.add('btn-secondary');
        selectFieldBtn.disabled = false;
        updateFieldIndicator(selectedField);
    }

    // Cancel field selection
    function cancelFieldSelection() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'cancelFieldSelection'
                });
            }
        });
        resetSelectionState();
        updateStatus('Field selection cancelled', 'info');
    }

    // Paste button
    pasteBtn.addEventListener('click', function() {
        if (!selectedField) {
            updateStatus('Please select a field first!', 'error');
            return;
        }

        if (!textInput.value.trim()) {
            updateStatus('Please enter some text to type!', 'error');
            textInput.focus();
            return;
        }

        const speed = parseInt(speedSlider.value);
        const delay = speedMap[speed].delay;
        const textLength = textInput.value.length;
        const estimatedTime = Math.round((textLength * delay) / 1000);

        pasteBtn.disabled = true;
        pasteBtn.textContent = 'Typing...';
        selectFieldBtn.disabled = true;
        
        updateStatus(`Typing ${textLength} characters (≈${estimatedTime}s)...`, 'info');

        // Send message to content script to start typing
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'startTyping',
                    text: textInput.value,
                    delay: delay
                }, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error('Error:', chrome.runtime.lastError);
                        resetTypingState();
                        updateStatus('Error: Please refresh the page and try again', 'error');
                    }
                });
            }
        });
    });

    // Reset typing state
    function resetTypingState() {
        pasteBtn.disabled = false;
        pasteBtn.textContent = 'Type Text';
        selectFieldBtn.disabled = false;
    }

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'fieldSelected') {
            selectedField = true;
            isSelecting = false;
            selectFieldBtn.textContent = 'Select Field';
            selectFieldBtn.classList.remove('btn-cancel');
            selectFieldBtn.classList.add('btn-secondary');
            selectFieldBtn.disabled = false;
            pasteBtn.disabled = false;
            updateFieldIndicator(true);
            updateStatus('✓ Field selected! Ready to type.', 'success');
            
            // Save the selection state
            chrome.storage.local.set({ fieldSelected: true });
        } else if (request.action === 'typingComplete') {
            resetTypingState();
            updateStatus('✓ Text typed successfully!', 'success');
        } else if (request.action === 'typingError') {
            resetTypingState();
            updateStatus('Error: ' + request.error, 'error');
            if (request.error.includes('No field selected') || request.error.includes('no longer available')) {
                selectedField = false;
                updateFieldIndicator(false);
                chrome.storage.local.set({ 
                    fieldSelected: false,
                    elementSelector: null 
                });
                updateButtonStates();
            }
        } else if (request.action === 'selectionCancelled') {
            resetSelectionState();
            updateStatus('Field selection cancelled', 'info');
        }
    });

    // Clear selection button
    const clearSelectionBtn = document.getElementById('clearSelectionBtn');
    clearSelectionBtn.addEventListener('click', function() {
        selectedField = false;
        updateFieldIndicator(false);
        chrome.storage.local.set({ 
            fieldSelected: false,
            elementSelector: null 
        });
        
        // Send message to content script to clear selection
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'clearSelection'
                });
            }
        });
        
        updateButtonStates();
        updateStatus('Field selection cleared', 'info');
    });

    // Initialize
    updateSpeedDisplay();
    updateButtonStates();
    updateFieldIndicator(selectedField);

    // Auto-focus text input when popup opens
    setTimeout(() => {
        if (!textInput.value) {
            textInput.focus();
        }
    }, 100);
});