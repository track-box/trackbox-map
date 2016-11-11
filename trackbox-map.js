/*
 * TrackboxMap - trackbox map class based on Google Maps
 *
 * ref. Overlay map types
 * https://developers.google.com/maps/documentation/javascript/examples/maptype-overlay
 *
 */

/** @constructor */
function TrackboxMap(def, div_id) {
	this.tileSize = new google.maps.Size(256, 256);
	this.maxZoom = 21;
	this._def = def;

	// detect retina
	this._retina = window.devicePixelRatio >= 2;

	this.map = this._initGoogleMaps(div_id);

	this._tileBounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(def.bounds[0][0], def.bounds[0][1]),
		new google.maps.LatLng(def.bounds[1][0], def.bounds[1][1]));

	this.addTo();
}


TrackboxMap.prototype._initGoogleMaps = function(div_id) {
	var map_canvas = document.getElementById(div_id);

	if (this._retina) {
		var inner = document.createElement('div');
		inner.style.width = '200%';
		inner.style.height = '200%';
		inner.style.transform = 'scale(0.5) translate(-50%, -50%)';

		map_canvas.appendChild(inner);
		map_canvas = inner;
	}

	var map = new google.maps.Map(map_canvas, {
		mapTypeId: google.maps.MapTypeId.SATELLITE,
		center: new google.maps.LatLng(this._def.center[0], this._def.center[1]),
		zoom: 12,
		mapTypeControl: false,
		zoomControl: false,
		streetViewControl: false
	});

	return map;
};

TrackboxMap.prototype.addTo = function() {
	this._setOverlayControl();

	this.map.overlayMapTypes.insertAt(0, this);
	this._show = true;

	if (this._def.waypoint_url){
		this._waypoint = new TrackboxWaypoint(this._def.waypoint_url, map);
	}
};


TrackboxMap.prototype.getTile = function(coord, zoom, owner) {
	var tileBounds = this._tileCoordsToBounds(coord, zoom);

	if (tileBounds.intersects(this._tileBounds)){
		if (zoom >= this._def.zoom.min && zoom <= this._def.zoom.max){

			var tile = owner.createElement('img');
			tile.alt = '';

			tile.src = this._getTileUrl(coord, zoom);
			tile.style.width = this.tileSize.width + 'px';
			tile.style.height = this.tileSize.height + 'px';

			return tile;
		}
	}
	
	var tile = owner.createElement('img');
	tile.alt = '';
	return tile;
};


TrackboxMap.prototype._getTileUrl = function(coord, zoom) {
	var y = (1 << zoom) - coord.y - 1;
	return this._def.url + '/' + zoom + '/' + coord.x + '/' + y + '.png';
};

TrackboxMap.prototype._tileCoordsToBounds = function(coord, zoom) {
	var proj = this.map.getProjection();
	var scale = Math.pow(2, zoom);

	var p1 = new google.maps.Point(
		(coord.x + 1)* this.tileSize.width / scale,
		coord.y * this.tileSize.height / scale);
	var p2 = new google.maps.Point(
		coord.x * this.tileSize.width / scale,
		(coord.y + 1) * this.tileSize.height / scale);
	
	var ne = proj.fromPointToLatLng(p1);
	var sw = proj.fromPointToLatLng(p2);

	return new google.maps.LatLngBounds(sw, ne);
};


TrackboxMap.prototype._setOverlayControl = function() {
	var div = document.createElement('div');
	div.index = 1;

	var controlUI = document.createElement('div');
	controlUI.style.backgroundColor = '#fff';
	controlUI.style.border = '2px solid #fff';
	controlUI.style.borderRadius = '2px';
	controlUI.style.boxShadow = '0 1px 4px -1px rgba(0,0,0,.3)';
	controlUI.style.cursor = 'pointer';
	controlUI.style.marginTop = '10px';
	controlUI.style.marginRight = '10px';
	controlUI.style.padding = '10px';
	controlUI.style.textAlign = 'center';
	controlUI.style.color = 'rgb(25,25,25)';
	controlUI.style.fontSize = '11px';
	controlUI.style.position = 'relative';
	controlUI.style.display = 'block';
	controlUI.innerHTML = this._def.name;
	
	if (this._retina) controlUI.style.padding = '9px 6px';

	div.appendChild(controlUI);

	var self = this;
	controlUI.addEventListener('click', function() {
		self._toggle();
	});

	this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(div);
};


TrackboxMap.prototype._toggle = function() {
	if (this._show){
		if (this._waypoint) this._waypoint.showZoomgt(12);
		this.map.overlayMapTypes.removeAt(0);
	}else{
		if (this._waypoint) this._waypoint.showZoomgt(15);
		this.map.overlayMapTypes.insertAt(0, this);
	}
	this._show = !this._show;
};

TrackboxMap.prototype.showCurrentPosition = function() {
	if (this._currentPosition){
		console.log(this);
		this._showCurrentPosition();

	}else if (!this._watchId){
		var self = this;
		this._watchId = navigator.geolocation.watchPosition(
			function(pos) {
				self._showCurrentPosition(pos);
			},
			function(err) {
				alert(err.message);
			},
			{
				enableHighAccuracy: false,
				timeout: 10000,
				maximumAge: 0
			}
		);
	}
};

TrackboxMap.prototype._showCurrentPosition = function(pos) {
	if (!pos){
		if (this._currentPosition) this.map.panTo(this._currentPosition);
		return;
	}

	var position = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
	this._currentPosition = position;
	
	if (!this._currentPosMarker) {
		this._currentPosMarker = new google.maps.Marker({
			position: position,
			map: this.map,
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
				scale: 6,
				fillOpacity: 1,
				fillColor: '#1faee3',
				strokeWeight: 1,
				strokeColor: '#4591c5'
			}
		});

		this.map.panTo(position);

	}else{
		this._currentPosMarker.setPosition(position);
	}

	if (this._goals){
		this._goals.updatePosition(position);
	}
};

TrackboxLongTouch.prototype = new google.maps.OverlayView();


function TrackboxLongTouch(map, goals) {
	this.map = map;
	this._goals = goals;
	this.setMap(map);
};

TrackboxLongTouch.prototype.onAdd = function() {};
TrackboxLongTouch.prototype.draw = function() {};
TrackboxLongTouch.prototype.onRemove = function() {};

TrackboxLongTouch.prototype.getLatLng = function(x, y) {
	return this.getProjection().fromContainerPixelToLatLng(new google.maps.Point(x, y));
};

TrackboxLongTouch.prototype.show = function(x, y) {
	var pos = this.getLatLng(x, y);
	var marker = new google.maps.Marker({
		position: pos,
		map: this.map
	});

	var digit = this._goals._getDigit(pos.lat(), pos.lng());

	$("#waypoint-info-name").text(digit);
	$("#waypoint-info-add").attr("name", digit);
	$("#waypoint-info-href").attr("href", "http://maps.google.com/maps?q="+ pos.lat() +","+ pos.lng());
	$("#waypoint-info").openModal({
		complete: function(){ marker.setMap(null); }
	});	
	$("#waypoint-info-add").click(function(){
		marker.setMap(null);
	});
};

