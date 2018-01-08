<?php

	if(isset($_GET["city"]) && !empty($_GET["city"])){
		//$city = mysql_real_escape_string($_GET["city"]);
		$city = $_GET["city"];
		$city = preg_replace('/[0-9]+/', '', $city);
		$city = preg_replace('/\s+/', '', $city);
		$city = strtoupper($city);

		require_once("connect_to_db.php");
		$db = Database::getInstance();

		$query = $db->prepare("
			SELECT z.ocena, z.naziv, z.zemljepisna_visina, z.zemljepisna_sirina, z.opis, z.slika, z.thumbnail
			FROM Znamenitost z INNER JOIN Kraj k USING(ID_Kraj) 
			WHERE UPPER(k.naziv) = :kraj
		");

		$query->execute(array('kraj' => $city));
		$results = $query->fetchAll();

		foreach($results as $result){
			echo(implode("$$", array_values($result))."\n");
		}
	}

?>















