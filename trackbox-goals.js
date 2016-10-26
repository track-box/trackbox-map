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

	if (window.location.hash){
		this._initGoals(window.location.hash);
	}
}

TrackboxGoals.prototype.addGoal = function(x, noshow) {
	if (!x){
		return;
	}

	if (this._goals[x]){
		return;
	}

	if (x.length == 3){
		if (this._waypoint.data.waypoints[x]){
			var w = this._waypoint.data.waypoints[x];
			this._addPoint(x, w.lat, w.lon, noshow);

		}else{
			Materialize.toast("not found", 1000);
		}
	}else if (x.length == 8){
		var latlon = this._getDigitLatLon(x);
		this._addPoint(x, latlon.lat, latlon.lon, noshow);

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

TrackboxGoals.prototype._getDigit = function(lat, lon) {
	var utm = "+proj=utm +zone=" + this._utm.zone;
	var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

	var pos = proj4(wgs84, utm, [lon, lat]);

	var x = Math.floor(pos[0] / 10);
	var y = Math.floor(pos[1] / 10);

	var dx = x % 10000;
	var dy = y % 10000;

	return "" + dx + dy;
};

TrackboxGoals.prototype._addPoint = function(name, lat, lon, noshow) {
	this._goals[name] = true;
	this._updateHash();

	var pos = new google.maps.LatLng(lat, lon);
	var marker = new google.maps.Marker({
		position: pos, 
		map: this.map
	});
	
	if (!noshow) this._showGoal(pos);

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
	marker.addListener('click', function() {
		self._showMarkerInfo(name);
	});


	this._goals[name] = {
		pos: pos,
		marker: marker,
		table: row1,
		sheet: row2	
	};

	this.updatePosition();
};


TrackboxGoals.prototype._showMarkerInfo = function(name) {
	if (this._goals[name]){
		var goal = this._goals[name];
		var lat = goal.pos.lat();
		var lon = goal.pos.lng();
		$("#marker-info-name").text(name);
		$("#marker-info-href").attr("href", "http://maps.google.com/maps?q="+ lat +","+ lon);
		$("#marker-info").openModal();
	}
};

TrackboxGoals.prototype._showGoal = function(pos) {
	this.map.setZoom(14);
	this.map.panTo(pos);
};

TrackboxGoals.prototype.updatePosition = function(position) {
	if (position){
		this._lastPosition = position;

		for (var key in this._goals){
			var goal = this._goals[key];

			var distance = google.maps.geometry.spherical.computeDistanceBetween(position, goal.pos);
			var heading = google.maps.geometry.spherical.computeHeading(position, goal.pos);

			if (heading < 0) heading += 360;

			var d = Math.round(distance) + "m";
			var head = Math.round(heading) + "°";

			goal.table.cells[1].innerHTML = d;
			goal.sheet.cells[1].innerHTML = d;
			goal.table.cells[2].innerHTML = head;
			goal.sheet.cells[2].innerHTML = head;
		}
	}else if (this._lastPosition){
		this.updatePosition(this._lastPosition);
	}
};


TrackboxGoals.prototype.deleteGoal = function(name) {
	if (this._goals[name]){
		var goal = this._goals[name];

		goal.marker.setMap(null);
		this._table.deleteRow(goal.table.sectionRowIndex);
		this._sheet.deleteRow(goal.sheet.sectionRowIndex);

		delete this._goals[name];
		this._updateHash();
	}
};

TrackboxGoals.prototype.reset = function() {
	for (var key in this._goals){
		this.deleteGoal(key);
	}
};


TrackboxGoals.prototype._updateHash = function() {
	window.location.hash = Object.keys(this._goals).join(",");
};

TrackboxGoals.prototype._initGoals = function(hash) {
	var goals = hash.substr(1).split(",");
	var self = this;
	this._waypoint._onloadForGoals = function (){
		
		if (goals.length > 1){
			for (var i in goals){
				self.addGoal(goals[i], true);
			}

		}else{
			self.addGoal(goals[0]);
			self._showMarkerInfo(goals[0]);
		}
	};
};

