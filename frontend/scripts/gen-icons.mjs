// Generate PNG icons for the PWA from public/favicon.svg.
import sharp from 'sharp'
for (const s of [192, 512]) {
  await sharp('public/favicon.svg', { density: 384 }).resize(s, s).png().toFile(`public/pwa-${s}.png`)
}
