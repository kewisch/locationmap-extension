var locationMap = { 
  initMap: function initLocationMap(addressNode, attachNode) {
    let browser = document.getElementById("map-browser");
    let browserPanel = document.getElementById("map-browser-panel");

    browser.addEventListener("DOMContentLoaded", function(e) {
      let doc = e.target;
      let win = doc.defaultView;


      win.prefs = {
        defaultLocation: locationMap.getLocationMapPref("defaultLocation")
      };
      
      // Send address to page and dispatch the location event
      doc.getElementById("address").setAttribute("value", addressNode.value); 
      let event = doc.createEvent("Events");
      event.initEvent("setlocation", true, false);
      doc.body.dispatchEvent(event);

      // Attach the panel to the given node
      if (attachNode && browserPanel) {
        browserPanel.openPopup(attachNode, "after_start");
      }

      // Listen to events from the window
      doc.addEventListener("getlocation", function(e) {
        addressNode.value = e.target.getAttribute("value");
        window.close();
      }, true);
    }, true);
    browser.loadURI("chrome://locationmap/content/mapbrowser.html");
  },

  initMapWindow: function initMapWindow() {
    this.initMap(window.arguments[0]);
  },

  openMapWindow: function openMapWindow(addressNode, attachNode) {
    const wnd_uri = "chrome://locationmap/content/locationmap.xul";
    let nodeWindow = attachNode.ownerDocument.defaultView;
    
    let top = attachNode.boxObject.y + (2 * attachNode.boxObject.height) + nodeWindow.screenY;
    let left = attachNode.boxObject.x + nodeWindow.screenX;
    let size = attachNode.boxObject.width;
    let features = ["left=" + left,
                    "top=" +  top,
                    "height=" + size,
                    "width=" + size,
                    "dialog=yes",
                    "dependent=yes",
                    "chrome=yes"].join(",");
    
    let wnd = window.openDialog(wnd_uri, "locationmap", features, addressNode);
    wnd.focus();
  },

  getLocationMapPref: function getPref(aKey, aDefault) {
    let prefName = "extensions.locationmap."  + aKey;
    return this.getPrefSafe(prefName, aDefault);
  },

  /**
   * This code is borrowed from the Mozilla Calendar Project
   * 
   * Normal get*Pref calls will throw if the pref is undefined.  This function
   * will get a bool, int, or string pref.  If the pref is undefined, it will
   * return aDefault.
   *
   * @param aPrefName   the (full) name of preference to get
   * @param aDefault    (optional) the value to return if the pref is undefined
   */
  getPrefSafe: function getPrefSafe(aPrefName, aDefault) {
      const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
      const prefB = Components.classes["@mozilla.org/preferences-service;1"]
                              .getService(nsIPrefBranch);
      // Since bug 193332 does not fix the current branch, calling get*Pref will
      // throw NS_ERROR_UNEXPECTED if clearUserPref() was called and there is no
      // default value. To work around that, catch the exception.
      try {
          switch (prefB.getPrefType(aPrefName)) {
              case nsIPrefBranch.PREF_BOOL:
                  return prefB.getBoolPref(aPrefName);
              case nsIPrefBranch.PREF_INT:
                  return prefB.getIntPref(aPrefName);
              case nsIPrefBranch.PREF_STRING:
                  return prefB.getCharPref(aPrefName);
              default: // includes nsIPrefBranch.PREF_INVALID
                  return aDefault;
          }
      } catch (e) {
          return aDefault;
      }
  }
};
