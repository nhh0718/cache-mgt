#!/bin/bash
# Cookie icon generator — size-aware design
SIZE=$1
OUT=$2
H=$((SIZE/2))

if [ "$SIZE" -le 32 ]; then
  # Small sizes: simple circle + 3 high-contrast chips clearly visible
  CS=$((SIZE*12/100))  # chip size
  magick -size ${SIZE}x${SIZE} xc:none \
    -fill '#C97A1A' -draw "circle ${H},${H} ${H},1" \
    -fill '#E8A830' -draw "circle ${H},${H} ${H},$(( SIZE*9/100 ))" \
    -fill '#2A1008' -draw "ellipse $(( SIZE*35/100 )),$(( SIZE*35/100 )) ${CS},${CS} 0,360" \
    -fill '#2A1008' -draw "ellipse $(( SIZE*63/100 )),$(( SIZE*38/100 )) ${CS},${CS} 0,360" \
    -fill '#2A1008' -draw "ellipse $(( SIZE*44/100 )),$(( SIZE*63/100 )) ${CS},${CS} 0,360" \
    "$OUT"
else
  # Large sizes: full detail — textured edge, 5 chips with highlights, crinkle ring
  magick -size ${SIZE}x${SIZE} xc:none \
    `# Outer shadow ring` \
    -fill '#A85F10' -draw "circle ${H},${H} ${H},1" \
    `# Cookie body golden-brown` \
    -fill '#D4922A' -draw "circle ${H},${H} ${H},$(( SIZE*5/100 ))" \
    `# Baked center — lighter` \
    -fill '#EEBC50' -draw "circle ${H},${H} ${H},$(( SIZE*12/100 ))" \
    `# Inner warm zone` \
    -fill '#E8A830' -draw "circle ${H},${H} $(( H-SIZE*20/100 )),$(( H-SIZE*20/100 - SIZE*5/100 ))" \
    `# Crinkle ring — subtle texture band` \
    -fill '#D4922A' -stroke '#C97A1A' -strokewidth 1 \
    -draw "circle ${H},${H} ${H},$(( SIZE*18/100 ))" \
    -fill '#E8A830' -draw "circle ${H},${H} ${H},$(( SIZE*21/100 ))" \
    `# Chocolate chip 1 (upper-left)` \
    -fill '#2A1008' -draw "ellipse $(( SIZE*30/100 )),$(( SIZE*32/100 )) $(( SIZE*9/100 )),$(( SIZE*8/100 )) 0,360" \
    -fill '#5C2A12' -draw "ellipse $(( SIZE*28/100 )),$(( SIZE*30/100 )) $(( SIZE*3/100 )),$(( SIZE*2/100 )) 0,360" \
    `# Chocolate chip 2 (upper-right)` \
    -fill '#2A1008' -draw "ellipse $(( SIZE*64/100 )),$(( SIZE*28/100 )) $(( SIZE*8/100 )),$(( SIZE*7/100 )) 0,360" \
    -fill '#5C2A12' -draw "ellipse $(( SIZE*62/100 )),$(( SIZE*26/100 )) $(( SIZE*3/100 )),$(( SIZE*2/100 )) 0,360" \
    `# Chocolate chip 3 (center)` \
    -fill '#2A1008' -draw "ellipse $(( SIZE*47/100 )),$(( SIZE*55/100 )) $(( SIZE*10/100 )),$(( SIZE*9/100 )) 0,360" \
    -fill '#5C2A12' -draw "ellipse $(( SIZE*45/100 )),$(( SIZE*53/100 )) $(( SIZE*3/100 )),$(( SIZE*2/100 )) 0,360" \
    `# Chocolate chip 4 (lower-left)` \
    -fill '#2A1008' -draw "ellipse $(( SIZE*28/100 )),$(( SIZE*63/100 )) $(( SIZE*7/100 )),$(( SIZE*6/100 )) 0,360" \
    `# Chocolate chip 5 (right)` \
    -fill '#2A1008' -draw "ellipse $(( SIZE*70/100 )),$(( SIZE*54/100 )) $(( SIZE*8/100 )),$(( SIZE*7/100 )) 0,360" \
    "$OUT"
fi
