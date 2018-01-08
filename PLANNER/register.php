<?php
	$rules = [
        "fname" => ["filter" => FILTER_VALIDATE_REGEXP, "options" => ["regexp" => "/^[ A-Za-zšđčćžŠĐČĆŽ]{1,30}$/"]],
        "lname" => ["filter" => FILTER_VALIDATE_REGEXP, "options" => ["regexp" => "/^[ A-Za-zšđčćžŠĐČĆŽ]{1,30}$/"]],
        "username" => ["filter" => FILTER_VALIDATE_REGEXP, "options" => ["regexp" => "/^[ A-Za-z0-9]{3,20}$/"]],
        "password" => ["filter" => FILTER_VALIDATE_REGEXP, "options" => ["regexp" => "/^.{6,20}$/"]],
        "email"=> FILTER_VALIDATE_EMAIL,
    ];

    $data = filter_input_array(INPUT_POST, $rules);

	$valid = true;
	foreach($data as $d){	
		$valid = $valid && $d !== false;
	}

	if($valid){
		require_once("connect_to_db.php");
		$db = Database::getInstance();

		//check if username already exists
		$exists = $db->prepare("SELECT * FROM Uporabnik WHERE uporabnisko_ime = :username");
		$exists->execute(array("username" => $data["username"]));

		if(empty($exists->fetchAll())){
			$query = $db->prepare("INSERT INTO Uporabnik (ime, priimek, uporabnisko_ime, geslo, eposta) 
            VALUES (:fname, :lname, :username, :password, :email)");
	        $query->bindParam(":fname", $data["fname"]);
	        $query->bindParam(":lname", $data["lname"]);
	        $query->bindParam(":username", $data["username"]);
	        $query->bindParam(":password", hash("sha256", $data["password"]));
	        $query->bindParam(":email", $data["email"]);
	        $query->execute();

	        echo("Successfully added user " + $data["username"]);
		}//else alert in js
		
	}else{
		
	}
?>