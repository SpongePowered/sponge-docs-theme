const
    cldr = require('./cldr'),
    github = require('./github'),
    crowdin = require('./crowdin');

function prepareData(cldr, versions, languages, localeMappings) {
    console.log(`Loaded ${versions.length} versions and ${languages.length} supported languages`);

    // Add native language names to each language
    for (language of languages) {
        const localeCode = localeMappings[language.code];
        language.localeCode = localeCode.replace('-', '_');

        const name = cldr.getDisplayName(language.code, localeCode);
        language.displayName = name || language.name;
    }

    // Add source language
    languages.unshift({
        name: "English",
        displayName: "English",
        code: 'en',
        localeCode: 'en'
    });

    const mainVersion = versions.shift();

    return {
        mainVersion,
        versions, languages
    };
}

module.exports.loadData = (done) =>
    Promise.all([cldr.load(), github.getVersions(), crowdin.getLanguages(), crowdin.getLocaleMappings()])
        .then(values => prepareData(...values));
