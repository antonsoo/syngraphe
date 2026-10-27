#!/usr/bin/env python3
"""Fetch the pinned PD volume, reproduce whole-page renders and compare bytes."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import urllib.request

manifest = json.loads(Path('public/sources/manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='syngraphe-sources-') as tmp:
    root = Path(tmp)
    pdf = root / 'choisy.pdf'
    urllib.request.urlretrieve(manifest['pdf'], pdf)
    data = pdf.read_bytes()
    assert len(data) == manifest['pdfBytes']
    assert hashlib.sha256(data).hexdigest() == manifest['pdfSha256']
    version = subprocess.run(['pdftoppm','-v'],capture_output=True,text=True,check=True).stderr.splitlines()[0]
    renders=[]
    for p in manifest['pages']:
        n=str(p['pdfPage'])
        subprocess.run(['pdftoppm','-f',n,'-l',n,'-scale-to','2500','-jpeg','-jpegopt','quality=88',str(pdf),str(root/'page')],check=True)
        actual = (root / f'page-{int(n):03}.jpg').read_bytes()
        retained = Path('public/sources',p['file']).read_bytes()
        assert actual == retained, f'Render differs at PDF {n}; compare Poppler version before updating any source identity.'
        assert len(actual)==p['bytes'] and hashlib.sha256(actual).hexdigest()==p['sha256']
        renders.append({'pdfPage':int(n),'file':p['file'],'bytes':len(actual),'sha256':p['sha256']})
    print(json.dumps({'source':manifest['pdf'],'pdfBytes':len(data),'pdfSha256':manifest['pdfSha256'],'renderer':version,'wholePages':renders},indent=2))
