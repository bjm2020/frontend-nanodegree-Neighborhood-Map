var initialLocations = [
  {
    "name": "Visitor Center",
    "street": "799 Jean Lafitte Blvd.",
    "city": "Lafitte, LA"
  },
  {
    "name": "Jean Lafitte National Historic Park and Preserve",
    "street": "6558 Barataria Blvd.",
    "city": "Marrero, LA"
  },
  {
    "name": "Wetland Trace",
    "street": "4924 City Park Street",
    "city": "Lafitte, LA"
  },
  {
    "name": "Lafitte's Barataria Museum",
    "street": "4917 City Park Drive",
    "city": "Lafitte, LA"
  },
  {
    "name": "Airboat Adventures",
    "street": "5145 Fleming Park Road",
    "city": "Lafitte, LA"
  }
];

var Location = function(data) {
  this.name = ko.observable(data.name);
  this.city = ko.observable(data.city);
  this.street = ko.observable(data.street);
//  this.description = data.description;

  this.address = this.street + " " + this.city;

//console.log(this.address());
//  this.location = null;//getlnglat(this.address());
//  console.log(this.address());
};

  var ViewModel = function() {
     var self = this;

  this.locationlist = ko.observableArray([]);
  initialLocations.forEach(function(locationData){
  self.locationlist.push(new Location(locationData));
  });
this.currentLocation = ko.observable(this.locationlist()[0]);
//console.log(console.log(this.locationlist()[1]));

this.setLocation = function() {
  //TODO: do something with location
  console.log("setLoc");
};
};

ko.applyBindings(new ViewModel());

var map;
var markers = [];


//var marker;

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13
  });

  var infowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();

  initialLocations.forEach(function(locationData) {
    //console.log(locationData);
  //  locationData.location = getlnglat(locationData.address);
    //console.log(locationData.location);
  //  console.log(locationData.address);

//getLatLong(locationData.street + " " + locationData.city);
//console.log(geoLocation);


function getLatLong(address) {
//  console.log('start');
  var geocoder = new google.maps.Geocoder();
  //  var address = document.getElementById('address').value;
    geocoder.geocode( {'address': address}, function(results, status) {
      console.log(results);
     console.log(status);
      if (status == 'OK') {

        var marker = new google.maps.Marker({
          position: results[0].geometry.location,
          map: map,
          title: locationData.name,
          id: initialLocations.indexOf(locationData)
        });
        markers.push(marker);
        bounds.extend(marker.position);

        marker.addListener('click', function() {
          populateInfoWindow(this, infowindow, locationData.name);
        });
    //    console.log('hello');
        //  callback(results[0].geometry.location);
          //console.log(geoLocation);
        //return results[0].geometry.location[0];
      //  var marker = new google.maps.Marker({
      //      map: map,
      //      position: results[0].geometry.location
      //  });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

getLatLong(locationData.street + " " + locationData.city);
  //while(geoLocation === undefined){

//  }
//  setMarker(locationData.street + " " + locationData.city,locationData.name);



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

function getLatLong(address,callback) {
//  console.log('start');
  var geocoder = new google.maps.Geocoder();
  //  var address = document.getElementById('address').value;
    geocoder.geocode( {'address': address}, function(results, status) {
    //  console.log(results);
    //  console.log(status);
      if (status == 'OK') {

          callback(results[0].geometry.location);
    //    console.log('hello');
        //  callback(results[0].geometry.location);
          //console.log(geoLocation);
        //return results[0].geometry.location[0];
      //  var marker = new google.maps.Marker({
      //      map: map,
      //      position: results[0].geometry.location
      //  });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }


/*
function getlnglat(address) {
  console.log("first");
  var geocoder = new google.maps.Geocoder();
//  initialLocations.forEach(function(locationData) {
//    var address = locationData.street + " " + locationData.city;

    geocoder.geocode(
      {address: address},
      function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          return results[0].geometry.location;
          //TODO: Enter code to return location
        }
        else {
          console.log('We could not find that location ' + address);
        }
      })
    }
*/
