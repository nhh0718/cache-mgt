/**
 * Post-build: regenerate extension icons with correct cookie design.
 * Plasmo strips alpha/quality during its icon pipeline — this overrides the output.
 */
import { execSync } from "child_process"
import { readdirSync } from "fs"
import { join } from "path"

const BUILD_DIR = "build/chrome-mv3-prod"
const GEN_SCRIPT = "scripts/gen-cookie-icon.sh"

const files = readdirSync(BUILD_DIR).filter(
  (f) => f.startsWith("icon") && f.endsWith(".png")
)

for (const file of files) {
  const match = file.match(/icon(\d+)/)
  if (!match) continue
  const size = match[1]
  const dest = join(BUILD_DIR, file)
  execSync(`bash "${GEN_SCRIPT}" ${size} "${dest}"`, { stdio: "pipe" })
  console.log(`✓ ${file} → ${size}x${size}`)
}
