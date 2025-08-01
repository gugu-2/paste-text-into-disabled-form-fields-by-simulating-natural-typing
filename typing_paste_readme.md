# Smart Typing Paste - Brave Browser Extension

A powerful browser extension that allows you to paste text into disabled form fields by simulating natural human typing patterns. Perfect for bypassing copy/paste restrictions while maintaining realistic typing behavior.

## 🚀 Features

- **Bypass Copy/Paste Restrictions**: Works on disabled text fields and forms that block pasting
- **Natural Typing Simulation**: Mimics human typing with random delays and key events
- **Adjustable Typing Speed**: 10 different speed levels from very slow to lightning fast
- **Visual Field Selection**: Easy point-and-click interface to select target fields
- **Persistent Settings**: Remembers your text and speed preferences
- **Works on All Sites**: Compatible with any website or web application
- **Multiple Input Types**: Supports text inputs, textareas, and contenteditable elements

## 📦 Installation

### Method 1: Load as Unpacked Extension (Recommended for Development)

1. **Download the Extension Files**
   - Save all the files (manifest.json, popup.html, popup.js, content.js, content.css) in a single folder
   - Name the folder something like "smart-typing-paste"

2. **Open Brave Browser Extensions Page**
   - Open Brave browser
   - Go to `brave://extensions/` or click Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked" button
   - Select the folder containing your extension files
   - The extension should now appear in your extensions list

5. **Add Icons (Optional)**
   - Create simple icon files named `icon16.png`, `icon48.png`, and `icon128.png`
   - Or remove the icons section from manifest.json if you don't want custom icons

### Method 2: Create Extension Package

1. Zip all the extension files together
2. Rename the zip file to have a `.crx` extension
3. Drag and drop the file onto the extensions page

## 🎯 How to Use

### Step 1: Open the Extension
- Click on the extension icon in your browser toolbar
- The popup window will appear with the typing interface

### Step 2: Enter Your Text
- Paste or type the text you want to insert into the large text area
- Your text will be automatically saved for future use

### Step 3: Adjust Typing Speed
- Use the speed slider to set your preferred typing speed
- Choose from 10 levels: Very Slow (200ms) to Lightning (5ms)
- Medium speed (50ms) works well for most situations

### Step 4: Select Target Field
- Click the "Select Field" button
- An overlay will appear on the webpage
- Click on any text field, textarea, or editable element
- The overlay will disappear and the field will be selected

### Step 5: Start Typing
- Click the "Type Text" button
- Watch as your text is typed naturally into the selected field
- The extension will simulate realistic key events and timing

## 🛠️ Technical Details

### File Structure
```
smart-typing-paste/
├── manifest.json      # Extension configuration
├── popup.html         # Extension popup interface
├── popup.js          # Popup logic and controls
├── content.js        # Main typing simulation logic
├── content.css       # Overlay and highlight styles
└── typing_paste_readme.md  # This file
```

### Key Features Explained

**Natural Typing Simulation**
- Generates realistic KeyboardEvent objects
- Includes keydown, keypress, and keyup events
- Adds random timing variations (±20%) to base delay
- Triggers proper input and change events

**Field Detection**
- Identifies text inputs, textareas, and contenteditable elements
- Works with password fields, email fields, and other input types
- Visual highlighting during selection process

**Bypass Mechanisms**
- Direct DOM manipulation bypasses most copy/paste restrictions
- Simulates human interaction patterns
- Works even on heavily secured forms

## 🔧 Customization

### Modify Typing Speeds
Edit the `speedMap` object in `popup.js`:
```javascript
const speedMap = {
    1: { delay: 200, text: 'Very Slow (200ms)' },
    // Add your custom speeds here
};
```

### Change Appearance
Modify the CSS in `popup.html` and `content.css` to customize:
- Color schemes
- Button styles
- Overlay appearance
- Highlight colors

### Add New Features
The modular structure makes it easy to add:
- Text formatting options
- Multiple text templates
- Keyboard shortcuts
- Advanced timing patterns

## 🚨 Troubleshooting

### Extension Not Loading
- Ensure all files are in the same folder
- Check that manifest.json is valid JSON
- Enable Developer mode in extensions settings

### Field Selection Not Working
- Try refreshing the webpage
- Check browser console for JavaScript errors
- Some sites may block extension content scripts

### Typing Not Working
- Verify the field accepts the type of input you're entering
- Some fields may have additional validation
- Try different typing speeds

### Text Not Appearing
- The field might be overriding input events
- Try selecting the field manually first
- Check if the site has additional security measures

## 🔒 Privacy & Security

- **No Data Collection**: Extension doesn't send any data to external servers
- **Local Storage Only**: Text and settings stored locally in browser
- **No Network Requests**: Works entirely offline
- **Open Source**: All code is visible and auditable

## ⚖️ Legal Considerations

This extension is designed for legitimate use cases such as:
- Accessibility improvements
- Form testing and development
- Productivity enhancement
- Bypassing broken copy/paste functionality

**Please use responsibly and in compliance with website terms of service.**

## 🤝 Contributing

Feel free to submit issues, suggestions, or improvements. This extension can be enhanced with:
- Better error handling
- More input field types
- Advanced timing algorithms
- UI improvements
- Additional customization options

## 📝 License

This project is open source and available under the MIT License.

---

**Happy Typing!** 🎉

If you find this extension useful, consider sharing it with others who might benefit from bypassing copy/paste restrictions in web forms.