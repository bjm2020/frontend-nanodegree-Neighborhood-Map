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
  this.category = ko.observable(data.category);
  this.foursquareID = data.foursqureID;
  this.iconLink =  data.iconLink;
  this.location = data.location;
//  this.description = data.description;

  this.address = this.street + " " + this.city;

//console.log(this.address());
//  this.location = null;//getlnglat(this.address());
//  console.log(this.address());
};

var locationList = ko.observableArray([]);



  var ViewModel = function() {
     var self = this;

//  this.locationlist = ko.observableArray([]);

getFourSquareLocations();

    /*
    $.getJSON(foursquareUrl, function(data) {
      //$nytHeaderElem.text('New York Times Articles About' + city);

      var venues = data.response.venues;
      for (var i = 0; i < venues.length; i++) {
        var venue = venues[i];
        self.locationList.push(new Location({
          name: venue.name,
          street: venue.location.address,
          city: venue.address.city,
          category: venue.categories[0].pluralName,
          foursquareID: venue.id,
          location: {lat: venue.location.lat, lng: venue.location.lng},
          iconLink: venue.categories[0].icon.prefix+"32"+vendor.categories[0].icon.suffix
        }
        ))
      }
    }).error(function(e) {
      console.log('Error');
    }); //error
*/
  //} //end function

  //getFourSquareLocations();
//  initialLocations.forEach(function(locationData){
//  self.locationlist.push(new Location(locationData));
//  });
this.currentLocation = ko.observable(locationList[0]);
//console.log(console.log(this.locationlist()[1]));

this.setLocation = function() {
  //TODO: do something with location
  console.log("setLoc");
};
};

ko.applyBindings(new ViewModel());





//var marker;
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
        console.log(venue.name+venue.location.address+venue.location.city+venue.categories[0].name+venue.id+venue.location.lat+venue.location.lng);
      //  console.log(venue.location.city);
      var venueData = {
        name: venue.name,
        street: venue.location.address,
        city: venue.location.city,
        category: venue.categories[0].name,
        foursquareID: venue.id,
        location: {lat: venue.location.lat, lng: venue.location.lng},
        iconLink: venue.categories[0].icon.prefix+"bg_32"+venue.categories[0].icon.suffix
      }
      console.log("Venue Data:" + venueData);

      locationList.push(new Location(venueData));

      console.log("After Push:" + locationList);
/*
        locationList.push(new Location({
          name: venue.name,
          street: venue.location.address,
          city: venue.location.city,
          category: venue.categories[0].name,
          foursquareID: venue.id,
          location: {lat: venue.location.lat, lng: venue.location.lng},
          iconLink: venue.categories[0].icon.prefix+"32"+venue.categories[0].icon.suffix
        })); */

console.log(locationList[i]);


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
  console.log("init map");
  var infowindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();
console.log(locationList().length);
console.log("Object:" + locationList()[0].location);
console.log(locationList()[1].name);
console.log(typeof locationList()[1]);
for(var i = 0; i < locationList().length; i++){
  var marker = new google.maps.Marker({
    position: locationList()[i].location,
    map: map,
    title: locationList()[i].name(),
    id: locationList().indexOf(locationList[i]),
    icon: locationList()[i].iconLink
  });
  console.log("marker created");
  markers.push(marker);
  bounds.extend(marker.position);
  console.log("extended");
  //console.log(bounds);
  console.log(i);
  var name = locationList()[i].name();
  console.log(name);
  marker.addListener('click', function() {
    console.log("listener");
    populateInfoWindow(this, infowindow, this.title)
  });

}

map.fitBounds(bounds);
console.log("fitbounds");
//  initialLocations.forEach(function(locationData) {
    //console.log(locationData);
  //  locationData.location = getlnglat(locationData.address);
    //console.log(locationData.location);
  //  console.log(locationData.address);

//getLatLong(locationData.street + " " + locationData.city);
//console.log(geoLocation);


function getLatLong(address) {
//  console.log('start');
  var geocoder = new google.maps.Geocoder();
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
        bounds.extend(results[0].geometry.location);
        console.log(bounds);
        marker.addListener('click', function() {
          populateInfoWindow(this, infowindow, this.title);
        });

        map.fitBounds(bounds);
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

//getLatLong(locationData.street + " " + locationData.city);
  //while(geoLocation === undefined){

//  }
//  setMarker(locationData.street + " " + locationData.city,locationData.name);



  //});



  document.getElementById('show-listings').addEventListener('click', showLocations);
  document.getElementById('hide-listings').addEventListener('click', hideLocations);


}


function populateInfoWindow(marker, infowindow, content) {
  console.log("populate");
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

function startApp() {
//  ko.applyBindings(new ViewModel());
  initMap();

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
