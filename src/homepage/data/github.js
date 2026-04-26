const githubUser = process.env.GITHUB_USER;
const githubToken = process.env.GITHUB_TOKEN;

// Returns an array of { slug, branch, label } objects, sorted with the highest
// release first. `branch` is the literal GitHub (and Crowdin) branch name; it's
// used downstream to look up the matching Crowdin branch without any
// hardcoded version mapping.
function buildVersionEntry(branchName) {
    if (branchName === 'stable') {
        return { slug: 'stable', branch: 'stable', label: 'Stable' };
    }
    if (branchName.startsWith('release-')) {
        const apiVersion = branchName.substring('release-'.length);
        return { slug: branchName, branch: branchName, label: 'API ' + apiVersion };
    }
    return null;
}

function compareVersions(a, b) {
    // "stable" sorts first; "release-N" by numeric N descending.
    if (a.branch === 'stable') return -1;
    if (b.branch === 'stable') return 1;
    const numA = parseFloat(a.branch.substring('release-'.length));
    const numB = parseFloat(b.branch.substring('release-'.length));
    if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
    return a.branch.localeCompare(b.branch);
}

function sortVersions(versions) {
    return versions.slice().sort(compareVersions);
}

if (githubUser && githubToken) {
    const rp = require('request-promise-native');

    const githubOwner = 'SpongePowered';
    const githubRepo = 'SpongeDocs';

    module.exports.getVersions = () =>
        /* We only check branches here and not tags, because the old,
         * unmaintained versions, likely have different languages available than
         * the stable builds. This would result in broken links. */
        rp({
            url: `https://api.github.com/repos/${githubOwner}/${githubRepo}/branches`,
            headers: { 'User-Agent': 'SpongeDocsHomepage' },
            auth: { user: githubUser, pass: githubToken },
            json: true
        }).then(branches => {
            const versions = [];
            for (const branch of branches) {
                const entry = buildVersionEntry(branch.name);
                if (entry) versions.push(entry);
            }
            return sortVersions(versions);
        });

} else {
    console.warn("GITHUB_USER and GITHUB_TOKEN is not set; using local test versions");

    module.exports.getVersions = () =>
        new Promise((resolve, reject) => {
            try {
                const raw = require('./test-versions');
                const versions = [];
                for (const branchName of raw) {
                    const entry = buildVersionEntry(branchName);
                    if (entry) versions.push(entry);
                }
                resolve(sortVersions(versions));
            } catch (err) {
                reject(err);
            }
        });
}
