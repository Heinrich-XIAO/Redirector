//// $Id$

var Redirector = Components.classes["@einaregilsson.com/redirector;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;

function $(id) {
    return document.getElementById(id);
}

var RedirectorOverlay = {

    id          : "redirector@einaregilsson.com",
    name        : "Redirector",
    initialized : false,
    strings     : null,

    onLoad : function(event) {
        try {

            // initialization code
            Redirector.debug("Initializing...");
            $('contentAreaContextMenu')
                .addEventListener("popupshowing", function(e) { RedirectorOverlay.showContextMenu(e); }, false);
            
            if (!Redirector.getBoolPref('showContextMenu')) {
                $('redirector-context').hidden = true;
            }
            if (!Redirector.getBoolPref('showStatusBarIcon')) {
                $('redirector-status').hidden = true;
            }
            this.strings = document.getElementById("redirector-strings");
            this.prefObserver.register();
            this.setStatusBarImg();

            Redirector.debug("Finished initialization");
            this.initialized = true;

        } catch(e) {
            if (this.strings) {
                alert(this.strings.getFormattedString("initError", [this.name]) + "\n\n" + e);
            } else {
                alert(e);
            }
        }
    },
    
    onUnload : function(event) {
        RedirectorOverlay.prefObserver.unregister();
        Redirector.debug("Finished cleanup");
    },

    showContextMenu : function(event) {
        if (gContextMenu.onLink) {
            $("redirector-context").label = this.strings.getString('addLinkUrl');
        } else {
            $("redirector-context").label = this.strings.getString('addCurrentUrl');
        }
    },

    onContextMenuCommand: function(event) {

        var item = { exampleUrl : window.content.location.href, pattern: window.content.location.href};
        if (gContextMenu.onLink) {
            item.redirectUrl = gContextMenu.link.toString();
        }

        window.openDialog("chrome://redirector/content/redirect.xul",
                    "redirect",
                    "chrome,dialog,modal,centerscreen", item);

        if (item.saved) {
            Redirector.addRedirect(item);
        }
    },

    onMenuItemCommand: function(event) {
        this.openSettings();
    },

    toggleEnabled : function(event) {
        Redirector.setEnabled(!Redirector.enabled);
    },

    openSettings : function() {
        var windowName = "redirectorSettings";
        var windowsMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
        var win = windowsMediator.getMostRecentWindow(windowName);
        if (win) {
            win.focus();
        } else {
            window.openDialog("chrome://redirector/content/redirectList.xul",
                    windowName,
                    "chrome,dialog,resizable=no,centerscreen", this);
        }
    
    },
    
    statusBarClick : function(event) {
        var LEFT = 0, RIGHT = 2;

        if (event.button == LEFT) {
            RedirectorOverlay.toggleEnabled();
        } else if (event.button == RIGHT) {
            this.openSettings();
            //$('redirector-status-popup').showPopup();
        }
    },

    setStatusBarImg : function() {
        var statusImg = $('redirector-statusbar-img');

        if (Redirector.enabled) {
            statusImg.src = 'chrome://redirector/content/statusactive.PNG'
            statusImg.setAttribute('tooltiptext', this.strings.getString('enabledTooltip'));
        } else {
            statusImg.src = 'chrome://redirector/content/statusinactive.PNG'
            statusImg.setAttribute('tooltiptext', this.strings.getString('disabledTooltip'));
        }
    },
    
    

    prefObserver : {

        getService : function() {
            return Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranchInternal);
        },

        register: function() {
            this.getService().addObserver('extensions.redirector', this, false);
        },

        unregister: function() {
            this.getService().removeObserver('extensions.redirector', this);
        },

        observe : function(subject, topic, data) {
            if (topic == 'nsPref:changed' && data == 'extensions.redirector.enabled') {
                RedirectorOverlay.setStatusBarImg();
            }
        }

    }


};
window.addEventListener("load", function(event) { RedirectorOverlay.onLoad(event); }, false);
window.addEventListener("DOMContentLoaded", function(event) { RedirectorOverlay.onDOMContentLoaded(event); }, true);
window.addEventListener("unload", function(event) { RedirectorOverlay.onUnload(event); }, false);