<?php
	if(session_status() == PHP_SESSION_NONE){
      session_start();
    }

    $username = isset($_GET["username"]) ? $_GET["username"] : (isset($_SESSION["username"]) ? $_SESSION["username"] : " ");
    $tripName = isset($_GET["name"]) ? $_GET["name"] : "";
    $valid = !empty($username) && !empty($tripName);

    //echo($username);

    if($valid){
    	require_once("connect_to_db.php");
		$db = Database::getInstance();

		$queryTripId = $db->prepare("
			SELECT i.ID_izlet 
			FROM Izlet i 
			INNER JOIN Izleti_uporabnikov iu USING(ID_izlet)
			INNER JOIN Uporabnik u USING(ID_uporabnik)
			WHERE u.uporabnisko_ime = :username AND i.naziv = :tripName
			LIMIT 1
		");
		$queryTripId->execute(array("username" => $username, "tripName" => $tripName));
		$tripIdResults = $queryTripId->fetchAll();

		if(!empty($tripIdResults)){
			$tripId = $tripIdResults[0]["ID_izlet"];

			$queryLocations = $db->prepare("
				SELECT k.naziv
				FROM Kraj k INNER JOIN Kraji_izletov ki USING(ID_kraj)
				WHERE ki.ID_izlet = :tripId
				ORDER BY ki.st ASC
			");

			$queryLocations->execute(array("tripId" => $tripId));
			$results = $queryLocations->fetchAll();

			foreach($results as $result){
				echo(implode("$$", array_values($result))."\n");
			}
		}
		
    }

?>