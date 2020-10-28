// Obtain reference to #mapContainer in DOM
const container = document.getElementById('mapContainer');
// Store initialized platform object
const platform = new H.service.Platform({ apikey: config.APIKEY });
// Store reference to layers object
const layers = platform.createDefaultLayers();
// create initial center point for map and/or REST
const initPoint = new H.geo.Point(47.6622, -122.4179);
// Create map object initialized with container, layers, and geolocation
const map = new H.Map(container, layers.vector.normal.map, {
  center: initPoint,
  zoom: 14,
  pixelRatio: window.devicePixelRatio || 1,
});
// Create behavior object initialized with map object
const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
// Create UI object associated with map object and layers object
const ui = H.ui.UI.createDefault(map, layers);

map.getViewModel().setLookAtData({
  tilt: 45,
});
// resize map when window is resized
window.addEventListener('resize', () => map.getViewPort().resize());
const service = platform.getSearchService();


// draggable map marker
const dragMarker = new H.map.Marker(initPoint, { volatility: true });
dragMarker.draggable = true;
map.addObject(dragMarker);

// dragging events
map.addEventListener('dragstart', (ev) => {
  const { target } = ev;
  const pointer = ev.currentPointer;
  if (target instanceof H.map.Marker) {
    const targetPosition = map.geoToScreen(target.getGeometry());
    target.offset = new H.math.Point(pointer.viewportX - targetPosition.x, pointer.viewportY - targetPosition.y);
    behavior.disable();
  }
}, false);
map.addEventListener('drag', (ev) => {
  const { target } = ev;
  const pointer = ev.currentPointer;
  if (target instanceof H.map.Marker) {
    target.setGeometry(map.screenToGeo(pointer.viewportX - target.offset.x, pointer.viewportY - target.offset.y));
  }
}, false);
map.addEventListener('dragend', (ev) => {
  const { target } = ev;
  if (target instanceof H.map.Marker) {
    processMarker(target);
  }
}, false);

// display formatted lat,lng from p (point object)
function getGeoLabel(p) {
  return `${Math.abs(p.lat.toFixed(4))}${((p.lat > 0) ? 'N' : 'S')}
     ${Math.abs(p.lng.toFixed(4))}${((p.lat > 0) ? 'E' : 'W')}`;
}

function processMarker(marker) {
  behavior.enable();
  const markerPoint = marker.getGeometry();
  let message = `<div>${getGeoLabel(markerPoint)}</div><hr />`;
  let speech = '';
  let spot = {};
  service.reverseGeocode({ at: `${markerPoint.lat},${markerPoint.lng}` }, (result) => {
    spot = result.items[0];
    console.log(spot);
    spot.address.label && (message += spot.address.label);
    const bubble = new H.ui.InfoBubble(markerPoint, { content: message });
    ui.addBubble(bubble);
    setTimeout(() => {
      bubble.close();
    }, 3000);
    const a = spot.address;
    speech = `${a.district || ''} ${a.city || ''} ${a.state || ''}`;
    speak(speech);
    map.setCenter(markerPoint, true);
  });
}

const toggleScreen = document.getElementById('toggleScreen');
toggleScreen.addEventListener('click', () => {
  if (toggleScreen.innerText === 'Full Screen') {
    toggleScreen.innerText = 'Exit';
    container.requestFullscreen();
  } else {
    toggleScreen.innerText = 'Full Screen';
    document.exitFullscreen();
  }
});

let currentVoice = 'Matthew';
document.getElementById('voiceBox').addEventListener('click', (evt) => {
  document.getElementById(`img${currentVoice}`).classList.remove('currentVoice');
  const selectedImg = evt.target;
  selectedImg.classList.add('currentVoice');
  currentVoice = selectedImg.title;
  speak(`Hi, my name is ${currentVoice}`, currentVoice);
});

theVoice.addEventListener('play', () => document.getElementById(`img${currentVoice}`).classList.add('speaking'));
theVoice.addEventListener('ended', () => document.getElementById(`img${currentVoice}`).classList.remove('speaking'));
