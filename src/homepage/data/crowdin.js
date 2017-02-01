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
            uri: `https://api.crowdin.com/api/project/${projectIdentifier}/info`,
            qs: {
                key: crowdinApiKey,
                json: true
            },
            json: true
        }).then(resp => {
            const languages = [];

            for (language of resp.languages) {
                if (language.can_translate) {
                    languages.push({
                        name: language.name,
                        code: localLanguages[language.code] || language.code
                    })
                }
            }

            // Sort languages by Crowdin code
            languages.sort((a, b) => a.code.localeCompare(b.code));

            return languages;
        });
} else {
    console.warn("CROWDIN_API_KEY is not set; using local test languages")
    module.exports.getLanguages = () =>
        new Promise((resolve, reject) => {
            try {
                resolve(require('./test-languages'))
            } catch (err) {
                reject(err)
            }
        })
}
