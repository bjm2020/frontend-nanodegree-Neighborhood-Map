

  var Location = function(data) {
  this.name = ko.observable(data.name);
  this.city = ko.observable(data.city);
  this.street = ko.observable(data.street);
  this.category = ko.observable(data.category);
  this.categoryID = data.categoryID;
  this.foursquareID = data.foursquareID;
  this.iconLink =  data.iconLink;
  this.location = data.location;
  this.rating = ko.observable(data.rating);
  this.ratingColor =  ko.observable(data.ratingColor);
  this.latestTip = ko.observable(data.latestTip);
  this.bestPhotoLink = ko.observable(data.bestPhotoLink);
  this.photos = ko.observable(data.photos);

  this.marker;

  this.address = this.street() + " " + this.city();

}

Location.prototype.addExtraData = function(data) {
  this.rating(data.rating);
  this.ratingColor(data.ratingColor);
  this.latestTip(data.latestTip);
  this.photos(data.photos);
  this.bestPhotoLink(data.bestPhotoLink);
//  console.log(this.bestPhotoLink());
}

  var ViewModel = function() {
     var self = this;

     this.locationList = ko.observableArray([]);
     self.currentLocation = ko.observable(self.locationList()[0]);
     self.showGoogleAlert = ko.observable(false);
     self.alertText = ko.observable();

     self.getFourSquareLocations = function() {
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
            //   console.log(venue.id);
            //  console.log(venue.name);
            var category;
            var iconLink;
            var categoryID;
            if(venue.categories.length === 0){
            category = "undefined";
            iconLink = "";
            categoryID = "";
          }
            else {
              category = venue.categories[0].pluralName;
              iconLink = venue.categories[0].icon.prefix+"bg_32"+venue.categories[0].icon.suffix;
              categoryID = venue.categories[0].id;
            }

             var venueData = {
               name: venue.name,
               street: venue.location.address,
               city: venue.location.city,
               category: category,
               categoryID: categoryID,
               foursquareID: venue.id,
               location: {lat: venue.location.lat, lng: venue.location.lng},
               iconLink: iconLink
             } //venue data
             //console.log(venueData);
             self.locationList.push(new Location(venueData));

           } //for loop
            // console.log(self.locationList().length);
//startApp();
          },
          error: function(jqXHR, textStatus, errorThrown) {
            self.alertText(jqXHR.status + " " + textStatus + " " + errorThrown);
            self.showGoogleAlert(true);

          } //success

        }).done(function() {
          self.locationList().forEach(function(location) {


          // for (var i = 0; i < self.locationList().length;i++) {
          //  console.log("start loop");
        //    var index = i;
           $.ajax({
             url: 'https://api.foursquare.com/v2/venues/'+location.foursquareID+'?&client_id='+clientID+'&client_secret='+clientSecret+'&v=20160108',
             dataType: "json",
             success: function(data) {
               var extras = data.response.venue;
               var latestTip;
              //console.log(extras.rating);
              var rating;
              var ratingColor;
              var bestPhotoLink;
              if(typeof extras.rating !== "undefined") {
                rating = extras.rating;
                ratingColor = extras.ratingColor;
              }
              else {
                rating = "No Rating Available";
                ratingColor = "none";
              }
               if(extras.tips.count > 0) {
                 latestTip = extras.tips.groups[0].items[0].text;
               } //if
               else {latestTip = "no tips avaialable from this location";}
               if(typeof extras.bestPhoto != "undefined") {
                 bestPhotoLink = extras.bestPhoto.prefix + "100x100" + extras.bestPhoto.suffix;
               }
               else {
                 bestPhotoLink = "http://via.placeholder.com/100x100";
               }
               //else
               //console.log("ratings" + extras.price.rating);
               var extraData = {
               bestPhotoLink: bestPhotoLink,
               rating: rating,
               ratingColor: ratingColor,
               photos: extras.photos,
               latestTip: latestTip
           } //extraData
            location.addExtraData(extraData);
         } //success
       }); //ajax

      //   console.log(self.locationList()[i]);
  });
       //} //for loop

startApp();
        }); //ajax


}
self.getFourSquareLocations();

var map;
var markers = [];
var bounds;

self.initMap = function() {

var styledMapType = new google.maps.StyledMapType(
  [{"featureType":"all","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#aadd55"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#0099dd"}]}],
  {name:'Pirate_Styled_Map'});

  // Constructor creates a new map - only center and zoom are required.

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13,
    mapTypeControlOptions: {
            mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
                    'Pirate_Styled_Map']
          }
  });

  //Associate the styled map with the MapTypeId and set it to display.
        map.mapTypes.set('Pirate_Styled_Map', styledMapType);
        map.setMapTypeId('Pirate_Styled_Map');


  var infowindow = new google.maps.InfoWindow(); var iwOuter = $('.gm-style-iw');

   /* The DIV we want to change is above the .gm-style-iw DIV.
    * So, we use jQuery and create a iwBackground variable,
    * and took advantage of the existing reference to .gm-style-iw for the previous DIV with .prev().
    */
google.maps.event.addListener(infowindow, 'domready', function() {

   var iwBackground = iwOuter.prev();

   // Remove the background shadow DIV
   iwBackground.children(':nth-child(2)').css({'display' : 'none'});

   // Remove the white background DIV
   iwBackground.children(':nth-child(4)').css({'display' : 'none'});

});

  console.log(infowindow);
  bounds = new google.maps.LatLngBounds();
  self.locationList().forEach(function(location) {


//for(var i = 0; i < self.locationList().length; i++){
  var marker = new google.maps.Marker({
    position: location.location,
    map: map,
    title: location.name(),
   icon: location.iconLink
  });

  //locationList()[i].markerID = marker.id;
  location.marker = marker;
//  console.log(locationList()[i].marker);
  markers.push(marker);
  bounds.extend(marker.position);
//  console.log(markers);
  //var name = location.name();

  marker.addListener('click', function() {
  //  console.log("marker click");
  //  console.log(location);
    toggleBounce();
    self.currentLocation(location);

  //  console.log(self.currentLocation());
//    var html = "<div id='content holder'><div id = 'picture'></div><div id = 'info'><div id = 'venue'></div></div><div id = 'review'></div></div>";
    //self.currentLocation(self.locationList()[i]);
    populateInfoWindow(this, infowindow);
  });

  function toggleBounce() {

    self.locationList().forEach(function(location) {
      location.marker.setAnimation(null);
    });

          if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
          } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
          }
        }

});//}

map.fitBounds(bounds);

}

function populateInfoWindow(marker, infowindow) {


//console.log(content);
var content =
'  <div class="iw-container">' +
'    <div class="iw-name">'+
'      <h3 class="text-center">'+self.currentLocation().name()+'</h3>'+
'    </div>'+
'  </div>'+
'  <div>'+
'    <div>'+
'      <img style="float:left" src="'+self.currentLocation().bestPhotoLink()+'"/>'+
'      <p class="align-right">'+self.currentLocation().address+'</p>'+
'      <p class="align-right">'+self.currentLocation().rating()+'</p>'+
'    </div>'+
'  </div>'+
'  <div>'+
'    <div>'+
'      <span>'+self.currentLocation().latestTip()+'</span>'+
'    </div>'+
'  </div>';

  if(infowindow.marker != marker) {
    infowindow.marker = marker;
  //  infowindow.setContent(content);
  //  console.log(self.currentLocation());
    infowindow.setContent(content);
    infowindow.open(map, marker);

    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
      marker.setAnimation(null);
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

  self.locationList().forEach(function(location) {
      if(self.selectedCategory() != location.category())
        location.marker.setMap(null);
  });

}



//Stores Value of Drop Down List Category Filter.
this.selectedCategory = ko.observable();

//Filter Locations to retrieve just categories
self.justCategories = ko.computed(function() {
  var categories = ko.utils.arrayMap(self.locationList(), function(location) {
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
    console.log(self.locationList().length);
    return self.locationList();
  }
  return ko.utils.arrayFilter(self.locationList(), function(location) {
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


this.setLocation = function(param) {
/*
  console.log(param);
  //TODO: do something with location

  if(typeof self.currentLocation() === "undefined") {
    self.currentLocation(param);
  }
else {
    console.log(self.currentLocation());
  //console.log(param);
  //console.log(locationList()[i].name + " " + param);
  for(var i=0; i < self.locationList().length;i++){
    console.log(param);
    if(self.locationList()[i] === param){
      self.currentLocation(param);

    }
  }
}
*/
//console.log(self.currentLocation().bestPhotoLink);
self.currentLocation(param);
console.log(self.currentLocation().name)
  for(var i=0;i<markers.length;i++){
  //  console.log(self.currentLocation().markerID);
  //  console.log(markers[i].id);
    if(markers[i] === self.currentLocation().marker);
    //  markers[i].dispatchEvent('click');

      google.maps.event.trigger(param.marker, 'click');
  }
  console.log("setLoc");
};

};

var model = new ViewModel();

ko.applyBindings(model);

//startApp();
//console.log(locationList().length);


function startApp() {
//  model = new ViewModel();
 //ko.applyBindings(model);
  model.initMap();

};

function mapsError() {
model.showGoogleAlert(true);
model.alertText("Oops! Google Maps Has Encountered An Error.");

}
