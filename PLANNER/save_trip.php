<?php
	if(session_status() == PHP_SESSION_NONE){
      session_start();
    }

    if(isset($_SESSION["username"])){
    	echo($_POST["transport"]);

    	$rules = [
	        "trip_name" => ["filter" => FILTER_VALIDATE_REGEXP, "options" => ["regexp" => "/^.{1,30}$/"]],
	        "distance" => ["filter" => FILTER_VALIDATE_REGEXP, "options" => ["regexp" => "/^.{1,11}$/"]],
	        "duration" => ["filter" => FILTER_VALIDATE_REGEXP, "options" => ["regexp" => "/^.{1,12}$/"]],
	        "transport" => ["filter" => FILTER_VALIDATE_REGEXP, "options" => ["regexp" => "/^[0-9]{1}$/"]],
	        "locations"=> ["filter" => FILTER_VALIDATE_REGEXP, "options" => ["regexp" => "/^.{1,}$/"]],
    	];

    	$data = filter_input_array(INPUT_POST, $rules);

	    $valid = true;
	    foreach($data as $d){
	    	$valid = $valid && $d !== false;
	    }

		if($valid){
			$name = $data["trip_name"];
			$distance = $data["distance"];
			$duration = $data["duration"];
			$transport = $data["transport"];
			$locations = json_decode($data["locations"]);
			$username = $_SESSION["username"];

			require_once("connect_to_db.php");
			$db = Database::getInstance();

			$fixedLocations = array();
			foreach($locations as $location){
				$loc = preg_replace('/[0-9]+/', '', $location);
				$loc = preg_replace('/\s+/', '', $loc);
				$loc = strtoupper($loc);
				array_push($fixedLocations, $loc);
			}


			$locationIndices = array();			
			foreach($fixedLocations as $location){
				$insert_if_missing = $db->prepare("
					INSERT INTO kraj (naziv, zemljepisna_visina, zemljepisna_sirina) 
					SELECT :location, 0.0, 0.0 FROM kraj
					WHERE NOT EXISTS (SELECT * FROM kraj WHERE naziv = :location) 
					LIMIT 1
				");$insert_if_missing->execute(array("location" => $location));

				$get_location_id = $db->prepare("
					SELECT ID_kraj FROM kraj WHERE naziv = :location
				");$get_location_id->execute(array("location" => $location));

				array_push($locationIndices, array($get_location_id->fetchAll()[0]["ID_kraj"], count($locationIndices)));
			}

			$db->prepare("
				INSERT INTO izlet(ID_prevozno_sredstvo, naziv, razdalja, cas)
				VALUES(:transport, :name, :distance, :duration)
			")->execute(array(
				"transport" => intval($transport) + 1, 
				"name" => $name, 
				"distance" => $distance, 
				"duration" => $duration
			));


			$get_trip_id = $db->prepare("SELECT MAX(ID_izlet) FROM izlet");
			$get_trip_id->execute();
			$tripId = $get_trip_id->fetchAll()[0]["MAX(ID_izlet)"];

			$get_user_id = $db->prepare("SELECT ID_uporabnik FROM uporabnik WHERE uporabnisko_ime = :username");
			$get_user_id->execute(array("username" => $username));
			$userId = $get_user_id->fetchAll()[0]["ID_uporabnik"];

			$db->prepare("
				INSERT INTO izleti_uporabnikov(ID_uporabnik, ID_izlet)
				VALUES(:userId, :tripId)
			")->execute(array("userId" => $userId, "tripId" => $tripId));

			foreach($locationIndices as $index){
				$db->prepare("
					INSERT INTO kraji_izletov(ID_kraj, ID_izlet, st)
					VALUES(:locationId, :tripId, :num)
				")->execute(array("locationId" => $index[0], "tripId" => $tripId, "num" => $index[1]));
			}

			echo("Saved trip");
		}
		
    }

?>