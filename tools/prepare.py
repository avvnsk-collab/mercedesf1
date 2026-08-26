from pathlib import Path
import base64
import json
import shutil

ROOT = Path('build-src')
app = ROOT / 'app.json'
data = json.loads(app.read_text(encoding='utf-8'))

data['app']['appId'] = 710082602
data['app']['appName'] = 'Mercedes F1'
data['app']['description'] = 'Mercedes F1 watchface for Amazfit Balance 2'
data['app']['version'] = {'code': 1, 'name': '1.0.0'}
for lang in data.get('i18n', {}).values():
    if isinstance(lang, dict):
        lang['appName'] = 'Mercedes F1'
app.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

(ROOT / 'watchface').mkdir(parents=True, exist_ok=True)
shutil.copyfile('watchface/index.js', ROOT / 'watchface' / 'index.js')

assets = ROOT / 'assets'
assets.mkdir(parents=True, exist_ok=True)
b64 = Path('assets/mercedes_bg.b64').read_text(encoding='ascii').strip()
(assets / 'mercedes_bg.jpg').write_bytes(base64.b64decode(b64))

print('Prepared Mercedes F1')
print('appId:', data['app']['appId'])
print('appName:', data['app']['appName'])
