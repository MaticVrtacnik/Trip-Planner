<?php
	require_once("connect_to_db.php");
	$db = Database::getInstance();

	$query = $db->prepare("
		SELECT i.naziv AS naziv_poti, u.uporabnisko_ime, p.naziv, i.razdalja, i.cas
		FROM Izlet i INNER JOIN Izleti_uporabnikov iu USING(ID_izlet) 
		INNER JOIN Uporabnik u USING(ID_uporabnik) 
		INNER JOIN Prevozno_sredstvo p ON(i.ID_prevozno_sredstvo = p.ID_prevozno_sredstvo) 
		ORDER BY(i.ID_izlet) DESC
		LIMIT 10
	");

	$query->execute();
	$results = $query->fetchAll();

	foreach($results as $result){
		echo(implode("$$", array_values($result))."\n");
	}

?>