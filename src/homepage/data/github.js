const rp = require('request-promise-native');

function prepareAuthentication(user, pass) {
    if (user && pass) {
        return {user, pass}
    } else {
        console.warn("GITHUB_USER and GITHUB_TOKEN is not set; using unauthenticated requests")
    }
}

const auth = prepareAuthentication(process.env.GITHUB_USER, process.env.GITHUB_TOKEN);

const githubOwner = 'SpongePowered';
const githubRepo = 'SpongeDocs';

module.exports.getVersions = () =>
    rp({
        url: `https://api.github.com/repos/${githubOwner}/${githubRepo}/branches`,
        headers: {
            'User-Agent': 'SpongeDocsHomepage'
        },
        auth,
        json: true
    }).then(branches => {
        const versions = [];

        for (branch of branches) {
            // TEMP
            branch.name = branch.name.replace('master', 'stable').replace('/', '-');

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
