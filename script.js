

function setContent(evt, id){

	var content = document.getElementsByClassName("content");
	for(var i = 0; i < content.length; ++i){
		content[i].style.display = "none";
	}
	document.getElementById(id).style.display = "block";
}

function setView(evt, ids){
	var content = document.getElementsByClassName("views");
	for(var i = 0; i < content.length; ++i){
		content[i].style.display = "none";
	}

	for(var i = 0; i < ids.length; ++i){
		document.getElementById(ids[i]).style.display = "inline";
	}
}



function calcTotalDistance(){
	var table = document.getElementById("point-table");

	var _distance = 0.0;
	for(var i = 1; i < table.rows.length; ++i){
		var _dv = table.rows[i].cells[DISTANCE_ID].innerHTML;
		var _d = parseFloat(_dv.substring(0, _dv.length - 2));
		_distance += _d;
	}

	return _distance;
}

function swapLocalStorageValues(id1, id2){
	if(id1 >= localStorage.length || id2 >= localStorage.length)return;

	var _tmp = localStorage.getItem(localStorage.key(id1));
	localStorage.setItem(localStorage.key(id1), localStorage.getItem(localStorage.key(id2)));
	localStorage.setItem(localStorage.key(id2), _tmp);

	//console.log(localStorage);
}

function swapTableValues(id1, id2){
	var _table = document.getElementById("point-table");

	var _tmp = _table.rows[id1].innerHTML;
	_table.rows[id1].innerHTML = _table.rows[id2].innerHTML;
	_table.rows[id2].innerHTML = _tmp;

	setRowListeners(_table.rows[id1]);
	setRowListeners(_table.rows[id2]);
}

function setRowListeners(row){
	if(row == null)return;

	//delete entry
	row.cells[REMOVE_ID].addEventListener("click", function(){
		var _index = this.parentElement.rowIndex;
		localStorage.removeItem(localStorage.key(_index - 1));
		document.getElementById("point-table").deleteRow(_index);
		displayRoute();
	});

	//move up
	row.cells[0].addEventListener("click", function(){
		var _index = this.parentElement.rowIndex;
		if(_index < 2)return;

		swapTableValues(_index, _index - 1);
		swapLocalStorageValues(_index - 1, _index - 2);
		displayRoute();
	});

	//move down
	row.cells[1].addEventListener("click", function(){
		var _table = document.getElementById("point-table");
		var _index = this.parentElement.rowIndex;
		if(_index >= _table.rows.length - 1)return;

		swapTableValues(_index, _index + 1);
		swapLocalStorageValues(_index - 1, _index);
		displayRoute();
	});

	row.cells[SHOW_ID].addEventListener("click", function(){
		var _index = this.parentElement.rowIndex;
		setContent(null, `list`);
		queryList(_index);

		var _backButton = document.getElementById("back_route");
		_backButton.style.display = "inline";
	});

}


function addTableEntry(address, id){
	if(address === "")return;

	var _table = document.getElementById("point-table");
	var _rowId = id == null ? _table.rows.length : id;
	var _row = _table.insertRow(_rowId);	

	var _disabledDate = (_rowId == 1 ? '' : 'disabled');
	
	_row.insertCell(0).innerHTML = "<button><</button>";
	_row.insertCell(1).innerHTML = "<button>></button>";
	_row.insertCell(ARRIVAL_ID).innerHTML = "<input type='datetime-local' disabled id='arrival_" + _rowId + "' />";
	_row.insertCell(NIGHTS_ID).innerHTML = /*_rowId == 1 ? "" : */"<input type='number' min=0 value=1 style='width:30px;'/>";
	_row.insertCell(ADDRESS_ID).innerHTML = address;
	_row.insertCell(DISTANCE_ID).innerHTML = 0.0 + "km";
	_row.insertCell(TIME_ID).innerHTML = "0m";

	_row.insertCell(SHOW_ID).innerHTML = "<button class='tabs'>Show</button>";
	_row.insertCell(REMOVE_ID).innerHTML = "<button>X</button>";

	//if(_rowId == 1){
		var _date = new Date().toLocaleString().substring(0, 10).split("/").reverse().join("-");
		document.getElementById("arrival_" + _rowId).value = _date + "T12:00";

	if(_rowId == 1){	
		document.getElementById("arrival_" + _rowId).disabled = false;
	}

	setRowListeners(_row);

	_row.draggable = true;

	_row.ondragover = function(event) {
    	event.preventDefault();
	};

	_row.ondrop = function(event) {
	    event.preventDefault();
	    var _sourceId = event.dataTransfer.getData("id");
	    var _destId = event.target.parentElement.rowIndex;
	    if(_sourceId != _destId && _sourceId != null && _destId != null){
	    	swapTableValues(_sourceId, _destId);
			swapLocalStorageValues(_sourceId - 1, _destId - 1);
			displayRoute();
	    }	    
	};
	
	_row.ondragstart = function(event) {
    	event.dataTransfer.setData("id", event.target.rowIndex);
	};

}

function convertTime(minutes){
	if(minutes == null)return null;

	var _hour = 60;
	var _day = _hour * 24;
	var _hours = 0;
	var _days = 0;

	var _durationString = "";
	if(minutes > _day){
		_days = Math.floor(minutes / _day);
		_durationString += _days + "d";
		minutes -= _days * _day;
	}if(minutes > _hour){
		_hours = Math.floor(minutes / _hour);
		_durationString += _hours + "h";
		minutes -= _hours * _hour;
	}_durationString += minutes + "min";

	return {
		minutes: minutes,
		hours: _hours,
		days: _days,
		string: _durationString
	};
}



function getTableEntry(id){
	var table = document.getElementById("point-table"); 
	if(table.rows.length < 2)return null;

	if(id < 0)id = table.rows.length - id;
	if(id < 0 || id >= table.rows.length)return null;

	var _row = table.rows[id];

	var _distanceHTML = _row.cells[DISTANCE_ID].innerHTML;
	var _distance = parseFloat(_distanceHTML.substring(0, _distanceHTML.length - 2));

	var _timeHTML = _row.cells[TIME_ID].innerHTML;
	var _time = parseInt(_timeHTML.substring(0, _timeHTML.length - 3));

	return {
		address: _row.cells[ADDRESS_ID].innerHTML,
		distance: _distance,
		time: _time,
	}
}

function updateDistanceAndTime(response){
	var _table = document.getElementById("point-table");
	var route = response.routes[0];

	var _totalDistance = 0.0;
	var _totalDuration = 0;
	for (var i = 0; i < route.legs.length; i++){
        var _km = (route.legs[i].distance.value / 1000.0).toFixed(1);
        _table.rows[i + 1].cells[DISTANCE_ID].innerHTML = _km + "km";

        var _min = Math.round(route.legs[i].duration.value / 60);
		_table.rows[i + 1].cells[TIME_ID].innerHTML = convertTime(_min).string;

		_totalDistance += parseFloat(_km);
		_totalDuration += parseInt(_min);
    }

    document.getElementById("total-distance").innerHTML = 
		"Total Distance: " + _totalDistance.toFixed(1) + "km";

	document.getElementById("total-duration").innerHTML = 
		"Total Duration: " + convertTime(_totalDuration).string;
}

function updateArrivals(response){
	var _table = document.getElementById("point-table");
	var route = response.routes[0];

	for (var i = 0; i < route.legs.length; i++){
        var _min = Math.round(route.legs[i].duration.value / 60);


    }
}

function addAddressPoint(address){
	geocoder.geocode({'address': address}, function(results, status) {
    	if (status === 'OK') {
    		map.setCenter(results[0].geometry.location);

            var _address = results[0].formatted_address;
    		//var _lat = results[0].geometry.location.lat().toFixed(5);
    		//var _lng = results[0].geometry.location.lng().toFixed(5);
 		
    		localStorage.setItem((new Date()).getTime(), JSON.stringify([_address]));
 		
            addTableEntry(_address);
            displayRoute();	

          } else {
            alert("Unable to find: " + "'" + address + "' (" + status + ")");
          }
    });
}

function displayRoute(){
	var table = document.getElementById("point-table");  
	var rows = table.rows;

	if(rows.length < 3)return;

	//add points to stop at between start end finish
	var _waypoints = [];
	for(var i = 1; i < rows.length - 1; ++i){
		_waypoints.push({
			location: rows[i].cells[ADDRESS_ID].innerHTML,
			stopover: true
		});	
	}

	var _travelMode = document.getElementById("travelType").value; 

	/*console.log("START: " + rows[1].cells[1].innerHTML + " FINISH: " + 
		rows[rows.length - 1].cells[1].innerHTML);*/

	//display route
	directionsService.route({
          origin: rows[1].cells[ADDRESS_ID].innerHTML,
          destination: rows[rows.length - 1].cells[ADDRESS_ID].innerHTML,
          waypoints: _waypoints,
          optimizeWaypoints: false,
          travelMode: google.maps.DirectionsTravelMode[_travelMode]
        }, function(response, status) {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
            updateDistanceAndTime(response);
            updateArrivals(response);
          } else {
            alert("Directions error: " + status);

            //remove last element if no route to it found (overseas)
            if(status === "ZERO_RESULTS"){
            	localStorage.removeItem(localStorage.key(rows.length - 2));
				document.getElementById("point-table").deleteRow(rows.length - 1);
				displayRoute();
				updateInsertId();
            }
          }
    });

}

function handleAddressInput(){
	var _address = document.getElementById("address").value;

	if(_address === "")return;
	else document.getElementById("address").value = "";

	addAddressPoint(_address);
}

$(document).ready(() => {
	//localStorage.clear();

	var table = document.getElementById("point-table");
	var _keys = Object.keys(localStorage);

	for(var i = 0; i < localStorage.length; ++i){
		var data = localStorage.getItem(localStorage.key(i));
		data = JSON.parse(data);

		addTableEntry(data[0]);
	}

	 displayRoute();

	document.getElementById("defaultTab").click();


	document.getElementById("back_route").addEventListener("click", function(){
		setContent(null, `route`);
		document.getElementById("back_route").style.display = "none";
		displayRoute();
		clearList();
	});

	document.getElementById("back_list").addEventListener("click", function(){
		setContent(null, `list`);
		document.getElementById("back_list").style.display = "none";
		document.getElementById("back_route").style.display = "inline";
		displayRoute();
	});

});
