/************************************************************Wine API and Product List*************************************************************************/
var wineData = [];
var productList = [];

wineData[0] = "http://services.wine.com/api/beta2/service.svc/json/catalog?search=Bully+Hill&size=1&apikey=0986681690919c5baef1226ff293310f";
wineData[1] = "http://services.wine.com/api/beta2/service.svc/json/catalog?search=Wagner&size=1&apikey=0986681690919c5baef1226ff293310f";
wineData[2] = "http://services.wine.com/api/beta2/service.svc/json/catalog?search=Hermann+Wiemer&size=1&apikey=0986681690919c5baef1226ff293310f";
wineData[3] = "http://services.wine.com/api/beta2/service.svc/json/catalog?search=Lamoreaux&size=1&apikey=0986681690919c5baef1226ff293310f";
wineData[4] = "http://services.wine.com/api/beta2/service.svc/json/catalog?search=Hazlitt+1852+Vineyards&size=1&apikey=0986681690919c5baef1226ff293310f";

function buildProductList() {
   
    for(var i = 0; i < wineData.length; i++){
        
        (function(i){
            $.getJSON(wineData[i], function(data){
                productList[i] = data.Products.List[0];
            }).error(function(e) {
                console.log('Wine data not found.');
                wineAPIError();
            });
        })(i);
    }

}

buildProductList();

function addProductData(placeData) {
    for (var j = 0; j < productList.length; j++) {
        var searchName = placeData.name;
        var firstWordSearchName = searchName.split(" ", 1);
        var firstWordVineyardName = productList[j].Vineyard.Name.split(" ", 1);

        if (firstWordSearchName.toString() == firstWordVineyardName.toString()) {
            return productList[j];
        }
    }
    return 'Not Found';
}

function wineAPIError(){
    alert("Wine API Error.");
}


/**********************************************************Google Controller*********************************************/

var map;
var infoWindow;
var service;
var markerArray = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 42.580629,
            lng: -76.873292
        },
        zoom: 9,
        styles: [{
            stylers: [{
                visibility: 'simplified'
            }]
        }, {
            elementType: 'labels',
            stylers: [{
                visibility: 'off'
            }]
        }]
    });

    var geocoder = new google.maps.Geocoder;
    infoWindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);

    getLocations();
}

var locations = [{
    name: 'Bully Hill Vineyards',
    locationID: 'ChIJoXQfILqq0YkR_zgEa0XB3tk'
}, {
    name: 'Hermann J. Wiemer Vineyard',
    locationID: 'ChIJTZYUJuPx0IkRb0aEp1cn4YM'
}, {
    name: 'Hazlitt 1852 Vineyards',
    locationID: 'ChIJF7zAGZzz0IkRGrSfgbI3oRc'
}, {
    name: 'Wagner Vineyards Estate Winery',
    locationID: 'ChIJOZf-lmLt0IkRbDHq0BzEuqo'
}, {
    name: 'Lamoreaux Landing Wine Cellars',
    locationID: 'ChIJ3RQFkGTt0IkR4kaLaimATAM'
}];

function getLocations() {
    for (var i = 0; i < locations.length; i++) {
        service.getDetails({
            placeId: locations[i].locationID
        }, function(place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                //Add place to observable

                var placeMarker = addMarker(place);
                addPlace(place, placeMarker);
            }
        });
    }
}

function addMarker(place) {
    var marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        position: place.geometry.location,
    });
    marker.name = place.name;
    markerArray.push(marker);
    google.maps.event.addListener(marker, 'click', function() {
        service.getDetails(place, function(result, status) {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.error(status);
                return;
            }
            infoWindow.setContent('<div><a href="' + result.website + '"><strong>' + result.name + '</strong></a><br>' +
                'Winerey Rating: ' + result.rating + '<br>' +
                result.formatted_address + '</div>');
            infoWindow.open(map, marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 700);
        });
    });
    return marker;
}

function addPlace(result, placeMarker) {
    result.Marker = placeMarker;
    result.productData = addProductData(result);
    placeList.push(result);
}

function upDateMarkers(finalList) {
    for (j = 0; j < markerArray.length; j++)
        if (isInFilterSelection(finalList, markerArray[j])) {
            //Show marker
            markerArray[j].setMap(map);
        } else {
            //Hide marker
            markerArray[j].setMap(null);
        }
}

function isInFilterSelection(finalList, marker) {
    for (i = 0; i < finalList.length; i++) {
        if (marker.name == finalList[i].name) {
            return true;
        }
    }
    return false;
}

function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1400);
    }
}

function googleError(){
    alert("Error handling Google Maps Data");
}

/*************************************************************Knockout View Model*******************************************************************/

var placeList = ko.observableArray();

function AppViewModel() {
    var self = this;
    var finalList;
    this.placeFilter = ko.observable();
    this.wineImage = ko.observable();

    self.displayPlaces = ko.computed(function() {
        if (this.placeFilter() != undefined) {
            var filter = this.placeFilter().toLowerCase();
        }
        if (!filter) {
            finalList = placeList();
        } else {
            var filteredList = ko.utils.arrayFilter(placeList(), function(newPlace) {
                return ko.utils.stringStartsWith(newPlace.name.toLocaleLowerCase(), filter);
            });
            finalList = filteredList;
        }
        upDateMarkers(finalList);
        return finalList;
    }, this);

    playAnimation = function() {
        toggleBounce(this.Marker);
    }
}
ko.applyBindings(new AppViewModel());