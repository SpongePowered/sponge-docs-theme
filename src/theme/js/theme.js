// Default theme: Original light theme by sphinx_rtd_theme
// For all other themes we apply an additional CSS class to all .highlight
// elements. The class is specified in the 'data-theme' attribute of the
// link (defined in versions.html).
const THEMES = [
    {name: _("Light")},
    {name: _("Dark"), id: 'tomorrow-night'}
];

THEMES.find = (id) => {
    if (id) for (let theme of THEMES) {
        if (theme.id === id) {
            return theme
        }
    }
};

class CodeThemeSwitcher {
    constructor() {
        const themes = $('<dl>').append($('<dt>').text(_("Code theme")));
        for (let theme of THEMES) {
            themes.append(
                $('<dd>').append(
                    theme.switch = $('<a>').text(theme.name).click(() => this.apply(theme))
                )
            )
        }

        // Create code theme selector
        $('#versions').append(themes);

        // Apply currently configured theme
        this.apply(THEMES.find(localStorage['code-theme']) || THEMES[0])
    }

    apply(theme) {
        if (this.currentTheme == theme) {
            return; // Nothing to do
        }

        if (this.currentTheme) {
            // Disable current theme
            this.currentTheme.id && $('.highlight').removeClass(this.currentTheme.id);
            this.currentTheme.switch.removeClass('current')
        }

        // Set new theme
        if (theme.id) {
            localStorage['code-theme'] = theme.id;

            // Enable new theme
            $('.highlight').addClass(theme.id);
        } else {
            delete localStorage['code-theme']
        }

        // Mark new theme as current
        theme.switch.addClass('current');
        this.currentTheme = theme;
    }
}

// Initialize
$(() => new CodeThemeSwitcher());
