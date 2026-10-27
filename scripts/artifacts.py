#!/usr/bin/env python3
"""Audit real downloads independently: exact CSV, embedded bytes, SVG and PDF."""
import base64
import csv
from fractions import Fraction
import hashlib
from html.parser import HTMLParser
from html import unescape
import io
import json
from pathlib import Path
import re
import subprocess
import sys
import unicodedata
from urllib.parse import unquote
import xml.etree.ElementTree as ET

root = Path(sys.argv[1])
manifest = json.loads(Path('public/sources/manifest.json').read_text())
sha = lambda b: hashlib.sha256(b).hexdigest()

class ReadingParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
        self.links = {}
        self.scripts = 0
        self.remote = []
        self.text = []
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == 'script': self.scripts += 1
        if tag == 'img': self.images.append(d['src'])
        if tag == 'a' and d.get('download'): self.links[d['download']] = d['href']
        if tag in ('img','script','link','iframe','audio','video'):
            for key in ('src','href'):
                if d.get(key,'').startswith(('https:','http:','//')): self.remote.append(d[key])
    def handle_data(self, data): self.text.append(data)

def csv_audit(file, plan):
    rows = list(csv.DictReader(io.StringIO(file.read_text())))
    assert len(rows) == 44
    s = plan['state']
    values = {}
    for r in rows:
        assert r['scope'] == 'selected-clauses'
        assert r['side_reading'] == s['side']
        assert int(r['first_segment_ft']) == s['first']
        assert int(r['capital_fingers']) == s['capital']
        assert int(r['end_gap_fingers']) == s['endGap']
        values[r['item']] = Fraction(int(r['value_fingers_numerator']),int(r['value_fingers_denominator'])) / 16
    clear = 15 - Fraction(11,4) if s['side']=='inclusive' else Fraction(15)
    assert values['outer_width_model'] == 2*Fraction(5,2)+2*clear+2*Fraction(11,4)+20
    assert values['outer_width_prescribed'] == 55
    assert values['side_clear_model'] == clear
    shaft = s['first'] + 6*4
    assert values['shaft_height_model'] == shaft
    assert values['total_height_model'] == shaft + Fraction(s['capital'],16)
    assert values['total_height_prescribed'] == 30
    assert values['capital_height_inferred'] == 30-shaft
    first = Fraction(5,2)+Fraction(s['endGap'],16)+Fraction(11,8)
    last = 400-first
    spacing=(last-first)/34
    assert values['uniform_grid_spacing']==spacing
    assert values['uniform_grid_clear_bay']==spacing-Fraction(11,4)
    for i in range(35): assert values[f'support_{i+1}_center_from_outer_end']==first+i*spacing
    return len(rows)

def html_audit(file, plan):
    html=file.read_text();p=ReadingParser();p.feed(html)
    assert p.scripts==0 and not p.remote and len(p.images)==10
    for src,entry in zip(p.images,manifest['pages'],strict=True):
        data=base64.b64decode(src.split(',',1)[1]);assert len(data)==entry['bytes'] and sha(data)==entry['sha256']
        assert data==Path('public/sources',entry['file']).read_bytes()
    font=re.search(r"src:url\('data:font/ttf;base64,([^']+)'\)",html)
    assert font and base64.b64decode(font[1])==Path('public/fonts/NotoSerif-Regular.ttf').read_bytes()
    text=''.join(p.text)
    assert Path('public/fonts/OFL.txt').read_text() in text
    assert Path('LICENSE').read_text() in text
    embedded={name:unquote(url.split(',',1)[1]) for name,url in p.links.items()}
    assert json.loads(embedded['syngraphe-plan.json'])==plan
    assert 'selected-clauses' in embedded['syngraphe-measurements.csv']
    assert 'modern' in embedded['syngraphe-study.svg'].lower()
    assert 'not a complete reconstruction' in text
    return {'sha256':sha(file.read_bytes()),'bytes':file.stat().st_size,'wholeSourceImages':10,'fontAndLicensesMatch':True}

reports=[]
for folder in sorted(root.iterdir()):
    if not folder.is_dir() or not (folder/'plan.json').exists():continue
    p=json.loads((folder/'plan.json').read_text());op=json.loads((folder/'offline-plan.json').read_text())
    rows=csv_audit(folder/'measurements.csv',p);orows=csv_audit(folder/'offline-measurements.csv',op)
    h=html_audit(folder/'reading.html',p);oh=html_audit(folder/'offline-reading.html',op)
    for a,b in [('plan.json','embedded-plan.json'),('measurements.csv','embedded-measurements.csv'),('study.svg','embedded-study.svg')]:assert(folder/a).read_bytes()==(folder/b).read_bytes()
    svg=ET.fromstring((folder/'study.svg').read_text());assert svg.tag=='{http://www.w3.org/2000/svg}svg'
    assert not svg.findall('.//{http://www.w3.org/2000/svg}script')
    assert not svg.findall('.//{http://www.w3.org/2000/svg}image')
    assert svg.attrib['viewBox']=='0 0 1200 1000'
    reports.append({'configuration':folder.name,'rows':rows,'offlineRows':orows,'exactCentersEach':35,'html':h,'offlineHtml':oh,'nativeEmbeddedDownloadsIdentical':True})
assert len(reports)==4
pdf=root/'chromium-1440/reading.pdf'
raw=subprocess.check_output(['pdftotext','-layout',str(pdf),'-']).decode()
# Native HTML's language passages are the reference content, not the model engine.
p=ReadingParser();p.feed((root/'chromium-1440/reading.html').read_text())
html=(root/'chromium-1440/reading.html').read_text()
normalize=lambda s:' '.join(unicodedata.normalize('NFC',s).split())
pairs=re.findall(r'<p lang="grc" class="greek">(.*?)</p><p>(.*?)</p><p>',html)
pdftext=normalize(raw)
assert len(pairs)==8
for pair in pairs:
    for passage in pair:
        assert normalize(unescape(passage)) in pdftext,passage
notes=re.findall(r'<dd>(.*?)</dd>',html)
assert len(notes)==22
for note in notes:
    parser=ReadingParser();parser.feed(note)
    assert normalize(''.join(parser.text)) in pdftext, note
passages=[p[0] for p in pairs]
for label in [p['label'] for p in manifest['pages']]:assert normalize(label) in pdftext,label
for phrase in ['including the walls','including the thickness of the pillar','Thirty-five','twenty feet','five half-feet','three palms','including the capital','but the first']:
 assert phrase.casefold() in pdftext.casefold(),phrase
bbox=root/'pdf-bbox.xhtml';subprocess.run(['pdftotext','-bbox',str(pdf),str(bbox)],check=True)
tree=ET.parse(bbox);ns={'h':'http://www.w3.org/1999/xhtml'};words=tree.findall('.//h:word',ns);pages=tree.findall('.//h:page',ns)
for page in pages:
 w,h=float(page.attrib['width']),float(page.attrib['height'])
 for word in page.findall('.//h:word',ns):
  assert float(word.attrib['xMin'])>=35 and float(word.attrib['xMax'])<=w-35,word.text
  assert float(word.attrib['yMin'])>=35 and float(word.attrib['yMax'])<=h-35,word.text
print(json.dumps({'scope':'Actual downloaded native files, independent exact fractions, embedded source/font/license identities and print extraction','configurations':reports,'pdf':{'pages':len(pages),'completeGreekAndEnglishPassages':len(pairs)*2,'completeContextualWordNotes':len(notes),'sourceCaptions':len(manifest['pages']),'wordsWithinMargins':len(words),'sha256':sha(pdf.read_bytes()),'untaggedPhysicalPrinterUnverified':True}},indent=2))
