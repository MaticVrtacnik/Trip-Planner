<!DOCTYPE html>
<html>

  <?php
    if(session_status() == PHP_SESSION_NONE){
      session_start();
    }
  ?>


  <title>Trip planner</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link type="text/css" href="style.css" rel="stylesheet">

  <header class="col-12">
    <div style="width:50%; float:left;">
      <h1>Trip planner</h1>
    </div>

    <div style="width:50%; position:relative; float:left; margin-bottom: 0px;" >
        <div style="float:right; margin-top: 30px; padding-bottom: 0px; padding-right: 1%; ">

        <div>
        <h3 style="padding: 0; margin: 0;" id="welcome_string">Welcome 
            <?php if(isset($_SESSION["username"])) : 
                echo($_SESSION["username"]);
              else: ?>
                Guest 
            <?php endif; ?>
        </h3>
        </div>

        <?php if(isset($_SESSION["username"])) : ?>
          <button id="my_trips_button" onclick="setView(event, ['my_view', 'map_view']); showMyTrips();"> My trips </button>
        <?php endif; ?>

          <button id="popular_trips_button" onclick="setView(event, ['popular_view', 'map_view']); showPopularTrips();"> Recent trips </button>
          <button id="map_button" onclick="setView(event, ['planner_view', 'map_view']); displayRoute();"> Planner map </button>

          <?php if(isset($_SESSION["username"])) : ?>
              <button id="login_button" onclick="logoutUser(event);"> Logout </button>
          <?php else: ?> 
              <button id="login_button" onclick="setView(event, ['login_view'])"> Login/Register </button>
          <?php endif; ?>

        </div>
    </div>

  </header>



<div id="map_view" class="views" style="display:inline;">
  <div class="col-6"><div id="map"></div></div>
</div>

<div id="planner_view" class="views" style="display:inline;">
  <aside class="col-6">

  <fieldset>
    <legend><b> Add address </b></legend>
  
      <p id="total-distance"> Total Distance: 0.0km</p>
      <p id="total-duration"> Total Duration: 0min</p>   

      <input size=25 id="address" type="text" name="address" autofocus />
      <button id="add" onclick="handleAddressInput();">Add location</button><br> 

      <?php if(isset($_SESSION['username'])) : ?>
        <form id="save_form" method="post" onsubmit="return saveTrip(event);">
          <input size=25 id="trip_name" type="text" name="trip_name" maxlength="30" required/>
          <input type="submit" value=" Save route ">
        </form>
      <?php endif; ?>
        
  </fieldset>

  <div class="tab" style="float:left;" >
    <button id="defaultTab" class="tabs" onclick="
        setContent(event, 'route');
        document.getElementById('back_list').style.display = 'none';
        document.getElementById('back_route').style.display = 'none';
        displayRoute();
        clearList();
      ">Route</button>

    <select id="travelType" onchange="displayRoute(); setContent(null, 'route'); clearList();">
        <option value="DRIVING">Driving</option>
        <option value="WALKING">Walking</option>
        <!-- <option value="BICYCLING">Bicycling</option> -->
        
        <!--<option value="TRANSIT">Transit</option>-->
      </select>

  </div>

  <div style="float:right; padding-right:1%;">
      <button id="back_route" style="display: none;">&larr; Back to route</button>
      <button id="back_list" style="display: none;">&larr; Back to list</button>    
  </div>

  <div style="height:400px; width:100%; overflow:auto;" id="address_view"> 

    <div id="route" class="content"> 
      <table id="point-table">
        <tr>
          <th></th>
          <th></th>
          <th>Address</th>
          <th>Distance</th>
          <th>Time</th>
          <th></th>
          <th></th>
        </tr>
      </table>
    </div>


    <div id="list" class="content" style="display:none;">
        <h1 id="list_title"> LIST </h1>
        <!--<button onclick="showLocationStatistics()">Show statistics</button>-->

        <div id="rating_distribution" style="width:90%;">
        </div>

        <table id="acc-table">
          <tr>
            <th>Rating</th>
            <th>Name</th>
            <th>Distance</th>
            <th>Time</th>
            <th></th>
            <th></th>
          </tr>
        </table>

    </div>

    <div id="description" class="content" style="display:none;">
        <h1> DESCRIPTION </h1>

        <img id="acc_img" src="https://s-media-cache-ak0.pinimg.com/736x/39/f6/e0/39f6e0639465c7e01eaa79e26ada2a48.jpg" style="padding-top: 10px; height: 400px; width: auto;"/>

        <p id="acc_description" style="text-align: justify; width: 96%;">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sed mattis lorem, eu consectetur neque. Sed ut venenatis orci, vel ultricies mauris. Nunc nec diam quis risus ornare mattis. Cras euismod pharetra justo et vulputate. Nunc viverra faucibus tellus, quis lacinia odio bibendum in. Quisque imperdiet odio id odio gravida condimentum. Nullam posuere aliquet tellus iaculis tempus. Praesent auctor dolor nec mattis lacinia. Sed quam lorem, convallis id ultrices ac, elementum sed nunc.
        </p>

    </div>   
    
  </div>

  
  </aside>
</div>


<div id="login_view" class="views" style="display:none;">
  <br>
  <center>
    <h2><b> Login </b></h2>
    Don't have an account? <button onclick="setView(event, ['register_view'])"> Register </button> <br><br>

    <div style="float:center; text-align: center; width:160px;"> 
      
      <form id="login_form" method="post" onsubmit="return loginUser(event);">
        <div style="float:left; text-align: left;">
        <label> Username </label> <br> 
        <input style="margin-bottom:5px" type="text" id="username" name="username" minlength=3 maxlength=20 pattern="[ A-Za-z]+" placeholder="3-20 characters" required/><br>
        <label> Password </label> <br>
        <input style="margin-bottom:5px" type="password" id="password" name="password" minlength=6 maxlength=20 placeholder="7-20 characters" required/><br>
        </div>

        <input type="submit" Value="Login"/>
      </form>
      
    </div>

    <br>

  </center>
</div>


<div id="register_view" class="views" style="display:none;">
  <br>
  <center>
    <h2><b> Register </b></h2>

    <div style="float:center; text-align: center; width:325px;"> 
    <form id="register_form" method="post" onsubmit="return registerUser(event);">
      <div style="float:left; text-align: left;">
        <label> First and last name </label> <br>
        <input style="margin-bottom:5px" type="text" name="fname" maxlength=30 pattern="[ A-Za-zšđčćžŠĐČĆŽ]+" required/>
        <input style="margin-bottom:5px" type="text" name="lname" maxlength=30 pattern="[ A-Za-zšđčćžŠĐČĆŽ]+" required/><br>
        <label> Username and password </label> <br> 
        <input style="margin-bottom:5px" type="text" name="username" minlength=3 maxlength=20 pattern="[ A-Za-z0-9]+" placeholder="3-20 characters" required/>
        <input style="margin-bottom:5px" type="password" name ="password" minlength=6 maxlength=20 placeholder="7-20 characters" required/><br>
        <label> E-main</label><br>
        <input style="margin-bottom:5px" type="email" name="email" placeholder="example@domain.com" size="46" required/><br>
      </div>
      <input id="register_submit" type="submit" Value="Register"/>
    </form>
    </div>
    <br>

  </center>
</div>


<div id="popular_view" class="views" style="display:none;">

  <aside class="col-6">
  <center>
    <h2> Recent Trips </h2>

    <table id="popular_table">
      <tr>
        <th>Name</th>
        <th>User</th>
        <th>Transport</th>
        <th>Distance</th>
        <th>Time</th>
        <th></th>
        <th></th>
      </tr>
    </table>

  </center>

  </aside>

</div>


<div id="my_view" class="views" style="display:none;">

  <aside class="col-6">
  <center>
    <h2> My Trips </h2>

    <table id="my_table">
      <tr>
        <th>Name</th>
        <th>Transport</th>
        <th>Distance</th>
        <th>Time</th>
        <th></th>
        <th></th>
      </tr>
    </table>

  </center>

  </aside>

</div>

<div id="message_view" class="views" style="display:none;">
  <div class="col-12">
  <center>
    <h2 id="message"> Text </h2><br><br>
    <button onclick="setView(event, ['planner_view', 'map_view'])">Back to map</button>
  </center>
  </div>
</div>


<footer class="col-12">
  Matic Vrtačnik, 63150317
</footer>

<script>
    function initMap() {
      directionsService = new google.maps.DirectionsService;
      directionsDisplay = new google.maps.DirectionsRenderer;
      geocoder = new google.maps.Geocoder();
      map = new google.maps.Map(document.getElementById('map'), 
        { zoom: 9, center: {lat: 46.0661123, lng: 14.4620601} });

      directionsDisplay.setMap(map);
    }
</script>
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyC7yGt8l4pdtPqap0Eby1soUByYKqzmZNo&callback=initMap&libraries=geometry"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script src="globals.js"> </script>
<script src="query.js"> </script>
<script src="script.js"> </script>


</html>