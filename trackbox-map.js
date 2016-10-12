/*
 * TrackboxMap - trackbox map class based on Google Maps
 *
 * ref. Overlay map types
 * https://developers.google.com/maps/documentation/javascript/examples/maptype-overlay
 *
 */

/** @constructor */
function TrackboxMap(def) {
	this.tileSize = new google.maps.Size(256, 256);
	this.maxZoom = 21;
	this.name = def.name;
	this.alt = '';

	this._def = def;

	this._tileBounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(def.bounds[0][0], def.bounds[0][1]),
		new google.maps.LatLng(def.bounds[1][0], def.bounds[1][1]));

	this._retina = window.devicePixelRatio >= 2;
}

TrackboxMap.prototype.addTo = function(map) {
	this.map = map;

	map.fitBounds(this._tileBounds);

	this._setOverlayControl();

	map.mapTypes.set(this._def.name, this);
	//map.setMapTypeId(this._def.name);
	map.overlayMapTypes.insertAt(0, this);
	this._show = true;
};


TrackboxMap.prototype.getTile = function(coord, zoom, owner) {
	var tileBounds = this._tileCoordsToBounds(coord, zoom);

	if (tileBounds.intersects(this._tileBounds)){
		if (zoom >= this._def.zoom.min && zoom <= this._def.zoom.max){

			if (this._retina && zoom < this._def.zoom.max){
				var tile = owner.createElement('div');
				tile.style.width = this.tileSize.width + 'px';
				tile.style.height = this.tileSize.height + 'px';

				this._createRetinaTile(tile, coord, zoom + 1, 0, 0);
				this._createRetinaTile(tile, coord, zoom + 1, 0, 1);
				this._createRetinaTile(tile, coord, zoom + 1, 1, 0);
				this._createRetinaTile(tile, coord, zoom + 1, 1, 1);

				return tile;				

			}else{
				var tile = owner.createElement('img');
				tile.alt = '';

				tile.src = this._getTileUrl(coord, zoom);
				tile.style.width = this.tileSize.width + 'px';
				tile.style.height = this.tileSize.height + 'px';

				return tile;
			}
		}
	}
	
	var tile = owner.createElement('img');
	tile.alt = '';
	return tile;
};


TrackboxMap.prototype._createRetinaTile = function(tile, coord, zoom, px, py) {
	var coord1 = { x: coord.x * 2 + px, y: coord.y * 2 + py };
	var tileBounds = this._tileCoordsToBounds(coord1, zoom);

	if (tileBounds.intersects(this._tileBounds)){
		var tile1 = document.createElement('img');
		tile1.src = this._getTileUrl(coord1, zoom);
		tile1.style.width = (this.tileSize.width / 2) + 'px';
		tile1.style.height = (this.tileSize.height / 2) + 'px';
		tile1.style.position = 'absolute';
		tile1.style.top = (this.tileSize.width / 2 * py) + 'px';
		tile1.style.left = (this.tileSize.height / 2 * px) + 'px';

		tile.appendChild(tile1);
	}
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
	controlUI.style.marginLeft = '-11px';
	controlUI.style.padding = '7px';
	controlUI.style.height = '11px';
	controlUI.style.textAlign = 'center';
	controlUI.style.color = 'rgb(25,25,25)';
	controlUI.style.fontSize = '11px';
	controlUI.style.position = 'relative';
	controlUI.innerHTML = this._def.name;
	
	if (this._retina){
	   	controlUI.style.padding = '12px 7px';
		controlUI.style.height = '12px';
	}

	div.appendChild(controlUI);

	var self = this;
	controlUI.addEventListener('click', function() {
		self._toggle();
	});

	this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(div);
};


TrackboxMap.prototype._toggle = function() {
	if (this._show){
		this.map.overlayMapTypes.removeAt(0);
	}else{
		this.map.overlayMapTypes.insertAt(0, this);
	}
	this._show = !this._show;
};

