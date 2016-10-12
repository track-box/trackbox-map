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
		self.showWaypoints();
	});
}


TrackboxWaypoint.prototype._loadJSON = function(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open('get', url, true);
	xhr.onload = function(){
		data = JSON.parse(this.responseText);
		callback(data);
	};
	xhr.send(null);
}


TrackboxWaypoint.prototype.showWaypoints = function() {
	var self = this;
	var waypoints = this.data.waypoints;
	var markers = [];

	Object.keys(waypoints).forEach(function(key){
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(waypoints[key].lat, waypoints[key].lon),
		});
		markers.push(marker);

	});
		
	this._markerCluster = new MarkerClusterer(this.map, markers, {
		maxZoom: 12,
		gridSize: 128
	});
}

