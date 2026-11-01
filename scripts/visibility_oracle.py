#!/usr/bin/env python3
"""Independent foot-based vector intersection oracle for every exported TS case.

Uses general two-segment cross products and fractions.Fraction, rather than
the application's integer axis-aligned edge algorithm or its geometry exports.
"""
from fractions import Fraction as F
import json
import sys

rectangles = {
    'support': (F(-11, 8), F(20), F(11, 4), F(11, 4)),
    'wall': (F(5), F(31), F(4), F(4)),
    'pillar': (F(-2), F(91, 4), F(4), F(4)),
}
targets = {'wall': (F(7), F(33)), 'pillar': (F(0), F(99, 4))}
open_faces = {'closed': (), 'front': ('front',), 'left': ('left',), 'right': ('right',), 'sides': ('left', 'right')}

def cross(a, b):
    return a[0]*b[1] - a[1]*b[0]

def minus(a, b):
    return (a[0]-b[0], a[1]-b[1])

def intersection(a, b, c, d):
    r, s, offset = minus(b, a), minus(d, c), minus(c, a)
    denominator = cross(r, s)
    if denominator:
        t, u = cross(offset, s)/denominator, cross(offset, r)/denominator
        return t if 0 <= t <= 1 and 0 <= u <= 1 else None
    if cross(offset, r):
        return None
    axis = 0 if r[0] else 1
    bounds = sorted([(c[axis]-a[axis])/r[axis], (d[axis]-a[axis])/r[axis]])
    return max(F(0), bounds[0]) if bounds[1] >= 0 and bounds[0] <= 1 else None

def edges(record):
    for name, (x, y, w, h) in rectangles.items():
        candidates = [
            ('front', (x, y), (x+w, y)), ('back', (x, y+h), (x+w, y+h)),
            ('left', (x, y), (x, y+h)), ('right', (x+w, y), (x+w, y+h)),
        ]
        for face, a, b in candidates:
            if name == 'support' or face not in open_faces[record[name]]:
                yield name, face, a, b

def verify(case):
    eye = (F(case['station']), F(10))
    for actual in case['rays']:
        target = targets[actual['id']]
        hits = [(t, name, face) for name, face, a, b in edges(case)
                if (t := intersection(eye, target, a, b)) is not None]
        assert actual['visible'] == (not hits), case
        if hits:
            first = min(t for t, _, _ in hits)
            observed = actual['hit']
            assert F(observed['t']['n'], observed['t']['d']) == first, case
            # At a corner either tied face may be the first report.
            assert (first, observed['edge']['object'], observed['edge']['face']) in hits, case

if __name__ == '__main__':
    count = 0
    for line in sys.stdin:
        verify(json.loads(line))
        count += 2
    assert count == 2050, count
    print(json.dumps({'scope': 'Independent exact foot-based vector intersections; two samples at all 41 stations for all 25 face pairs', 'rays': count, 'allVisibilityAndFirstObstructionsAgree': True}, indent=2))
