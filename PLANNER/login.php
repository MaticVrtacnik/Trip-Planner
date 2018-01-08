<?php
    if(session_status() == PHP_SESSION_NONE){
      session_start();
    }

	$rules = [
        "username" => ["filter" => FILTER_VALIDATE_REGEXP, "options" => ["regexp" => "/^[ A-Za-z0-9]{3,20}$/"]],
        "password" => ["filter" => FILTER_VALIDATE_REGEXP, "options" => ["regexp" => "/^.{6,20}$/"]],
    ];

    $data = filter_input_array(INPUT_POST, $rules);

    $valid = true;
    foreach($data as $d){
    	$valid = $valid && $d !== false;
    }

	if($valid){
		require_once("connect_to_db.php");
		$db = Database::getInstance();

		$query = $db->prepare("
			SELECT *
			FROM Uporabnik 
			WHERE uporabnisko_ime = :username AND geslo = :password
 		");

		$query->execute(array('username' => $data["username"], 'password' => hash("sha256", $data["password"])));
		$results = $query->fetchAll();

		//found line with same password
		if(!empty($results)){
			echo("LOGIN SUCCESSFUL");
			$_SESSION["username"] = $data["username"];
		}

		return false;
	}
?>