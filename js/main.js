// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

var map;
var infoWindow;
var service;
var globalResults;
var placeCount = 0;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 42.580629, lng: -76.873292},
    zoom: 9,
    styles: [{
      stylers: [{ visibility: 'simplified' }]
    }, {
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }]
  });

    var geocoder = new google.maps.Geocoder;
    infoWindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);

    getLocations();
}

var locations = [
    {name:'Hermann J. Wiemer Vineyard',
    locationID:'ChIJTZYUJuPx0IkRb0aEp1cn4YM'},
    {name:'Damiani Wine Cellars',
    locationID:'ChIJRUjpBILz0IkRENKE-BIWo-c'},
    {name:'Wagner Vineyards Estate Winery',
    locationID:'ChIJOZf-lmLt0IkRbDHq0BzEuqo'},
    {name:'Lamoreaux Landing Wine Cellars',
    locationID:'ChIJ3RQFkGTt0IkR4kaLaimATAM'},
    {name:'Bully Hill Vineyards',
    locationID:'ChIJoXQfILqq0YkR_zgEa0XB3tk'}
];

function getLocations(){
    for(i=0; i < locations.length; i++){
        service.getDetails({
            placeId: locations[i].locationID
          }, function(place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              /*var marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location
              });*/
              //Add place to observable
                addPlace(place);
                //addMarker(place);
                /*google.maps.event.addListener(marker, 'click', function() {
                infoWindow.setContent('<div><strong>' + place.name + '</strong><br>' +
                  'Place ID: ' + place.place_id + '<br>' +
                  place.formatted_address + '</div>');
                infoWindow.open(map, this);
               
              });*/
            }
          });
        }
    }

function addMarker(place) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
  });
  google.maps.event.addListener(marker, 'click', function() {
    service.getDetails(place, function(result, status) {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        console.error(status);
        return;
      }
      infoWindow.setContent('<div><strong>' + result.name + '</strong><br>' +
          'Place ID: ' + result.place_id + '<br>' +
          result.formatted_address + '</div>');
      infoWindow.open(map, marker);
    });
  });
}

