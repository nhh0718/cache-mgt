/**
 * Post-build script: replace Plasmo-generated icons with transparent PNG versions.
 * Plasmo's icon pipeline (via sharp) strips the alpha channel.
 * This script re-renders the SVG source at each required size with full RGBA transparency.
 */

import { execSync } from "child_process"
import { readdirSync } from "fs"
import { join } from "path"

const BUILD_DIR = "build/chrome-mv3-prod"
const SVG_SRC = "assets/icon-source.svg"

const files = readdirSync(BUILD_DIR).filter(
  (f) => f.startsWith("icon") && f.endsWith(".png")
)

for (const file of files) {
  const match = file.match(/icon(\d+)/)
  if (!match) continue
  const size = match[1]
  const dest = join(BUILD_DIR, file)

  execSync(
    `magick "${SVG_SRC}" -resize ${size}x${size} -background none -alpha on -define png:color-type=6 -define png:exclude-chunks=bKGD "${dest}"`,
    { stdio: "pipe" }
  )
  console.log(`✓ ${file} → ${size}x${size} RGBA`)
}
