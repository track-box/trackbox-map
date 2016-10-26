/*
 * TrackboxWaypoint - trackbox waypoint class
 *
 */

/** @constructor */
function TrackboxWaypoint(url, map) {
	this.map = map;
	var self = this;
	this._loadJSON(url, function(data){
		self.data = data;
		if (self._onloadForGoals){
			self._onloadForGoals();
		}
		self.showWaypoints();
	});
};


TrackboxWaypoint.prototype._loadJSON = function(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open('get', url, true);
	xhr.onload = function(){
		data = JSON.parse(this.responseText);
		callback(data);
	};
	xhr.send(null);
};


TrackboxWaypoint.prototype.showWaypoints = function() {
	var self = this;
	var waypoints = this.data.waypoints;
	var markers = [];

	Object.keys(waypoints).forEach(function(key){
		var pos = new google.maps.LatLng(waypoints[key].lat, waypoints[key].lon);
		markers.push(new TrackboxGoal(key, pos, self.map));
	});
		
	this._markerCluster = new MarkerClusterer(this.map, markers, {
		maxZoom: 15,
		minZoom: 15,
		gridSize: 128
	});
};

TrackboxWaypoint.prototype.showZoomgt = function(zoom) {
	this._markerCluster.setMaxZoom(zoom);
	this._markerCluster.setMinZoom(zoom);
	this._markerCluster.repaint();
};



TrackboxGoal.prototype = new google.maps.OverlayView();

function TrackboxGoal(name, pos, map) {
	this._name = name;
	this._pos = pos;
	this.map = map;
	this.setMap(map);
};

TrackboxGoal.prototype.getPosition = function() {
	return this._pos;
};

TrackboxGoal.prototype.getMap = function() {
	return this.map;
};


TrackboxGoal.prototype.onAdd = function() {
	this._div = document.createElement('div');

	this._div.style.position = 'absolute';
	this._div.style.width = '22px';
	this._div.style.height = '22px';

	this._div.innerHTML = '<svg width="22px" height="10px">' +
		'<circle cx="11" cy="5" r="3" stroke="#e91e63" stroke-width="2" fill="none" />' +
		'</svg>' +
		'<div style="width:22px; font-size:12px; text-align:center; line-height:1;">' + this._name + '</div>';

	var name = this._name;
	var lat = this._pos.lat();
	var lon = this._pos.lng();
	this._div.onclick = function () {
		$("#waypoint-info-name").text(name);
		$("#waypoint-info-add").attr("name", name);
		$("#waypoint-info-href").attr("href", "http://maps.google.com/maps?q="+ lat +","+ lon);
		$("#waypoint-info").openModal();	
	};

	var panes = this.getPanes();
	panes.overlayMouseTarget.appendChild(this._div);
};

TrackboxGoal.prototype.onRemove = function() {
	if (this._div && this._div.parentNode) {
		this._div.parentNode.removeChild(this._div);
		this._div = null;
	}
};

TrackboxGoal.prototype.draw = function() {
	var pos = this._getPosFromLatLng(this._pos);
	this._div.style.left = (pos.x - 11) + 'px';
	this._div.style.top = (pos.y - 5) + 'px';
};

TrackboxGoal.prototype._getPosFromLatLng = function(latlng) {
	return this.getProjection().fromLatLngToDivPixel(latlng);
};

