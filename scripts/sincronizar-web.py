from pathlib import Path
import shutil
source = Path('www')
destination = Path('docs/teste')
destination.mkdir(parents=True, exist_ok=True)
for file in source.rglob('*'):
    if not file.is_file() or file.suffix == '.zip':
        continue
    target = destination / file.relative_to(source)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(file, target)
