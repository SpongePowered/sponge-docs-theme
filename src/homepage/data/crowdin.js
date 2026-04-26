const rp = require('request-promise-native');

const crowdinProjectId = process.env.CROWDIN_PROJECT_ID;
const crowdinToken = process.env.CROWDIN_TOKEN;
const crowdinBaseUrl = process.env.CROWDIN_BASE_URL || "https://crowdin.com";

const localLanguages = require('./languages');

const headers = {
    'Authorization': 'Bearer ' + crowdinToken,
    'Accept': 'application/json'
};

// Crowdin returns hyphenated locales (de-DE); Sphinx (and the URL routing on
// docs.spongepowered.org) uses underscored locales (de_DE). The flag SVGs in
// the theme are also named in underscored form (de_DE.svg).
function normalizeCode(crowdinId) {
    const mapped = localLanguages[crowdinId] || crowdinId;
    return mapped.replace('-', '_');
}

function compareLocales(a, b) {
    return a.code.localeCompare(b.code);
}

if (crowdinProjectId && crowdinToken) {
    const getBranchMappings = () =>
        rp({
            uri: `${crowdinBaseUrl}/api/v2/projects/${crowdinProjectId}/branches`,
            headers: headers,
            json: true
        }).then(resp => {
            const crowdinBranches = {};
            for (const branch of resp.data) {
                crowdinBranches[branch.data.name] = branch.data.id;
            }
            return crowdinBranches;
        });

    // Resolve the locales for each version by looking up the matching Crowdin
    // branch by `version.branch`. Versions whose branch is not present on
    // Crowdin fall back to English-only so the docs remain reachable.
    module.exports.getLocalesForVersions = (versions) =>
        getBranchMappings().then(branchIds => {
            return Promise.all(versions.map(version => {
                const crowdinBranchId = branchIds[version.branch];
                if (!crowdinBranchId) {
                    console.warn(`[${version.slug}] No Crowdin branch named '${version.branch}'; defaulting to English-only`);
                    return [{ code: 'en', name: 'English' }];
                }
                return rp({
                    uri: `${crowdinBaseUrl}/api/v2/projects/${crowdinProjectId}/branches/${crowdinBranchId}/languages/progress?limit=500`,
                    headers: headers,
                    json: true
                }).then(resp => {
                    const locales = [{ code: 'en', name: 'English' }];
                    for (const language of resp.data) {
                        // Include only languages with at least 5% progress
                        if (language.data.translationProgress >= 5 || language.data.languageId.startsWith('en-')) {
                            locales.push({
                                code: normalizeCode(language.data.languageId),
                                name: language.data.name
                            });
                        } else {
                            console.warn(`[${version.slug}] Skipping ${language.data.languageId} with ${language.data.translationProgress}% completion`);
                        }
                    }
                    locales.sort(compareLocales);
                    return locales;
                });
            }));
        });
} else {
    console.warn("CROWDIN_PROJECT_ID or CROWDIN_TOKEN is not set; using local test data");
    module.exports.getLocalesForVersions = (versions) =>
        new Promise((resolve, reject) => {
            try {
                const testData = require('./test-languages');
                resolve(versions.map(version => {
                    const entries = testData[version.branch] || testData[version.slug];
                    if (!entries) {
                        console.warn(`[${version.slug}] No test-languages entry for branch '${version.branch}'; defaulting to English-only`);
                        return [{ code: 'en', name: 'English' }];
                    }
                    // Accept either ["code"] or [{code, name}] in the test data.
                    return entries.map(e =>
                        typeof e === 'string' ? { code: e, name: e } : { code: e.code, name: e.name || e.code }
                    );
                }));
            } catch (err) {
                reject(err);
            }
        });
}
