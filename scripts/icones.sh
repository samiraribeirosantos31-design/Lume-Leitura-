#!/bin/bash
# Gera os icones PNG a partir de www/icone.svg (web, iPhone e Android)
set -e
SVG=www/icone.svg
mkdir -p www/icones
rsvg-convert -w 192 -h 192 $SVG -o www/icones/icone-192.png
rsvg-convert -w 512 -h 512 $SVG -o www/icones/icone-512.png
rsvg-convert -w 180 -h 180 $SVG -o www/icones/apple-touch-icon.png
if [ -d android/app/src/main/res ]; then
  R=android/app/src/main/res
  mkdir -p $R/mipmap-anydpi-v26 $R/values
  for p in "mdpi 48 108" "hdpi 72 162" "xhdpi 96 216" "xxhdpi 144 324" "xxxhdpi 192 432"; do
    set -- $p
    mkdir -p $R/mipmap-$1
    rsvg-convert -w $2 -h $2 $SVG -o $R/mipmap-$1/ic_launcher.png
    rsvg-convert -w $2 -h $2 $SVG -o $R/mipmap-$1/ic_launcher_round.png
    rsvg-convert -w $3 -h $3 $SVG -o $R/mipmap-$1/lume_fg.png
  done
  echo '<?xml version="1.0" encoding="utf-8"?><resources><color name="lume_bg">#8E6FE0</color></resources>' > $R/values/lume_colors.xml
  A='<?xml version="1.0" encoding="utf-8"?><adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/lume_bg"/><foreground android:drawable="@mipmap/lume_fg"/></adaptive-icon>'
  echo "$A" > $R/mipmap-anydpi-v26/ic_launcher.xml
  echo "$A" > $R/mipmap-anydpi-v26/ic_launcher_round.xml
fi
echo "Icones gerados"
