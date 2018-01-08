
var markers = [];
var selectedLocation = 0;

function calcDistance(lat1, lng1, lat2, lng2){
	var _point1 = new google.maps.LatLng(lat1, lng1);
	var _point2 = new google.maps.LatLng(lat2, lng2);

	var _distanceInM = google.maps.geometry.spherical.
		computeDistanceBetween(_point1, _point2);

	return (_distanceInM / 1000.0).toFixed(1);
}

function addMarker(title, latitude, longitude, scoreChange, showButton){
	icon = scoreChange == null ? 
		'https://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png' : 
		"https://mt.google.com/vt/icon?psize=30&font=fonts/arialuni_t.ttf&color=ff304C13&name=icons/spotlight/spotlight-waypoint-a.png&ax=43&ay=48&text=%E2%80%A2";

	if(scoreChange < 0.0){
		icon = 'http://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png';
	}

	var marker = new google.maps.Marker({
		position: {lat: latitude, lng: longitude},
		map: map,
		title: title,
		icon: icon
	});

	marker.addListener("click", function(){
		showButton.click();
	});

	markers.push(marker);
}

function addAccomondations(cityName, cityLat, cityLng){
	//PREFERENCES
	var _allowPets = document.getElementById("allow_pets").checked;
	var _requireHeating = document.getElementById("require_heating").checked;
	var _requireHouse = document.getElementById("require_house").checked;
	var _requireBreakfast = document.getElementById("require_breakfast").checked;
	var _requireFamilyFriendly = document.getElementById("require_family").checked;

	var _args = 
		"city=" + cityName + "&" +
		"pets=" + _allowPets + "&" +
		"heating=" + _requireHeating + "&" +
		"house=" + _requireHouse + "&" +
		"breakfast=" + _requireBreakfast + "&" +
		"family=" + _requireFamilyFriendly;
	
	$.ajax({
		type: "GET",
		url: "../python/query.php",
		data: _args,
		success: function(data){
			//console.log(data);
			var rows = data.split("\n");
			var hashmap = {};

			//console.log(rows.length);

			var _validEntries = 0;
			for(var i = 0; i < rows.length - 1; ++i){
				var rowData = rows[i].split("$$");
				if(rowData.length < 9)continue;
				//console.log(rowData);
				
				var score = parseFloat(rowData[0]);
				var type = rowData[1];
				var lat = parseFloat(rowData[2]);
				var lng = parseFloat(rowData[3]);
				var desc = rowData[4];		
				var image = rowData[5];
				var thumbnail = rowData[6];
				var scoreOverTime = rowData[7];
				var scoreChange = parseFloat(rowData[8]);

				scoreOverTime =  scoreOverTime.length < 2 ? "" : 
					scoreOverTime.substring(1, scoreOverTime.length - 1);

				valuePairs = scoreOverTime.split(", ");
				var times = [];
				var scores = [];

				for(var j = 0; j < valuePairs.length; ++j){
					var pair = valuePairs[j].split(": ");
					times.push(pair[0]);
					scores.push(pair[1]);
				}

				//console.log(i + ". " + score);

				var distance = calcDistance(cityLat, cityLng, lat, lng);
				
				addAccomondationEntry(cityName, lat, lng, distance, type, score, desc, image, thumbnail,
					times, scores, scoreChange);

				if(score in hashmap){
					hashmap[score] += 1;
				}else{
					hashmap[score] = 1;
				}
				
				//TODO remove -> PROBLEM: location service OVER_QUERY_LIMIT
				//if(i > 5)break;

				_validEntries += 1;
			}

			document.getElementById("list_title").innerHTML = "LIST - " + _validEntries + " entries";

			var scoreKeys = [];
			var scoreValues = [];

			for(var key in hashmap){
				scoreKeys.push(key);
				scoreValues.push(hashmap[key]);
			}

			var data = {	
			    x: scoreKeys,
			    y: scoreValues,
			    type: 'bar'
			};

			var layout = {
				title: "Rating Distribution",
				xaxis: { title: "Score" },
				yaxis: { title: "Count" }
			};

			Plotly.newPlot('rating_distribution', [data], layout);
		}
	})
	
}

function setRouteInfo(origin, latTo, lngTo, id, display){
	var _travelMode = document.getElementById("travelType").value; 
		directionsService.route({
          origin: origin, 
		  destination: new google.maps.LatLng(latTo, lngTo),
		  optimizeWaypoints: false,
          travelMode: google.maps.DirectionsTravelMode[_travelMode]
    	}, function(response, status) {
          if (status === 'OK') {

          	//display
            if(display != null && display){
            	directionsDisplay.setDirections(response);
            }

            var _table = document.getElementById("acc-table");
            var _row = _table.rows[id];
            var _route = response.routes[0];

            var _km = (_route.legs[0].distance.value / 1000.0).toFixed(1);
        	_row.cells[2].innerHTML = _km + "km";

            var _min = Math.round(_route.legs[0].duration.value / 60);
            _row.cells[3].innerHTML = convertTime(_min).string;

          } else {
            alert("Directions error: " + status);
          }
    });
}

function addAccomondationEntry(
	cityName, lat, lng, distance, type, rating, description, image, thumbnail,
	times, scores, scoreChange)
{
	var _table = document.getElementById("acc-table");
	var _rowId = _table.rows.length;
	var _row = _table.insertRow(_rowId);

	var _travelMode = document.getElementById("travelType").value; 
	var _min = Math.round(_travelMode == "WALKING" ? 
		(distance * 15.0) : (distance * 2.5));

	_row.insertCell(0).innerHTML = rating;
	_row.insertCell(1).innerHTML = cityName + " " + type;
	_row.insertCell(2).innerHTML = distance + "km";
	_row.insertCell(3).innerHTML = convertTime(_min).string;
	_row.insertCell(4).innerHTML = "<img src='" + thumbnail + "' style='height:50px;'/>";
	_row.insertCell(5).innerHTML = "<button class='tabs'>Show</button>";

	_row.cells[5].addEventListener("click", function(){
		var _index = this.parentElement.rowIndex;
		setContent(null, 'description');

		document.getElementById("back_route").style.display = "none";
		document.getElementById("back_list").style.display = "inline";

		document.getElementById("acc_description").innerHTML = description;

		document.getElementById("acc_img").src = "";
		document.getElementById("acc_img").src = image;

		setRouteInfo(cityName, lat, lng, _rowId, true);


		var _score = { x: times, y: scores, type: 'scatter' };

		var layout = {
			title: "Score Over Time",
			xaxis: { title: "Time" },
			yaxis: { title: "Score" }
		};

		Plotly.newPlot('rating_over_time', [_score], layout);

		//not working async
		//map.setCenter(new google.maps.LatLng(lat, lng));
        //map.setZoom(25);
	});

	addMarker(cityName + " " + type, lat, lng, scoreChange, _row.cells[5]);
	//setRouteInfo(cityName, lat, lng, _rowId);
}

function removeRoute(){
	if(directionsDisplay != null){
		directionsDisplay.setMap(null);
		directionsDisplay = null;
	}

    directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(map);
}

function clearList(){
	var _table = document.getElementById("acc-table");

	for(var i = _table.rows.length; i > 1; --i){
		_table.deleteRow(i - 1);
	}

	for(var i = 0; i < markers.length; ++i){
		markers[i].setMap(null);
	}markers = [];


	selectedLocation = 0;
	//remove route
	//removeRoute();
}

function queryList(rowId){
	var _table = document.getElementById("point-table");
	var _row = _table.rows[rowId];
	var address = "Asheville"; //_row.cells[ADDRESS_ID].innerHTML;

	clearList();
	selectedLocation = rowId;

	//console.log(_row.cells[ARRIVAL_ID].innerHTML);
	//console.log(document.getElementById("arrival_" + rowId).value);
	
	geocoder.geocode({'address': address}, function(results, status) {
    	if (status === 'OK') {
    		map.setCenter(results[0].geometry.location);

            var _address = results[0].formatted_address;
    		var _lat = results[0].geometry.location.lat();
    		var _lng = results[0].geometry.location.lng();
    		
			
			//TODO check if city exists	
			addAccomondations("Asheville", _lat, _lng);
 		
			markers.push(new google.maps.Marker({
 				position: {lat: _lat, lng: _lng},
 				map: map,
 				title: _address,
 				icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
 			}));

          } else {
            alert("Unable to find: " + "'" + address + "' (" + status + ")");
          }
    });
}

function reloadQueryList(){
	if(selectedLocation > 0){
		queryList(selectedLocation);
	}	
}
