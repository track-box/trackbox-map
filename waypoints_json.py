"""
UTM goallist.txt to waypoint.json
"""

import os, sys
import csv
import json
from pyproj import Proj, transform


def createWaypointJson(waypoints, file):
    data = {
        'name': os.path.basename(file),
        'waypoints': waypoints
    }

    f = open('waypoint.json', 'w')
    f.write(json.dumps(data))
    f.close()


def readWaypointTextFile(file):
    waypoints = {}

    f = open(file)

    for row in csv.reader(f):
        print row
        if row[0] == 'WP':
            zone = int(row[3][0:2])
            p1 = Proj(proj='utm', zone=zone, datum='WGS84')
            p2 = Proj(proj='latlong', datum='WGS84')

            lon, lat = transform(p1, p2, row[4], row[5])

            print row[2], lat, lon
            waypoints[row[2]] = { 'lat':lat, 'lon':lon }

    f.close()

    print len(waypoints)
    return waypoints

if __name__ == '__main__':
    waypoints = readWaypointTextFile(sys.argv[1])
    createWaypointJson(waypoints, sys.argv[1])


