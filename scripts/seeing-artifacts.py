#!/usr/bin/env python3
"""Inspect actual native downloads, embedded source bytes and printed content."""
import base64
import csv
import hashlib
from html import unescape
from html.parser import HTMLParser
import io
import json
from pathlib import Path
import re
import subprocess
import sys
import unicodedata
from urllib.parse import unquote
import xml.etree.ElementTree as ET

from visibility_oracle import F, edges, intersection, targets

root = Path(sys.argv[1])
manifest = json.loads(Path('public/sources/manifest.json').read_text())
pages = [next(p for p in manifest['pages'] if p['pdfPage'] == n) for n in (15, 34, 40, 41)]
sha = lambda b: hashlib.sha256(b).hexdigest()

class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images, self.links, self.remote, self.text = [], {}, [], []
        self.scripts = 0
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'img': self.images.append(attrs['src'])
        if tag == 'script': self.scripts += 1
        if tag == 'a' and attrs.get('download'): self.links[attrs['download']] = attrs['href']
        if tag in ('img', 'script', 'link', 'iframe', 'audio', 'video'):
            for key in ('src', 'href'):
                if attrs.get(key, '').startswith(('http:', 'https:', '//')): self.remote.append(attrs[key])
    def handle_data(self, text): self.text.append(text)

def csv_audit(content, state):
    rows = list(csv.DictReader(io.StringIO(content)))
    assert len(rows) == 82
    for index, r in enumerate(rows):
        station, sample = index // 2 - 20, 'wall' if index % 2 == 0 else 'pillar'
        assert int(r['station_ft']) == station and r['sample'] == sample
        assert r['scope'] == 'illustrative-sightlines'
        assert r['wall_opening'] == state['wall'] and r['pillar_opening'] == state['pillar']
        assert (r['wall_clause_matches'] == 'true') == (state['wall'] == 'front')
        assert (r['pillar_clause_matches'] == 'true') == (state['pillar'] == 'sides')
        eye = (F(station), F(10))
        hits = [(t, name, face) for name, face, a, b in edges(state)
                if (t := intersection(eye, targets[sample], a, b)) is not None]
        assert (r['visible'] == 'true') == (not hits), r
        if hits:
            first = min(t for t, _, _ in hits)
            assert (first, r['first_obstruction'], r['closed_face']) in hits, r
        else: assert not r['first_obstruction'] and not r['closed_face']
    return len(rows)

def html_audit(file):
    html = file.read_text()
    p = Parser(); p.feed(html)
    assert p.scripts == 0 and p.remote == [] and len(p.images) == 4
    for url, entry in zip(p.images, pages, strict=True):
        data = base64.b64decode(url.split(',', 1)[1])
        assert data == Path('public/sources', entry['file']).read_bytes()
        assert len(data) == entry['bytes'] and sha(data) == entry['sha256']
    font = re.search(r"src:url\('data:font/ttf;base64,([^']+)'\)", html)
    assert font and base64.b64decode(font[1]) == Path('public/fonts/NotoSerif-Regular.ttf').read_bytes()
    text = ''.join(p.text)
    for license_file in ['public/fonts/OFL.txt', 'LICENSE']: assert Path(license_file).read_text() in text
    embedded = {name: unquote(url.split(',', 1)[1]) for name, url in p.links.items()}
    state = json.loads(embedded['syngraphe-sightline.json'])['state']
    csv_audit(embedded['syngraphe-stations.csv'], state)
    svg = ET.fromstring(embedded['syngraphe-sightline.svg'])
    assert svg.tag == '{http://www.w3.org/2000/svg}svg'
    assert not svg.findall('.//{http://www.w3.org/2000/svg}script')
    assert not svg.findall('.//{http://www.w3.org/2000/svg}image')
    assert 'does not establish visibility of all equipment' in text
    return html, embedded, {'bytes': file.stat().st_size, 'sha256': sha(file.read_bytes()), 'wholeSourceImages': 4, 'sourceFontAndLicenseBytesMatch': True}

reports = []
for folder in sorted(root.iterdir()):
    if not folder.is_dir() or not (folder/'study.json').exists(): continue
    record = json.loads((folder/'study.json').read_text())
    assert record['format'] == 'syngraphe-sightline' and record['scope'] == 'illustrative-sightlines'
    rows = csv_audit((folder/'stations.csv').read_text(), record['state'])
    html, embedded, info = html_audit(folder/'reading.html')
    _, _, offline = html_audit(folder/'offline-reading.html')
    for native, name in [('study.json', 'syngraphe-sightline.json'), ('stations.csv', 'syngraphe-stations.csv'), ('study.svg', 'syngraphe-sightline.svg')]:
        assert (folder/native).read_bytes().decode() == embedded[name]
        assert (folder/native).read_bytes() == (folder/f'embedded-{native}').read_bytes()
    reports.append({'configuration': folder.name, 'independentlyCheckedStationRows': rows, 'html': info, 'offlineHtml': offline, 'nativeEmbeddedDownloadsIdentical': True})
assert len(reports) == 4

pdf = root/'chromium-1440/reading.pdf'
raw = subprocess.check_output(['pdftotext', '-layout', str(pdf), '-']).decode()
normalize = lambda text: ' '.join(unicodedata.normalize('NFC', text).split())
pdftext = normalize(raw)
html = (root/'chromium-1440/reading.html').read_text()
pairs = re.findall(r'<p class="greek" lang="grc">(.*?)</p><p>(.*?)</p>', html)
assert len(pairs) == 5
for pair in pairs:
    for passage in pair: assert normalize(unescape(passage)) in pdftext, passage
notes = re.findall(r'<dd>(.*?)</dd>', html)
assert len(notes) == 15
for note in notes:
    p = Parser(); p.feed(note)
    assert normalize(''.join(p.text)) in pdftext, note
for page in pages: assert normalize(page['label']) in pdftext, page['label']
assert 'one hundred and thirty-four' in pdftext
assert 'Anthony Mercer' in pdftext and 'Anton Soloviev' not in pdftext
bbox = root/'pdf-bbox.xhtml'
subprocess.run(['pdftotext', '-bbox', str(pdf), str(bbox)], check=True)
tree = ET.parse(bbox); ns = {'h': 'http://www.w3.org/1999/xhtml'}
pdfpages = tree.findall('.//h:page', ns)
words = tree.findall('.//h:word', ns)
for page in pdfpages:
    w, h = float(page.attrib['width']), float(page.attrib['height'])
    for word in page.findall('.//h:word', ns):
        assert 35 <= float(word.attrib['xMin']) and float(word.attrib['xMax']) <= w-35, word.text
        assert 35 <= float(word.attrib['yMin']) and float(word.attrib['yMax']) <= h-35, word.text
print(json.dumps({'scope': 'Actual browser downloads; independent vector oracle; embedded binary identity; complete PDF language and margin checks', 'configurations': reports, 'pdf': {'pages': len(pdfpages), 'completeGreekAndEnglishPassages': len(pairs)*2, 'completeWordNotes': len(notes), 'sourceCaptions': 4, 'wordsWithinMargins': len(words), 'sha256': sha(pdf.read_bytes()), 'untaggedPhysicalPrinterUnverified': True}}, indent=2))
