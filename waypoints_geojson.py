import os, sys
import json


def main(file):
    waypoints = {}

    with open(file, 'r') as f:
        geojson = json.load(f)
        for feature in geojson['features']:
            lat = feature['geometry']['coordinates'][1]
            lon = feature['geometry']['coordinates'][0]
            name = feature['properties']['name']
            print(name, lat, lon)

            waypoints[name] = { 'lat': lat, 'lon': lon }

    data = {
        'name': '',
        'waypoints': waypoints
    }

    with open('waypoint.json', 'w') as f:
        f.write(json.dumps(data))

if __name__ == '__main__':
    main(sys.argv[1])
