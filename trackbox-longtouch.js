TrackboxLongTouch.prototype = new google.maps.OverlayView();

function TrackboxLongTouch(map, goals, div_id, onShow) {
	this.map = map;
	this._goals = goals;
	this._onShow = onShow;

	this._initEvents(div_id);
	this.setMap(map);
};

TrackboxLongTouch.prototype.onAdd = function() {};
TrackboxLongTouch.prototype.draw = function() {};
TrackboxLongTouch.prototype.onRemove = function() {};

TrackboxLongTouch.prototype._initEvents = function(div_id) {
	var div = document.getElementById(div_id);
	var self = this;

	div.addEventListener("touchstart", function (e){ self._eventStart(e) });
	div.addEventListener("mousedown", function (e){ self._eventStart(e) });

	div.addEventListener("touchend", function (e){ self._eventStop(e) });
	div.addEventListener("mouseup", function (e){ self._eventStop(e) });
	div.addEventListener("mouseout", function (e){ self._eventStop(e) });
	
	this.map.addListener('drag', function (e){ self._eventStop(e) });
};


TrackboxLongTouch.prototype._eventStart = function(e) {
	this._touched = true;
	this._touch_time = 0;
	clearInterval(document.interval);

	var self = this;
	document.interval = setInterval(function(){
		self._touch_time += 100;
		if (self._touch_time == 1000) {
			var X, Y;
			if (e.type == "touchstart"){
				X = e.touches[0].clientX;
				Y = e.touches[0].clientY;

			}else{
				X = e.clientX;
				Y = e.clientY;
			}

			self.show(X, Y);
			clearInterval(document.interval);
		}
	}, 100)
};

TrackboxLongTouch.prototype._eventStop = function(e) {
	if (this._touched){
		clearInterval(document.interval);
	}

	var self = this;
	setTimeout(function(){
		self._touched = false;
	}, 200);
};

TrackboxLongTouch.prototype._getLatLng = function(x, y) {
	return this.getProjection().fromContainerPixelToLatLng(new google.maps.Point(x, y));
};

TrackboxLongTouch.prototype.show = function(x, y) {
	var pos = this._getLatLng(x, y);
	var marker = new google.maps.Marker({
		position: pos,
		map: this.map
	});

	var lat = pos.lat(), lng = pos.lng();

	var digit = this._goals._getDigit(lat, lng);

	var self = this;
	this._onShow({
		name: digit,
		lat: lat,
		lng: lng,
		onClose: function (){
			if (!self._touched){
				marker.setMap(null);
				return true;
			}
		}
	});
};

