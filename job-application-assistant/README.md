# Job Application Assistant Chrome Extension

A Chrome extension that helps automate the process of filling out online job application forms using personalized information and AI-generated responses.

## Features

- Automatically detects form fields on job application pages
- Generates context-aware responses using the Gemini API
- Personalizes responses based on your stored information
- Supports multiple response variations for each field
- Modern and user-friendly interface
- Secure storage of API key and personal information

## Setup Instructions

1. **Get a Gemini API Key**
   - Visit the [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create or sign in to your Google account
   - Generate a new API key
   - Copy the API key for later use

2. **Install the Extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `job-application-assistant` folder

3. **Configure the Extension**
   - Click the extension icon in your browser toolbar
   - Open the settings panel
   - Paste your Gemini API key in the provided field
   - Create a `memory.txt` file in the extension directory with your personal information

4. **Format Your memory.txt File**
   Organize your information into sections using the following format:

   ```
   === Personal Information ===
   [Your personal details]

   === Contact Information ===
   [Your contact information]

   === Education ===
   [Your educational background]

   === Work Experience ===
   [Your work history]

   === Technical Skills ===
   [Your technical skills]

   === Projects ===
   [Your project experience]

   === Core Competencies ===
   [Your key strengths]

   === Objective ===
   [Your career objectives]
   ```

## Usage

1. Navigate to a job application page
2. Click the extension icon to open the popup
3. Click "Scan Fields" to detect form fields
4. Review the detected fields and their purposes
5. Click "Fill All Fields" to automatically populate the form
6. For each field, you can:
   - Accept the generated response
   - Generate alternative responses
   - Edit the response manually
   - Skip the field

## Privacy & Security

- Your personal information is stored locally in the `memory.txt` file
- The Gemini API key is stored securely in Chrome's local storage
- No data is sent to external servers except the Gemini API
- All communication with the Gemini API is encrypted

## Troubleshooting

If you encounter issues:

1. **Fields not detected**
   - Make sure you're on a job application page
   - Try refreshing the page
   - Check if the fields are in standard HTML format

2. **API errors**
   - Verify your API key is correct
   - Check your internet connection
   - Ensure you haven't exceeded API rate limits

3. **Extension not working**
   - Check if the extension is enabled
   - Try reloading the extension
   - Clear browser cache and reload the page

## Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests
- Improving documentation

## License

This project is licensed under the MIT License - see the LICENSE file for details. 