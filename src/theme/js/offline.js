(function() {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) return;
    
    class OfflineModeSwitcher {
        constructor() {
            // Check if we have a ZIP download available (only in the production build)
            const offline = $('#offline');
            if (!offline.length) return;

            // Append link to indicate that Offline Mode is available
            offline.append(
                $('<dd>').append(
                    this.switch = $('<a>').click(() => this.toggleState())
                )
            );

            // Create message element
            this.message = $('<div>').addClass('wy-alert');
            this.message
                .append(
                    $('<div>').addClass('wy-alert-title').text(_("Offline Mode"))
                        .append(
                            $('<a>').addClass('fa').addClass('fa-close').click(() => this.message.fadeOut())
                        )
                )
                .append(this.message.text = $('<p>'))
                .hide();

            // Add message element to document
            $('div[role=main]').before(this.message);

            // Update registration when ready
            navigator.serviceWorker.ready.then(registration => this.registration = registration);

            this.updateState(navigator.serviceWorker.controller);
            navigator.serviceWorker.addEventListener('controllerchange',
                () => this.updateState(navigator.serviceWorker.controller))
        }

        showMessage(message, type) {
            this.message.type && this.message.removeClass(this.message.type);
            if (type) {
                type = `wy-alert-${type}`;
                this.message.addClass(type);
                this.message.type = type;
            }

            this.message.text.text(message);
            this.message.show();

            // Scroll to the top of the page
            $(window).scrollTop(0);
            // Close side navigation
            $('[data-toggle=wy-nav-shift]').removeClass("shift");
            $('[data-toggle=rst-versions]').removeClass("shift");

            return this.message.text
        }

        showError() {
            this.showMessage(_("Failed to enable offline mode. Please try again later."), 'danger')
        }

        toggleState() {
            if (this.state) {
                if (confirm(_("Disable Offline Mode?") + '\n\n' +
                        _("Offline Mode will be unavailable until you download the full documentation again."))) {

                    // Unregister service worker
                    if (this.registration) {
                        this.registration.unregister()
                            .then(() => this.updateState());
                    } else {
                        // Normally, ready should always fire to set the registration but sometimes it doesn't.
                        this.registration = navigator.serviceWorker.getRegistration(DOCUMENTATION_OPTIONS.URL_ROOT)
                            .then(registration => registration.unregister())
                            .then(() => this.updateState())
                    }
                }
            } else if (confirm(_("Enable Offline Mode?") + '\n\n' +
                    _("When enabled, we will download the full documentation (about 5 MB) " +
                        "and store it locally on your device. " +
                        "You won't get any updates until you switch to online mode again."))) {

                this.showMessage(_("Downloading documentation..."));

                // Register service worker
                navigator.serviceWorker.register(DOCUMENTATION_OPTIONS.URL_ROOT + 'worker.js')
                    .then(registration => {
                        this.registration = registration;
                        const worker = registration.installing || registration.waiting || registration.active;
                        worker.addEventListener('statechange', (event) => {
                            if (event.target.state === 'redundant') {
                                // Error during installation
                                this.showError();
                                this.registration = null;
                            }
                        })
                    })
                    .catch(() => this.showError())
            }
        }

        updateState(state) {
            this.state = Boolean(state);
            if (this.state) {
                this.switch.text(_("Disable Offline Mode")).addClass('current');
                this.showMessage(_("You are reading the cached, offline version of the documentation. " +
                    "Disable offline mode to update it with the latest changes."), 'success')
                    .append(
                        $('<a>').text(' ' + _("Disable Offline Mode")).click(() => this.toggleState())
                    )
            } else {
                this.registration = null;
                this.switch.text(_("Offline Mode")).removeClass('current');
                this.message.filter(':visible').fadeOut();
            }
        }
    }

    // Initialize
    $(() => new OfflineModeSwitcher());
})();
