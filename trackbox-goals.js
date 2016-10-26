/*
 * TrackboxGoals - trackbox goals management class
 *
 *  use materialize, google maps
 *
 */

/** @constructor */
function TrackboxGoals(map, waypoints) {
	this.map = map;
	this._waypoint = waypoints;

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

	}else{
		Materialize.toast("error!", 1000);
	}
};


TrackboxGoals.prototype._addPoint = function(name, lat, lon) {
	this._goals[name] = true;

	var pos = new google.maps.LatLng(lat, lon);
	var marker = new google.maps.Marker({
		position: pos, 
		map: this.map
	});
	
	this.map.setZoom(14);
	this.map.panTo(pos);

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


	this._goals[name] = {
		pos: pos,
		marker: marker,
		table: row1,
		sheet: row2	
	};
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

