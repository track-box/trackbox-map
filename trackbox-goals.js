/*
 * TrackboxGoals - trackbox goals management class
 *
 *  use 
 *  	materialize
 *  	google maps
 *  	proj4
 *
 */

/** @constructor */
function TrackboxGoals(map, trackboxMap) {
	this.map = map;
	this._waypoint = trackboxMap._waypoint;

	this._utm = trackboxMap._def.utm;
	this._utm.xbase = Math.floor(this._utm.xmax / 100000) * 100000;
	this._utm.ybase = Math.floor(this._utm.ymax / 100000) * 100000;

	this._goals = {};
	
	this._table = document.getElementById("goal-table-table");
	this._sheet = document.getElementById("goal-sheet-table");
}

TrackboxGoals.prototype.addGoal = function(x) {
	console.log(x);
	if (!x){
		return;
	}

	if (this._goals[x]){
		return;
	}

	if (x.length == 3){
		if (this._waypoint.data.waypoints[x]){
			var w = this._waypoint.data.waypoints[x];
			this._addPoint(x, w.lat, w.lon);

		}else{
			Materialize.toast("not found", 1000);
		}
	}else if (x.length == 8){
		var latlon = this._getDigitLatLon(x);
		this._addPoint(x, latlon.lat, latlon.lon);

	}else{
		Materialize.toast("error!", 1000);
	}
};

TrackboxGoals.prototype._getDigitLatLon = function(digit) {
	var dx = parseInt(digit.substr(0, 4));
	var dy = parseInt(digit.substr(4, 4));

	var x = this._utm.xbase + dx * 10;
	var y = this._utm.ybase + dy * 10;

	if (x > this._utm.xmax) x -= 1000000;
	if (y > this._utm.ymax) y -= 1000000;

	var utm = "+proj=utm +zone=" + this._utm.zone;
	var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

	var pos = proj4(utm, wgs84, [x, y]);

	return { lat: pos[1], lon: pos[0] };
};

TrackboxGoals.prototype._addPoint = function(name, lat, lon) {
	this._goals[name] = true;

	var pos = new google.maps.LatLng(lat, lon);
	var marker = new google.maps.Marker({
		position: pos, 
		map: this.map
	});
	
	this._showGoal(pos);

	var row1 = this._table.insertRow(-1);
	row1.insertCell(-1).innerHTML = name;
	row1.insertCell(-1).innerHTML = "...";
	row1.insertCell(-1).innerHTML = "...";

	var row2 = this._sheet.insertRow(-1);
	row2.insertCell(-1).innerHTML = name;
	row2.insertCell(-1).innerHTML = "...";
	row2.insertCell(-1).innerHTML = "...";
	var del = row2.insertCell(-1)
	del.innerHTML = '<i class="material-icons tiny" style="margin:6px;">clear<i>';

	var self = this;
	del.onclick = function () { self.deleteGoal(name); };
	row2.onclick = function () { self._showGoal(pos); };


	this._goals[name] = {
		pos: pos,
		marker: marker,
		table: row1,
		sheet: row2	
	};
};


TrackboxGoals.prototype._showGoal = function(pos) {
	this.map.setZoom(14);
	this.map.panTo(pos);
};

TrackboxGoals.prototype.updatePosition = function(position) {

};


TrackboxGoals.prototype.deleteGoal = function(name) {
	if (this._goals[name]){
		var goal = this._goals[name];

		goal.marker.setMap(null);
		this._table.deleteRow(goal.table.sectionRowIndex);
		this._sheet.deleteRow(goal.sheet.sectionRowIndex);

		delete this._goals[name];
	}
};

