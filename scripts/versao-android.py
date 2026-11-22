import json, re
from pathlib import Path
version = json.loads(Path('www/build-info.js').read_text().split('=',1)[1].rstrip(';\n'))
p = Path('android/app/build.gradle')
text = p.read_text()
text, codes = re.subn(r'versionCode\s+\d+', 'versionCode '+str(version['code']), text)
text, names = re.subn(r'versionName\s+"[^"]+"', 'versionName "'+version['name']+'"', text)
if codes != 1 or names != 1:
    raise RuntimeError('Não foi possível identificar a versão do APK.')
p.write_text(text)
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
