
var markers = [];
var selectedLocation = 0;

function calcDistance(lat1, lng1, lat2, lng2){
	var _point1 = new google.maps.LatLng(lat1, lng1);
	var _point2 = new google.maps.LatLng(lat2, lng2);

	var _distanceInM = google.maps.geometry.spherical.
		computeDistanceBetween(_point1, _point2);

	return (_distanceInM / 1000.0).toFixed(1);
}

function addMarker(title, latitude, longitude, showButton){
	var marker = new google.maps.Marker({
		position: {lat: latitude, lng: longitude},
		map: map,
		title: title
	});

	marker.addListener("click", function(){
		showButton.click();
	});

	markers.push(marker);
}

function addSights(cityName, cityLat, cityLng){

	$.ajax({
		type: "GET",
		url: "query_sights.php",
		data: "city=" + cityName,
		success: function(data){

			//console.log(data);
			var rows = data.split("\n");
			//console.log(rows.length);

			var _validEntries = 0;
			for(var i = 0; i < rows.length; ++i){
				var rowData = rows[i].split("$$");
				if(rowData.length < 7)continue;
				//console.log(rowData);
				
				var score = parseFloat(rowData[0]);
				var name = rowData[1];
				var lat = parseFloat(rowData[2]);
				var lng = parseFloat(rowData[3]);
				var desc = rowData[4];		
				var image = rowData[5];
				var thumbnail = rowData[6];

				
				var distance = calcDistance(cityLat, cityLng, lat, lng);
				
				addSightEntry(cityName, lat, lng, distance, name, score, desc, image, thumbnail);

				//TODO remove -> PROBLEM: location service OVER_QUERY_LIMIT
				//if(i > 5)break;

				_validEntries += 1;
			}

			document.getElementById("list_title").innerHTML = "LIST - " + _validEntries + " entries";
			removeRoute();
		}
	});
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

function addSightEntry(
	cityName, lat, lng, distance, name, rating, description, image, thumbnail)
{
	var _table = document.getElementById("acc-table");
	var _rowId = _table.rows.length;
	var _row = _table.insertRow(_rowId);

	var _travelMode = document.getElementById("travelType").value; 
	var _min = Math.round(_travelMode == "WALKING" ? 
		(distance * 15.0) : (distance * 2.5));

	_row.insertCell(0).innerHTML = rating;
	_row.insertCell(1).innerHTML = name;
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

	});

	addMarker(name, lat, lng, _row.cells[5]);
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
	var address = _row.cells[ADDRESS_ID].innerHTML;

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
			addSights(address, _lat, _lng);
 		
			markers.push(new google.maps.Marker({
 				position: {lat: _lat, lng: _lng},
 				map: map,
 				title: _address,
 				icon: "https://mt.google.com/vt/icon?psize=30&font=fonts/arialuni_t.ttf&color=ff304C13&name=icons/spotlight/spotlight-waypoint-a.png&ax=43&ay=48&text=%E2%80%A2"
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


function registerUser(event){
    $.ajax({
      type: 'POST',
      url: 'register.php',
      data: $('#register_form').serialize(),
      success: function(data){
      	console.log(data);
      	if(data){
      		document.getElementById('message').innerHTML = 'Registration successful! You can now log in!';
      		setView(null, ['message_view']);
      		document.getElementById("register_form").reset();  
      	}else{
      		alert("Invalid registration or username already exists!");
      	}
      }
    }); 

    event.preventDefault();
    return false;
}

function loginUser(event){
	var result = false;

	$.ajax({
      type: 'POST',
      url: 'login.php',
      data: $('#login_form').serialize(),
      success: function(data){
      	//console.log($('#login_form').serialize());
      	//console.log("DATA: '" + data + "'");

      	if(data){
      		document.getElementById('message').innerHTML = 'Login successful! You can now save your trips!';
      		setView(null, ['message_view']);
      		result = true;
      	}else{
      		alert("Invalid login!");    		
      	}

      	document.getElementById("login_form").reset();           
      }
    }); 



  	//if(!result){
  		//event.preventDefault();
  		//return false;
  	//}
}

function logoutUser(event){
	if(confirm("Do you really want to log out?") == true){
		$.ajax({type: 'POST', url: 'logout.php',
	      success: function(data){
	      	location.reload();           
	      }
	    }); 
	}	
}

function saveTrip(event){	
	var locations = [];
	var rows = document.getElementById("point-table").rows;
	for(var i = 1; i < rows.length; ++i){
		locations.push(rows[i].cells[ADDRESS_ID].innerHTML);
	}

	if(locations.length < 2){
		alert("You need to enter at least 2 locations to save a route!");
		event.preventDefault();
		return false;
	}

	var distance = document.getElementById("total-distance").innerHTML.split(": ")[1];
	var duration = document.getElementById("total-duration").innerHTML.split(": ")[1];
	var transport = document.getElementById("travelType").selectedIndex.toString();
	//console.log(distance + " " + duration + " " + tansport);

	var post = $('#save_form').serialize() + 
		"&" + "distance=" + distance +
		"&" + "duration=" + duration +
		"&" + "transport=" + transport +
		"&" + "locations=" + JSON.stringify(locations);
	//console.log(post);

	$.ajax({
      type: 'POST',
      url: 'save_trip.php',
      data: post,
      success: function(data){
        console.log(data);

        if(data){
        	document.getElementById("trip_name").innerHTML = "";
	        document.getElementById('message').innerHTML = 'Trip successfully saved!';
	      	setView(null, ['message_view']);
	      }else{
	      	alert("Failed to save trip!");
	      }
        
      }
    });

    event.preventDefault();
    return false;
}


function showQueryTrip(locations, transport){
	if(locations.length < 2)return;

	var waypoints = [];
	for(var i = 0; i < locations.length; ++i){
		waypoints.push({location: locations[i], stopover: true});	
	}

	directionsService.route({
          origin: locations[0],
          destination: locations[locations.length - 1],
          waypoints: waypoints,
          optimizeWaypoints: false,
          travelMode: google.maps.DirectionsTravelMode[transport]
        }, function(response, status) {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
          } else {
            alert("Directions error: " + status);
          }
    });
}

function editQueryTrip(locations, transport){
	localStorage.clear();
	var table = document.getElementById("point-table");
	for(var i = table.rows.length - 1; i > 0; --i){
		table.deleteRow(i);
	}

	for(var i = 0; i < locations.length; ++i){
		addTableEntry(locations[i]);
		localStorage.setItem(locations[i] + (new Date()).getTime(), JSON.stringify([locations[i]]));
	}

	document.getElementById("travelType").value = transport;
	setView(event, ['planner_view', 'map_view']); 
	displayRoute();
}

function queryLocations(tripName, username, transport, functionForData){
	var args = "name=" + tripName + (username ? ("&" + "username=" + username) : "");
	$a = $.ajax({
		type: 'GET', 
		url: 'query_locations.php',
		data: args,
		success:function(data){     	
      	//console.log(data);
      	var rows = data.split("\n");

      	var locations = [];
      	for(var i = 0; i < rows.length; ++i){
      		if(!rows[i])continue;
      		locations.push(rows[i]);
  		}	

  		functionForData(locations, transport);
      }
    }); 
}


function insertRecentTrip(name, user, transport, distance, time){
	var table = document.getElementById("popular_table");
	var row = table.insertRow(table.rows.length);	

	row.insertCell(0).innerHTML = name;
	row.insertCell(1).innerHTML = user;
	row.insertCell(2).innerHTML = transport;
	row.insertCell(3).innerHTML = distance;
	row.insertCell(4).innerHTML = time;
	row.insertCell(5).innerHTML = "<button>Show</button>";
	row.insertCell(6).innerHTML = "<button>Edit</button>";

	//SHOW
	row.cells[row.cells.length - 2].addEventListener("click", function(){
		var username = row.cells[1].innerHTML;
		var name = row.cells[0].innerHTML;
		var transport = row.cells[2].innerHTML;
		queryLocations(name, username, transport, showQueryTrip);
	});

	//EDIT
	row.cells[row.cells.length - 1].addEventListener("click", function(){
		var username = row.cells[1].innerHTML;
		var name = row.cells[0].innerHTML;
		var transport = row.cells[2].innerHTML;
		queryLocations(name, username, transport, editQueryTrip);
	});
}

function showPopularTrips(){
	$.ajax({type: 'GET', url: 'query_popular.php',
      success: function(data){
      	var table = document.getElementById("popular_table");
      	var numRows = table.rows.length;
      	for(var i = numRows - 1; i > 0; --i){
      		table.deleteRow(i);
      	}

      	//console.log(data);
      	var rows = data.split("\n");
      	for(var i = 0; i < rows.length; ++i){
      		var a = rows[i].split("$$");
	      	if(a.length >= 5){
	      		insertRecentTrip(a[0], a[1], a[2], a[3], a[4]);
	     	}
  		}
   	
      }
    }); 
}

function insertMyTrip(name, transport, distance, time){
	var table = document.getElementById("my_table");
	var row = table.insertRow(table.rows.length);	

	row.insertCell(0).innerHTML = name;
	row.insertCell(1).innerHTML = transport;
	row.insertCell(2).innerHTML = distance;
	row.insertCell(3).innerHTML = time;
	row.insertCell(4).innerHTML = "<button>Show</button>";
	row.insertCell(5).innerHTML = "<button>Edit</button>";

	//SHOW
	row.cells[row.cells.length - 2].addEventListener("click", function(){
		var name = row.cells[0].innerHTML;
		var transport = row.cells[1].innerHTML;
		queryLocations(name, "", transport, showQueryTrip);
	});

	//EDIT
	row.cells[row.cells.length - 1].addEventListener("click", function(){
		var name = row.cells[0].innerHTML;
		var transport = row.cells[1].innerHTML;
		queryLocations(name, "", transport, editQueryTrip);
	});
}

function showMyTrips(){
	$.ajax({type: 'GET', url: 'query_my.php',
      success: function(data){
      	var table = document.getElementById("my_table");
      	var numRows = table.rows.length;
      	for(var i = numRows - 1; i > 0; --i){
      		table.deleteRow(i);
      	}

      	//console.log(data);
      	var rows = data.split("\n");
      	for(var i = 0; i < rows.length; ++i){
      		var a = rows[i].split("$$");
	      	if(a.length >= 4){
	      		insertMyTrip(a[0], a[1], a[2], a[3]);
	     	}
  		}
   	
      }
    }); 
}