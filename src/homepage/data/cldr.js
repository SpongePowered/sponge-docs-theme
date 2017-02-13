const Cldr = require('cldrjs');

Cldr.load(require('cldr-core/supplemental/likelySubtags'));

// Load all bundles
for (locale of require('cldr-core/availableLocales').availableLocales.modern) {
    Cldr.load(require(`cldr-localenames-modern/main/${locale}/languages`))
}

function toTitleCase(s) {
    return s.replace(/[^\s]+/g, word =>
        word.replace(/^./, first => first.toUpperCase()))
}

module.exports.getDisplayName = (languageCode, localeCode) => {
    const locale = new Cldr(localeCode);
    if (!locale.attributes.bundle) {
        // No bundle available so there is no display name in the target language itself
        return null;
    }

    return toTitleCase(locale.main(`localeDisplayNames/languages/${languageCode}`)
        || locale.main('localeDisplayNames/languages/{bundle}'));
};
