var pickup_location, drop_location;
var source, destination, source1;
var pts = [];

function initMap1() {
  map = new MapmyIndia.Map("map", {
    center: [23.0736298, 72.5141419],
    zoomControl: true,
    location: true,
    backgroundColor: "red",
  });
}

async function getCoordinates(place) {
  console.log(place);

  const response = await fetch(
    `https://maps.gomaps.pro/maps/api/geocode/json?address=${place}&key=AlzaSyzq4aBSOOGhS0QAvkqblTrgu4vM10U1wWu`
  );
  const data = await response.json();

  if (data.results && data.results.length > 0) {
    return {
      lat: data.results[0].geometry.location.lat,
      lng: data.results[0].geometry.location.lng,
    };
  } else {
    throw new Error("Place not found!");
  }
}

async function fetchMap(start, end) {
  const apiKey = "1abbd174-53ac-4fef-8406-023a5fb884be";
  const response = await fetch(
    `https://graphhopper.com/api/1/route?point=${start}&point=${end}&vehicle=car&key=${apiKey}&points_encoded=false`
  );
  const data = await response.json();

  if (!data.paths || !data.paths[0]) {
    throw new Error("No route found in response");
  }

  const route = data.paths[0].points.coordinates;
  console.log(route);

  route.forEach((pt) => {
    var newpt = { lat: pt[1], lng: pt[0] };
    pts.push(newpt);
  });
  //pts.push({ lat: source1.lat, lng: source1.lng });

  console.log(pts);
}

var map;
var temp, templine;

function initMap(source, source1) {
  map = new MapmyIndia.Map("map", {
    center: [source.lat, source.lng],
    zoomControl: true,
    location: true,
    // minZoom: 10,
  });

  const m1 = new MapmyIndia.Marker({
    map: map,
    position: { lat: source1.lat, lng: source1.lng },
    draggable: true,
  });

  temp = new MapmyIndia.Marker({
    map: map,
    position: { lat: source.lat, lng: source.lng },
    draggable: true,
  });

  templine = new MapmyIndia.Polyline({
    map: map,
    paths: pts,
    strokeColor: "blue",
    strokeOpacity: 1.0,
    strokeWeight: 4,
    fitbounds: true,
  });
}

window.addEventListener("load", async () => {
  const response = await fetch("/uber/api/rider/get-directions");

  if (response.status === 201) {
    let data = await response.json();

    if (data.data[0][0] === undefined) {
      location.href = "/uber/rider/go";
    }

    console.log("directions", data.data[0][0].fare_amount);
    document.getElementById("pickup-location").innerText =
      data.data[0][0].pickup_location;
    pickup_location = data.data[0][0].pickup_location;
    document.getElementById("drop-location").innerText =
      data.data[0][0].drop_location;
    drop_location = data.data[0][0].drop_location;
    var source1 = await getCoordinates(pickup_location);
    destination = await getCoordinates(drop_location);
    source = { lat: 23.037333, lng: 72.567043 };
    pts.push({ lat: source.lat, lng: source.lng });

    await fetchMap(
      `${source.lat},${source.lng}`,
      `${source1.lat},${source1.lng}`
    );
    initMap(source, source1);
    console.log(pts);

    pts.forEach((point, index) => {
      setTimeout(() => {
        console.log(point);

        temp.remove();
        //map.removeLayer(templine);
        MapmyIndia.remove({map: map, layer: templine});
        temp = new MapmyIndia.Marker({
          map: map,
          position: { lat: point.lat, lng: point.lng },
          draggable: true,
          icon: 'https://cdn-icons-png.flaticon.com/512/55/55283.png'
        });
        

        templine = new MapmyIndia.Polyline({
          map: map,
          paths: pts,
          strokeColor: "blue",
          strokeOpacity: 1.0,
          strokeWeight: 4,
          fitbounds: true,
        });
        let index = pts.findIndex(
            (p) => p.lat === point.lat && p.lng === point.lng
          );
          if (index !== -1) {
            pts.splice(index, 1);
          }
  
          console.log(pts);
      }, index * 3000);
    });

    document.getElementById(
      "vehicle-info"
    ).innerText = `${data.data[0][0].vehicle_preference}, Toyota camry, KA-01-1b-1234, Silver`;
  } else {
    location.href = "/uber/rider/go";
  }
});
document
  .getElementById("cancel-ride-btn")
  .addEventListener("click", async () => {
    const response = await fetch("/uber/api/rider/cancel-ride");

    if (response.status === 201) {
      location.href = "/uber/rider/go";
    } else {
      let data = await response.json();
      console.log(data.message);
    }
  });
