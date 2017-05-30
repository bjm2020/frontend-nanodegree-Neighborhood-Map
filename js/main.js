var Location = function(data) {
  this.name = ko.observable(data.name);
  this.city = ko.observable(data.city);
  this.street = ko.observable(data.street);
//  this.description = data.description;

  this.address = ko.computed(function() {
    return data.street + " " + data.city;
  },this);

  this.location = getlnglat(this.address);
};

var initialLocations = [
  new Location({
    "name": "Visitor Center",
    "street": "799 Jean Lafitte Blvd.",
    "city": "Lafitte, LA"
  }),
  new Location({
    "name": "Swamp Tour 2",
    "street": "1037 Jean Lafitte Blvd.",
    "city": "Lafitte, LA"
  }),
  new Location({
    "name": "Swamp Tour 3",
    "street": "1037 Jean Lafitte Blvd.",
    "city": "Lafitte, LA"
  }),
  new Location({
    "name": "Swamp Tour 4",
    "street": "1037 Jean Lafitte Blvd.",
    "city": "Lafitte, LA"
  }),
  new Location({
    "name": "Swamp Tour 5",
    "street": "1037 Jean Lafitte Blvd.",
    "city": "Lafitte, LA"
  })
];
var ViewModel = function() {
  var self = this;

  this.locationlist = ko.observableArray([]);
  initialLocations.forEach(function(locationData){
  self.locationlist.push(new Location(locationData));
  });
this.currentLocation = ko.observable(this.locationlist()[0]);
console.log(console.log(this.locationlist()[1]));

this.setLocation = function() {
  //TODO: do something with location
  console.log("setLoc");
};
};
ko.applyBindings(new ViewModel());

var map;
var markers = [];

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13
  });

  var infowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();

  initialLocations.forEach(function(locationData) {

    var latlng = {lat: locationData.lat, lng: locationData.lng};
    var tit = locationData.name;

    var marker = new google.maps.Marker({
      position: latlng,
      map: map,
      title: locationData.name,
      id: initialLocations.indexOf(locationData)
    });
    markers.push(marker);
    bounds.extend(marker.position);

    marker.addListener('click', function() {
      populateInfoWindow(this, infowindow, locationData.name);
    });
  });
  map.fitBounds(bounds);

  document.getElementById('show-listings').addEventListener('click', showLocations);
  document.getElementById('hide-listings').addEventListener('click', hideLocations);
}

function populateInfoWindow(marker, infowindow, content) {
  if(infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent(content);
    infowindow.open(map, marker);

    infowindow.addListener('closeclick', function() {
      infowindow.setMarker(null);
    });
  }
}

function showLocations() {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

function hideLocations() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

function getlnglat(address) {
  var geocoder = new google.maps.Geocoder();
//  initialLocations.forEach(function(locationData) {
//    var address = locationData.street + " " + locationData.city;
    geocoder.geocode(
      {address: address,
        componentRestrictions: {locality: 'Lafitte'
      }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          return results[0].geometry.location;
          //TODO: Enter code to return location
        }
        else {
          console.log('We could not find that location' + address);
        }
      }
    });
  });
}
