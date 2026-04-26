const github = require('./github');
const crowdin = require('./crowdin');

function pickDefault(versions) {
    // Prefer an explicit `stable` branch when present; otherwise the
    // highest release-N (which sortVersions already places first).
    const stable = versions.find(v => v.branch === 'stable');
    if (stable) return stable.slug;
    return versions[0] && versions[0].slug;
}

function buildManifest(versions, localesByIndex) {
    const enriched = versions.map((v, i) => ({
        slug: v.slug,
        label: v.label,
        branch: v.branch,
        locales: localesByIndex[i]
    }));
    return {
        default: pickDefault(enriched),
        versions: enriched
    };
}

module.exports.loadManifest = () =>
    github.getVersions().then(versions => {
        if (!versions.length) {
            throw new Error('No documentation versions found');
        }
        return crowdin.getLocalesForVersions(versions)
            .then(locales => buildManifest(versions, locales));
    });
