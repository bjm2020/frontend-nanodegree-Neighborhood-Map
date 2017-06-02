var Location = function(data) {
  this.name = ko.observable(data.name);
  this.city = ko.observable(data.city);
  this.street = ko.observable(data.street);
  this.category = ko.observable(data.category);
  this.categoryID = data.categoryID;
  this.foursquareID = data.foursqureID;
  this.iconLink =  data.iconLink;
  this.location = data.location;

  this.markerID = 0;

  this.address = this.street + " " + this.city;

};

var locationList = ko.observableArray([]);



  var ViewModel = function() {
     var self = this;


getFourSquareLocations();

this.currentLocation = ko.observable(locationList()[0]);


//Stores Value of Drop Down List Category Filter.
this.selectedCategory = ko.observable();

//Filter Locations to retrieve just categories
self.justCategories = ko.computed(function() {
  var categories = ko.utils.arrayMap(locationList(), function(location) {
    return location.category();
  });
  return categories.sort();
}, this);

//Filter JustCategories to retrieve only Unique Values:
//Populates unique categories in Drop Down Filter List.

self.uniqueCategories = ko.dependentObservable(function() {
  return ko.utils.arrayGetDistinctValues(self.justCategories()).sort();
});

this.filteredLocations = ko.computed(function() {
  if(typeof self.selectedCategory()  === 'undefined')  {
    return locationList();
  }
  return ko.utils.arrayFilter(locationList(), function(location) {
    return location.category() == self.selectedCategory();
  })
});

//Show and Hide Map Markers based on selected category

this.selectionChanged = function() {

  if("undefined" === typeof this.selectedCategory()) {

    showLocations();
  }
  else {
  showLocations();
  hideLocations(this.selectedCategory());
}
}


this.setLocation = function() {
  //TODO: do something with location
  if(typeof self.currentLocation() === "undefined") {
    self.currentLocation(locationList()[0]);
  }
else {
  for(var i=0; i < locationList().length;i++){
    if(locationList[i].name === ){
      self.currentLocation(locationList()[i]);
    }
  }
}
  for(var i=0;i<markers.length;i++){
    console.log(self.currentLocation().markerID);
    if(markers[i].id === self.currentLocation().marker);
      google.maps.event.trigger(markers[i], 'click');
  }
  console.log("setLoc");
};
};

ko.applyBindings(new ViewModel());
console.log(locationList().length);

function getFourSquareLocations() {
var clientID = "PGZR20FMKL3MDGHKVNZFGE1N5AK02NPUCUIVQ5YFALGYSV1M";
var clientSecret = "5LM1W4RDO2BUO24UFCLDEXFQM0DJULOMDVTRAWXC1PMSRGQQ";
var latlong = "29.739263,-90.126625"; //local town (Jean Lafitte) lat Lng coordinates
console.log("begin foursquare data");
var foursquareUrl = "https://api.foursquare.com/v2/venues/search?ll="+latlong+'&client_id='+clientID+'&client_secret='+clientSecret+'&v=20160108';

  $.ajax({
    url: foursquareUrl,
    dataType: "json",
    success: function(data) {
      var venues = data.response.venues;
      for (var i = 0; i < venues.length; i++) {
        var venue = venues[i];

      var venueData = {
        name: venue.name,
        street: venue.location.address,
        city: venue.location.city,
        category: venue.categories[0].name,
        categoryID: venue.categories[0].id,
        foursquareID: venue.id,
        location: {lat: venue.location.lat, lng: venue.location.lng},
        iconLink: venue.categories[0].icon.prefix+"bg_32"+venue.categories[0].icon.suffix
      }

      locationList.push(new Location(venueData));

      }
      startApp();

    }
  });
}

var map;
var markers = [];
var bounds;

function initMap() {
  // Constructor creates a new map - only center and zoom are required.

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13
  });

  var infowindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();
for(var i = 0; i < locationList().length; i++){
  var marker = new google.maps.Marker({
    position: locationList()[i].location,
    map: map,
    title: locationList()[i].name(),
    id: i,
   icon: locationList()[i].iconLink
  });

  locationList()[i].markerID = marker.id;


  markers.push(marker);
  bounds.extend(marker.position);

  var name = locationList()[i].name();

  marker.addListener('click', function() {

    var html = "<div id='content holder'><div id = 'picture'></div><div id = 'info'><div id = 'venue'></div></div><div id = 'review'></div></div>";

    populateInfoWindow(this, infowindow, this.title);
  });

}

map.fitBounds(bounds);



function getLatLong(address) {
//  console.log('start');
  var geocoder = new google.maps.Geocoder();
    geocoder.geocode( {'address': address}, function(results, status) {

      if (status == 'OK') {

        var marker = new google.maps.Marker({
          position: results[0].geometry.location,
          map: map,
          title: locationData.name,
          id: initialLocations.indexOf(locationData)
        });
        markers.push(marker);
        bounds.extend(results[0].geometry.location);
        marker.addListener('click', function() {
          populateInfoWindow(this, infowindow, this.title);
        });

        map.fitBounds(bounds);

      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });

  }


  document.getElementById('show-listings').addEventListener('click', showLocations);
  document.getElementById('hide-listings').addEventListener('click', hideLocations);


}


function populateInfoWindow(marker, infowindow, content) {

  if(infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent($('#info-window').html());
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

function hideLocations(id) {

  for (var i = 0; i < markers.length; i++) {
  if(markers[i].id !== id)
    markers[i].setMap(null);
  }
}



function startApp() {

  initMap();

}
