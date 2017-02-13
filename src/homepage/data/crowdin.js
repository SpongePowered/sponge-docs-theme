const rp = require('request-promise-native');

const projectIdentifier = 'sponge-docs';
const crowdinApiKey = process.env.CROWDIN_API_KEY;

const localLanguages = require('./languages');

module.exports.getLocaleMappings = () =>
    rp({
        uri: 'https://api.crowdin.com/api/supported-languages?json',
        json: true
    }).then((resp) => {
        const result = {};
        for (language of resp) {
            result[localLanguages[language.crowdin_code] || language.crowdin_code] = language.locale
        }
        return result;
    });

if (crowdinApiKey) {
    module.exports.getLanguages = () =>
        rp({
            uri: `https://api.crowdin.com/api/project/${projectIdentifier}/status`,
            qs: {
                key: crowdinApiKey,
                json: true
            },
            json: true
        }).then(resp => {
            const languages = [];

            for (language of resp) {
                // Include only languages with at least 5% progress
                if (language.translated_progress >= 5 || language.code.startsWith('en-')) {
                    languages.push({
                        name: language.name,
                        code: localLanguages[language.code] || language.code
                    })
                } else {
                    console.warn(`Skipping ${language.name} with ${language.translated_progress}% completion`)
                }
            }

            // Sort languages by Crowdin code
            languages.sort((a, b) => a.code.localeCompare(b.code));

            return languages;
        });
} else {
    console.warn("CROWDIN_API_KEY is not set; using local test languages");
    module.exports.getLanguages = () =>
        new Promise((resolve, reject) => {
            try {
                resolve(require('./test-languages'))
            } catch (err) {
                reject(err)
            }
        })
}
