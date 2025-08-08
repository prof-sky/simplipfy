# Add a new Language

## Structure

Languages are sorted into different directories. Inside `src/languages` you can find the examples for english, german 
and French. There is also the languageManager.js file and a developer `translator.py`. 
This translator.py can help you to create the directory and the files inside it. It will translate the english language 
files into the new language which needs to be defined inside translator.py. 
The python script is not perfect, so you <strong>definitely need to check the translations</strong> and adapt them to your needs.
Simple sentences can be translated well, but as soon as objects are encountered, you have to adapt the files. 
See this script more as a friendly helper to get you started with the new language :) 

## Adding a new language
To add a new language, you need to follow these steps:
1. Define the language inside translator.py and execute it
2. Check the created files in `src/languages/<newLanguage>` and adapt them to your needs
    - Especially check the files `dataLegalAbout, extraLiveQuestions, news, selector` because they contain objects that are difficult to translate
3. Add a new shortSymbol for your language in `src/languages/lang.<newLang>.js` like `window.englishShortSymbol = "en"`
4. Add all new files to the `index.html` file
5. Adapt the language selector in the navigation, needs to be done in index.html and pageManager (setupNavigation).