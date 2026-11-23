import json, re
from pathlib import Path
version = json.loads(Path('www/build-info.js').read_text().split('=',1)[1].rstrip(';\n'))
p = Path('android/app/build.gradle')
text = p.read_text()
text, codes = re.subn(r'versionCode\s+\d+', 'versionCode '+str(version['code']), text)
text, names = re.subn(r'versionName\s+"[^"]+"', 'versionName "'+version['name']+'"', text)
if codes != 1 or names != 1:
    raise RuntimeError('Não foi possível identificar a versão do APK.')
text, dependencies = re.subn(
    r'(?m)^dependencies\s*\{',
    "dependencies {\n    implementation 'com.google.mlkit:translate:17.0.3'"
    "\n    implementation 'com.google.mlkit:language-id:17.0.6'",
    text, count=1,
)
if dependencies != 1:
    raise RuntimeError('Não foi possível configurar a tradução.')
p.write_text(text)

variables = Path('android/variables.gradle')
android_sdk, minimum = re.subn(
    r'(minSdkVersion\s*=\s*)(\d+)',
    lambda match: match[1] + str(max(23, int(match[2]))),
    variables.read_text(), count=1,
)
if minimum != 1:
    raise RuntimeError('Não foi possível configurar a versão mínima do Android.')
variables.write_text(android_sdk)

p = Path('android/app/src/main/AndroidManifest.xml')
text = p.read_text()
if 'android.permission.POST_NOTIFICATIONS' not in text:
    text = text.replace('<application', '<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>\n    <application', 1)
p.write_text(text)

from shutil import copyfile
java_dir = p.parent / 'java/com/lume/leitura'
for java_file in Path('native/android').glob('*.java'):
    copyfile(java_file, java_dir / java_file.name)
receiver = '<receiver android:name=".ReadingTimerReceiver" android:exported="false" />'
p.write_text(text.replace('</application>', '    ' + receiver + '\n    </application>', 1))


# Atribuição oficial do modelo de tradução, disponível também sem internet.
from urllib.request import urlopen
badge = 'https://docs.cloud.google.com/static/translate/images/text-attribution.png'
with urlopen(badge, timeout=20) as response:
    image = response.read(65537)
if not image.startswith(b'\x89PNG\r\n\x1a\n') or len(image) > 65536:
    raise RuntimeError('A imagem de atribuição retornada pelo Google é inválida.')
Path('www/icones/google-translate-credit.png').write_bytes(image)
