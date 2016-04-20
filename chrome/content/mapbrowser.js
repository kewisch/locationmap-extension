// Google Maps API Globals
var map;
var geocoder
var marker;
var currentLocation;
var localSearch;

// Will be filled by the calling chrome window
var prefs = {};

function initMap() {
  google.load('search', '1');

  var address = document.getElementById("address").getAttribute("value");

  localSearch = new google.search.LocalSearch();
  localSearch.setCenterPoint(prefs.defaultLocation);
  localSearch.setSearchCompleteCallback(this, showResults, null);
  localSearch.execute(address);

  //geocoder = new google.maps.Geocoder();
  //geocoder.geocode( { 'address': address }, showLocation);
}

function showResults() {
  if (localSearch.results && localSearch.results.length > 0) {
    var result = localSearch.results[0];


    // convert lat/lng to maps v3 object
    // call showLocation

    // possibly use maps control?
}

function showLocation(results, status) {
  if (status == google.maps.GeocoderStatus.OK) {
    showLocation.attemptStatus = showLocation.ATTEMPT_NONE;
    updateLocation({ latLng: results[0].geometry.location });

    updateMap();
    updateMarker();

  } else if (showLocation.attemptStatus == showLocation.ATTEMPT_NONE &&
             status == google.maps.GeocoderStatus.ZERO_RESULTS) {
    // If the location was not found in the first run, try searching for
    // the location and append the default location.
    showLocation.attemptStatus = showLocation.ATTEMPT_APPEND;
    var address = document.getElementById("address").getAttribute("value") +
                  " " + prefs.defaultLocation;
    geocoder.geocode({ 'address': address}, showLocation);
  } else if (showLocation.attemptStatus == showLocation.ATTEMPT_APPEND &&
             status == google.maps.GeocoderStatus.ZERO_RESULTS) {
    // Appending the default location didn't bring any results, fall back to
    // just the default location
    showLocation.attemptStatus = showLocation.ATTEMPT_DEFAULT;
    var address = prefs.defaultLocation;
    geocoder.geocode({ 'address': address}, showLocation);
  } else {
    showLocation.attemptStatus = showLocation.ATTEMPT_NONE;
    alert("Geocode was not successful for the following reason: " + status);
  }
}
showLocation.ATTEMPT_NONE = 0;
showLocation.ATTEMPT_APPEND = 1;
showLocation.ATTEMPT_DEFAULT = 2;
showLocation.attemptStatus = showLocation.ATTEMPT_NONE;

function updateMap() {
  if (!map) {
    map = new google.maps.Map(document.getElementById("map_canvas"), {
      center: currentLocation,
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
  } else {
    map.setCenter(currentLocation);
  }
}

function updateMarker() {
  if (!marker) {
    marker = new google.maps.Marker({
      map: map, 
      position: currentLocation,
      draggable: true
    });
    var infoWindow = new google.maps.InfoWindow({
      content: document.getElementById("map_info"),
    });
    function openClick(e) {
      infoWindow.setPosition(e.latLng);
      infoWindow.open(map, marker);
    }
    google.maps.event.addListener(marker, 'click', openClick);
    google.maps.event.addListener(marker, 'dragend', updateLocation);

    openClick({ latLng: currentLocation });
  } else {
    marker.setPosition(currentLocation);
  }
}

function updateLocation(e) {
  currentLocation = e.latLng;
  geocoder.geocode({ location: currentLocation }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var addressNode = document.getElementById("address");
      var address = results[0].formatted_address;

      addressNode.setAttribute("value", address);
      document.getElementById("map_info_address").textContent = address;
    }
  });
}

function useLocation() {
  var addressNode = document.getElementById("address");

  var event = document.createEvent("Events");
  event.initEvent("getlocation", true, false);
  addressNode.dispatchEvent(event);
}
