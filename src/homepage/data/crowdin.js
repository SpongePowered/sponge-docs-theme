const rp = require('request-promise-native');
const github = require('./github');

const crowdinProjectId = process.env.CROWDIN_PROJECT_ID;
const crowdinToken = process.env.CROWDIN_TOKEN;

const localLanguages = require('./languages');

const headers = {
    'Authorization': 'Bearer ' + crowdinToken,
    'Accept': 'application/json'
};

module.exports.getLocaleMappings = () =>
    rp({
        uri: 'https://api.crowdin.com/api/v2/languages?limit=500',
        headers: {
            'Accept': 'application/json'
        },
        json: true
    }).then((resp) => {
        const result = {};

        for (language of resp.data) {
            const id = localLanguages[language.data.id] || language.data.id;
            result[id] = {};
            result[id]['name'] = language.data.name;
            result[id]['locale'] = language.data.locale;
        }
        return result;
    });

if (crowdinProjectId && crowdinToken) {
    getBranchMappings = () => new Promise((resolve, reject) => {
        let crowdinBranches =  {};
        rp({
            uri: `https://api.crowdin.com/api/v2/projects/${crowdinProjectId}/branches`,
            headers: headers,
            json: true
        }).then((resp) => {
            for (branch of resp.data) {
                crowdinBranches[branch.data.name] = branch.data.id;
            }
            resolve(crowdinBranches);
        }).catch(err => reject(err))
    })

    module.exports.getLanguages = () => new Promise((resolve, reject) => {
        Promise.all([github.getVersions(), getBranchMappings()]).then((result) => {
            let languages = {};

            let promises = [];

            result[0].forEach(version => {
                promises.push(rp({
                    uri: `https://api.crowdin.com/api/v2/projects/${crowdinProjectId}/branches/${result[1][version]}/languages/progress`,
                    headers: headers,
                    json: true
                }).then(resp => {
                    languages[version] = [];

                    for (language of resp.data) {
                        // Include only languages with at least 5% progress
                        if (language.data.translationProgress >= 5 || language.data.languageId.startsWith('en-')) {
                            languages[version].push({
                                id: localLanguages[language.data.languageId] || language.data.languageId
                            })
                        } else {
                            console.warn(`[${version}] Skipping ${language.data.languageId} with ${language.data.translationProgress}% completion`)
                        }
                    }

                    // Sort languages by language id
                    languages[version].sort((a, b) => a.id.localeCompare(b.id));
                }))
            })

            Promise.all(promises).then(() => {
                resolve(languages);
            }).catch(err => reject(err))
        });
    })
} else {
    console.warn("CROWDIN_PROJECT_ID or CROWDIN_TOKEN is not set; using local test data");
    module.exports.getLanguages = () =>
        new Promise((resolve, reject) => {
            try {
                resolve(require('./test-languages'))
            } catch (err) {
                reject(err)
            }
        })
}
