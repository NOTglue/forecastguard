# Image credits

Every background photograph used in the interface is listed here with its
source and licence. The files are stored locally in this directory so the
prototype has no runtime dependency on an external CDN.

| File | Source | Author | Licence |
| --- | --- | --- | --- |
| `bg-hero.jpg` | [Anvil clouds over the Bay of Bengal, 26 June 2019](https://commons.wikimedia.org/wiki/File:Anvil_Clouds_over_the_Bay_of_Bengal_(NESDIS_2019-06-26).png) | NOAA / NESDIS | Public domain |
| `bg-strip.jpg` | same source, cropped to a strip for the dashboard masthead | NOAA / NESDIS | Public domain |
| `bg-band.jpg` | [Kerala Monsoon clouds over Western Ghats India](https://commons.wikimedia.org/wiki/File:Kerala_Monsoon_clouds_over_Western_Ghats_India.jpg) | Nagesh Jayaraman | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| `bg-satellite.jpg` | [NOAA-20 VIIRS true colour, India and Bangladesh, 11 Aug 2019](https://commons.wikimedia.org/wiki/File:NOAA20.VIISRS.true.daily.20190811.color.India.Bangladesch.full_res.png) | NOAA | Public domain |

Modifications: cropped to the aspect ratio used by the layout, resized, and
reduced in saturation to sit inside the paper-and-ink palette. No other edits
were made.

The cloud banks drifting over the hero are not part of any photograph — they
are CSS gradient fields animated with GSAP (`app/components/Atmosphere.tsx`).
Attribution for the Creative Commons photograph also appears in the page
footer, where the image is displayed.

## Generated artwork

Everything else in this directory (`bg-topo.svg`, `bg-isobars.svg`,
`hero-atlas.svg`, `feature-*.svg`, `avatar-*.svg`) and `app/icon.svg` is
drawn from scratch by `scripts/generate-assets.mjs` and carries no
third-party rights.
