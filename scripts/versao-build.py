import json, os
from pathlib import Path
run = int(os.environ['GITHUB_RUN_NUMBER'])
version = {'code': 1000 + run, 'name': '1.1.' + str(run)}
Path('www/build-info.js').write_text('window.LUME_BUILD=' + json.dumps(version) + ';\n')
Path('release-notes.txt').write_text(
    'Lume Leitura ' + version['name'] +
    '\n\nDownload e instruções de instalação e atualização:\n'
    'https://samiraribeirosantos31-design.github.io/Lume-Leitura-/\n\n'
    '<!-- LUME_BUILD_CODE=' + str(version['code']) +
    ' LUME_VERSION=' + version['name'] + ' -->\n')
