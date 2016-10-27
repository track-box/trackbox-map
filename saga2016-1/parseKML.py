# -*- coding: utf-8 -*-

import os, sys
from xml.etree.ElementTree import *
import json


if __name__ == '__main__':
    file  = sys.argv[1]
    xml = parse(file)
    root = xml.getroot()

    goals = {}

    # name
    # lat
    # lon
    # rank S, A, B, deleted
    # comment 障害物なし | 小クリーク | 大クリークor電線 | レンコン | 削除 

    for p in root[0][2][1:]:
        name = p.findtext('name')
        style = p.findtext('styleUrl')
        coord = p.findtext('Point/coordinates')
        coords = str(coord).split(',')
        comment = ''
        name_comment = ''
        rank = ''

        lat = coords[0]
        lon = coords[1]

        name_num = name[0:3]
        if len(name) > 3:
            name_comment = name[4:]

        if style == '#icon-503-DB4436-nodesc':
            # red B
            rank = 'B'
            comment = name_comment

        elif style == '#icon-503-F4EB37-nodesc':
            # yellow S, A
            if name_comment == 'S':
                rank = 'S'
                comment = name_comment

            else:
                rank = 'A'
                comment = name_comment

        elif style == '#icon-503-000000-nodesc':
            # black deleted
            rank = 'D'
            comment = name_comment

        goals[name_num] = {
            'lat': float(lat),
            'lon': float(lon),
            'rank': rank,
            'comment': comment
        }

    data = {
        'name': '2016Saga',
        'waypoints': goals
    }

    f = open('waypoint2.json', 'w')
    text = json.dumps(data, ensure_ascii=False)
    f.write(text.encode("utf-8"))
    f.close()


