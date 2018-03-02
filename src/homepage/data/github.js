const githubUser = process.env.GITHUB_USER;
const githubToken = process.env.GITHUB_TOKEN;

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
            headers: {
                'User-Agent': 'SpongeDocsHomepage'
            },
            auth: {
                user: githubUser,
                pass: githubToken
            },
            json: true
        }).then(branches => {
            const versions = [];

            for (branch of branches) {
                if (branch.name === 'stable') {
                    versions.push('stable');
                } else if (branch.name.startsWith('release-')) {
                    versions.push(branch.name.substring(8))
                }
            }

            // Sort versions in reversed order
            versions.sort().reverse();

            return versions;
        });
} else {
    console.warn("GITHUB_USER and GITHUB_TOKEN is not set; using local test versions");

    module.exports.getVersions = () =>
        new Promise((resolve, reject) => {
            try {
                resolve(require('./test-versions'))
            } catch (err) {
                reject(err)
            }
        })
}
