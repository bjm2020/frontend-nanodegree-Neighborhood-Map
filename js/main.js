var Location = function(data) {
  this.name = ko.observable(data.name);
  this.city = ko.observable(data.city);
  this.street = ko.observable(data.street);

  this.address = ko.computed(function() {
    return data.street + " " + data.city;
  },this);
};
var initialLocations = [
  {
    "name": "Swamp Tour",
    "street": "1037 Jean Lafitte Blvd.",
    "city": "Lafitte, LA"
  },
  {
    "name": "Swamp Tour",
    "street": "1037 Jean Lafitte Blvd.",
    "city": "Lafitte, LA"
  },
  {
    "name": "Swamp Tour",
    "street": "1037 Jean Lafitte Blvd.",
    "city": "Lafitte, LA"
  },
  {
    "name": "Swamp Tour",
    "street": "1037 Jean Lafitte Blvd.",
    "city": "Lafitte, LA"
  },
  {
    "name": "Swamp Tour",
    "street": "1037 Jean Lafitte Blvd.",
    "city": "Lafitte, LA"
  }
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
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13
  });
}
