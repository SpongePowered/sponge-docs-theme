$(() => {
    // Default theme: Original light theme by sphinx_rtd_theme
    // For all other themes we apply an additional CSS class to all .highlight
    // elements. The class is specified in the 'data-theme' attribute of the
    // link (defined in versions.html).

    function toggleTheme(theme, enable) {
        if (theme) {
            $(`.code-theme-link[data-theme=${theme}]`).toggleClass('current', enable);
            $('.highlight').toggleClass(theme, enable)
        } else {
            $('.code-theme-link:not([data-theme])').toggleClass('current', enable)
        }
    }

    // Apply the theme that was selected the last time (saved in local storage)
    let currentTheme = localStorage.getItem('code-theme');
    toggleTheme(currentTheme, true);

    $('.code-theme-link').click(function() {
        const theme = $(this).data('theme');
        if (theme != currentTheme) {

            // If the theme has changed, disable the old theme
            // and apply the new one
            toggleTheme(currentTheme, false);
            currentTheme = theme;
            toggleTheme(theme, true);

            // Update locally stored theme
            if (theme) {
                localStorage.setItem('code-theme', theme);
            } else {
                localStorage.removeItem('code-theme')
            }
        }
    })
});
