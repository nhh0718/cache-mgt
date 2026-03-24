#!/bin/bash
# Generate cookie icon at given size $1, output to $2
SIZE=$1
OUT=$2
HALF=$((SIZE/2))
R=$((SIZE/2 - 1))       # outer edge
R2=$((SIZE*47/100))      # inner baked area
CHIP=8                   # base chip size, scaled

magick -size ${SIZE}x${SIZE} xc:none \
  -fill '#C97A1A' -draw "circle ${HALF},${HALF} ${HALF},1" \
  -fill '#DDA025' -draw "circle ${HALF},${HALF} ${HALF},$(( SIZE*7/100 ))" \
  -fill '#E8B340' -draw "circle ${HALF},${HALF} ${HALF},$(( SIZE*14/100 ))" \
  -fill '#4A200E' -draw "ellipse $(( SIZE*30/100 )),$(( SIZE*33/100 )) $(( SIZE*8/100 )),$(( SIZE*7/100 )) 0,360" \
  -fill '#4A200E' -draw "ellipse $(( SIZE*62/100 )),$(( SIZE*29/100 )) $(( SIZE*7/100 )),$(( SIZE*6/100 )) 0,360" \
  -fill '#4A200E' -draw "ellipse $(( SIZE*46/100 )),$(( SIZE*56/100 )) $(( SIZE*9/100 )),$(( SIZE*8/100 )) 0,360" \
  -fill '#4A200E' -draw "ellipse $(( SIZE*29/100 )),$(( SIZE*62/100 )) $(( SIZE*6/100 )),$(( SIZE*5/100 )) 0,360" \
  -fill '#4A200E' -draw "ellipse $(( SIZE*68/100 )),$(( SIZE*54/100 )) $(( SIZE*7/100 )),$(( SIZE*6/100 )) 0,360" \
  -fill '#6B3015' -draw "ellipse $(( SIZE*28/100 )),$(( SIZE*31/100 )) $(( SIZE*3/100 )),$(( SIZE*2/100 )) 0,360" \
  -fill '#6B3015' -draw "ellipse $(( SIZE*60/100 )),$(( SIZE*27/100 )) $(( SIZE*2/100 )),$(( SIZE*2/100 )) 0,360" \
  -fill '#6B3015' -draw "ellipse $(( SIZE*44/100 )),$(( SIZE*54/100 )) $(( SIZE*3/100 )),$(( SIZE*2/100 )) 0,360" \
  "$OUT"
