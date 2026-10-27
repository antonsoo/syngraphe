#!/usr/bin/env python3
"""Independently check the exported TS model with Python's exact Fraction."""
import json
import sys
from fractions import Fraction

x = json.load(sys.stdin)
widths = 0
for row in x['widths']:
    clear = Fraction(15) - Fraction(11, 4) if row['side'] == 'inclusive' else Fraction(15)
    total = 2 * Fraction(5, 2) + 2 * clear + 2 * Fraction(11, 4) + 20
    a = row['account']
    assert a == dict(clear=int(clear * 16), side=int((clear + Fraction(11, 4)) * 16), total=int(total * 16), excess=int((total - 55) * 16), matches=(total == 55))
    widths += 1
heights = 0
for row in x['heights']:
    first, capital = row['first'], Fraction(row['capital'], 16)
    shaft = first + 6 * 4
    total = shaft + capital
    assert row['account'] == dict(shaft=shaft * 16, total=int(total * 16), inferredCapital=(30 - shaft) * 16, excess=int((total - 30) * 16), matches=(total == 30), firstMatches=(first == 5))
    heights += 1

def exact(v):
    return Fraction(v['n'], v['d'])

positions = 0
for row in x['grids']:
    gap, a = Fraction(row['gap'], 16), row['account']
    # Derive centre positions from each end independently, in feet.
    start = Fraction(5, 2) + gap + Fraction(11, 8)
    end = 400 - Fraction(5, 2) - gap - Fraction(11, 8)
    spacing = (end - start) / 34
    assert exact(a['spacing']) / 16 == spacing
    assert exact(a['clearBay']) / 16 == spacing - Fraction(11, 4)
    assert exact(a['first']) / 16 == start
    assert exact(a['last']) / 16 == end
    assert len(a['centers']) == 35
    centers = [exact(v) / 16 for v in a['centers']]
    for i, c in enumerate(centers):
        assert c == start + i * spacing
        assert c + centers[-i-1] == 400
        assert Fraction(5, 2) < c - Fraction(11, 8)
        assert c + Fraction(11, 8) < 400 - Fraction(5, 2)
        if i:
            assert c - centers[i-1] == spacing > Fraction(11, 4)
        positions += 1
assert widths == 2 and heights == 130 and positions == 4515
print(json.dumps({'oracle':'Python fractions.Fraction, independent foot-based formulas','widthReadings':widths,'firstSegmentCapitalCombinations':heights,'endGaps':len(x['grids']),'exactSupportPositions':positions,'checks':['inclusive width closure','total matching with wrong segment exception','residual capital versus prescribed total','count','equal spacing','symmetry','non-overlap','both end clearances']},indent=2))
