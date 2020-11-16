const
    cldr = require('./cldr'),
    crowdin = require('./crowdin');

const baseUrl = process.env.BASE_URL;

function prepareData(cldr, languages, localeMappings) {
    let versions = Object.keys(languages);
    versions.sort().reverse()

    // Add native language names to each language
    for (version of versions) {
        const versionLanguages = languages[version];
        console.log(`Loaded version ${version} with ${versionLanguages.length + 1} supported languages`);

        for(language of versionLanguages) {
            const locale = localeMappings[language.id].locale;
            language.locale = locale.replace('-', '_');

            language.name = localeMappings[language.id].name;

            const name = cldr.getDisplayName(language.locale, locale);
            language.displayName = name || language.name;
        }

        // Add source language
        languages[version].unshift({
            name: "English",
            displayName: "English",
            id: 'en',
            locale: 'en'
        });
    }

    const mainVersion = versions.shift();

    return {
        baseUrl, mainVersion,
        versions, languages
    };
}

module.exports.loadData = (done) =>
    Promise.all([cldr.load(), crowdin.getLanguages(), crowdin.getLocaleMappings()])
        .then(values => prepareData(...values));
