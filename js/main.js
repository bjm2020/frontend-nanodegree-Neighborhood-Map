var Location = function(data) {
    this.name = ko.observable(data.name);
    this.city = ko.observable(data.city);
    this.street = ko.observable(data.street);
    this.category = ko.observable(data.category);
    this.categoryID = data.categoryID;
    this.foursquareID = data.foursquareID;
    this.iconLink = data.iconLink;
    this.location = data.location;
    this.rating = ko.observable(data.rating);
    this.latestTip = ko.observable(data.latestTip);
    this.bestPhotoLink = ko.observable(data.bestPhotoLink);

    this.marker;


    this.address = this.street() + " " + this.city();
};

//Add Extra Venue Data to Location From Foursquare API
Location.prototype.addExtraData = function(data) {
    this.rating(data.rating);
    this.latestTip(data.latestTip);
    this.bestPhotoLink(data.bestPhotoLink);
};

var ViewModel = function() {
    var self = this;

    this.locationList = ko.observableArray([]);
    self.currentLocation = ko.observable(self.locationList()[0]);
    self.showGoogleAlert = ko.observable(false);
    self.alertText = ko.observable();

    //Get Foursquare Location Data.  This Method Calls the Foursquare API Twice.  Once to get all available venue's and some data.
    //The second API call takes the list of Foursquare Venues and gets specific data for each location.
    self.getFourSquareLocations = function() {
        var clientID = "PGZR20FMKL3MDGHKVNZFGE1N5AK02NPUCUIVQ5YFALGYSV1M"; //My Foursquare API Client ID
        var clientSecret = "5LM1W4RDO2BUO24UFCLDEXFQM0DJULOMDVTRAWXC1PMSRGQQ"; //My Foursquare API Client Secret
        var latlong = "29.739263,-90.126625"; //local town (Jean Lafitte) lat Lng coordinates
        var foursquareUrl = "https://api.foursquare.com/v2/venues/search?ll=" + latlong + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160108';

        //Get Initial Venue Data
        $.ajax({
            url: foursquareUrl,
            dataType: "json",
            success: function(data) {
                var venues = data.response.venues;
                for (var i = 0; i < venues.length; i++) {
                    var venue = venues[i];
                    var category;
                    var iconLink;
                    var categoryID;
                    if (venue.categories.length === 0) {
                        category = "undefined";
                        iconLink = "";
                        categoryID = "";
                    } else {
                        category = venue.categories[0].pluralName;
                        iconLink = venue.categories[0].icon.prefix + "bg_32" + venue.categories[0].icon.suffix;
                        categoryID = venue.categories[0].id;
                    }

                    var venueData = {
                        name: venue.name,
                        street: venue.location.address,
                        city: venue.location.city,
                        category: category,
                        categoryID: categoryID,
                        foursquareID: venue.id,
                        location: {
                            lat: venue.location.lat,
                            lng: venue.location.lng
                        },
                        iconLink: iconLink
                    }; //venue data

                    self.locationList.push(new Location(venueData));

                } //for loop

            }, //Foursquare Error Handling
            error: function(jqXHR, textStatus, errorThrown) {
                self.alertText("Foursquare API Error: " + jqXHR.status + " " + textStatus + " " + errorThrown);
                self.showGoogleAlert(true);

            } //success
            //Start second API call set.
        }).done(function() {

            //Loop through each Location and get specific venue data.
            self.locationList().forEach(function(location) {

                $.ajax({
                    url: 'https://api.foursquare.com/v2/venues/' + location.foursquareID + '?&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160108',
                    dataType: "json",
                    success: function(data) {
                        var extras = data.response.venue;
                        var latestTip;
                        var rating;
                        var bestPhotoLink;

                        //Some of the data acquired is marked optional by Foursquare and may not appear in the response.
                        //The following if statements check the data before proceeding and initiate default value's if needed.
                        if (typeof extras.rating === "undefined") {
                            rating = "0.0";
                        } else rating = extras.rating;

                        if (extras.tips.count > 0) {
                            latestTip = extras.tips.groups[0].items[0].text;
                        } else {
                            latestTip = "no tips avaialable from this location";
                        }
                        if (typeof extras.bestPhoto != "undefined") {
                            bestPhotoLink = extras.bestPhoto.prefix + "300x300" + extras.bestPhoto.suffix;
                        } else {
                            bestPhotoLink = "img/noimageavailable.gif"; //Placeholder Image
                        }
                        var extraData = {
                            bestPhotoLink: bestPhotoLink,
                            rating: rating,
                            latestTip: latestTip
                        }; //extraData
                        location.addExtraData(extraData);
                    }, //success
                    //Foursquare Error Handling.
                    error: function(jqXHR, textStatus, errorThrown) {
                        self.alertText("Foursquare API Error: " + jqXHR.status + " " + textStatus + " " + errorThrown);
                        self.showGoogleAlert(true);

                    } //error
                }); //ajax

            });

            //Initiate the App.  This function is called here in order to ensure that the Foursquare data
            //is loaded before the Map Data becomes available.
            startApp();
        }); //ajax


    };

    //Get Foursquare API Data.
    self.getFourSquareLocations();

    var map;
    var markers = [];
    var bounds;
    //Initiate The google Map.
    self.initMap = function() {

        //Additional google maps styling
        var styledMapType = new google.maps.StyledMapType(
            [{
                "featureType": "all",
                "elementType": "labels",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "poi.park",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#aadd55"
                }]
            }, {
                "featureType": "road.highway",
                "elementType": "labels",
                "stylers": [{
                    "visibility": "on"
                }]
            }, {
                "featureType": "road.arterial",
                "elementType": "labels.text",
                "stylers": [{
                    "visibility": "on"
                }]
            }, {
                "featureType": "road.local",
                "elementType": "labels.text",
                "stylers": [{
                    "visibility": "on"
                }]
            }, {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#0099dd"
                }]
            }], {
                name: 'Custom_Style_Map'
            });

        // Constructor creates a new map - only center and zoom are required.

        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 40.7413549,
                lng: -73.9980244
            },
            zoom: 13,
            mapTypeControlOptions: {
                mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
                    'Custom_Style_Map'
                ]
            }
        });

        //Associate the styled map with the MapTypeId and set it to display.
        map.mapTypes.set('Custom_Style_Map', styledMapType);
        map.setMapTypeId('Custom_Style_Map');


        var infowindow = new google.maps.InfoWindow();

        bounds = new google.maps.LatLngBounds();

        //Initiate The Map Markers
        self.locationList().forEach(function(location) {

            var marker = new google.maps.Marker({
                position: location.location,
                map: map,
                title: location.name(),
                icon: location.iconLink //Custom Icon From Foursquare API
            });


            location.marker = marker;
            markers.push(marker);
            bounds.extend(marker.position);

            //Marker Click Listener

            marker.addListener('click', function() {
                toggleBounce();
                self.currentLocation(location);
                populateInfoWindow(this, infowindow);
            });

            //Toggle Marker Bounces on or off.

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

        });

        map.fitBounds(bounds);

    };

    //Populate the info window with custom content from the Foursquare API.

    function populateInfoWindow(marker, infowindow) {


        var content =
            '    <div class="iw-container">' +
            '    <div class="iw-name">' +
            '      <h3 class="text-center">' + self.currentLocation().name() + '</h3>' +
            '       <h4 class="text-center">Rating: ' + self.currentLocation().rating() + '</h4>' +
            '    </div>' +
            '  <div class="iw-desc-container">' +
            '    <div class="iw-image">' +
            '      <img id="iwdescriptionimg" src="' + self.currentLocation().bestPhotoLink() + '"/>' +
            '    </div>' +
            '  <div class="iw-description">' +
            '      <h5> Address: </h5>' +
            '      <span>' + self.currentLocation().address + '</span>' +
            '    </div>' +
            '  </div>' +
            ' <div>' +
            '      <h5>Latest Tip:</h5>' +
            '      <span>' + self.currentLocation().latestTip() + '</span>' +
            '    </div>';

        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent(content);
            infowindow.open(map, marker);

            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
                marker.setAnimation(null);
            });
        }
    }

    //Show All Map Markers on Map
    function showLocations() {

        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
            bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
    }

    //Hide All Locations Other than the Category Selected in the filter
    function hideLocations() {

        self.locationList().forEach(function(location) {
            if (self.selectedCategory() != location.category())
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

    //Filter Categories

    this.filteredLocations = ko.computed(function() {
        if (typeof self.selectedCategory() === 'undefined') {
            return self.locationList();
        }
        return ko.utils.arrayFilter(self.locationList(), function(location) {
            return location.category() == self.selectedCategory();
        });
    });

    //Show and Hide Map Markers based on selected category

    this.selectionChanged = function() {

        if ("undefined" === typeof this.selectedCategory()) {

            showLocations();
        } else {
            showLocations();
            hideLocations(this.selectedCategory());
        }
    };


    this.setLocation = function(param) {

        self.currentLocation(param);
        for (var i = 0; i < markers.length; i++) {

            if (markers[i] === self.currentLocation().marker);

            google.maps.event.trigger(param.marker, 'click');
        }
    };

};

var model = new ViewModel();

ko.applyBindings(model);


function startApp() {
    model.initMap();
}

//Google Maps API Error Handling

function mapsError() {
    model.showGoogleAlert(true);
    model.alertText("Oops! Google Maps Has Encountered An Error.");

}
