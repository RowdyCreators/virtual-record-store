# Frontend MVP prototype

Throwaway branch: `prototype/mvp`. No production issue is completed by this prototype.

**Question:** can a small, no-login record store make the browse → select → listen → save loop feel useful? Which layout supports it?

Run `just prototype`, then open <http://localhost:8010/templates/index.html?variant=A>.
This serves static files only. No Python dependencies, backend, or Spotify credentials are needed.

| Variant | Direction |
| --- | --- |
| A | Neighborhood shop: mood crates first, album sleeves on the counter |
| B | Listening desk: persistent crate directory, dense metadata-first record list |
| C | Weekly journal: featured long listen, editorial hierarchy, side-column crate directory |

Use the floating arrows or left/right keys to compare. The query parameter survives reloads. The state disclosure shows the current view, selection, query, and saved IDs.

## Try it

- Open a crate, select an album, and open Spotify or use its embed.
- Save an album, switch layouts, open Saved, reload, and remove it.
- Search Tracks for “Daft Punk”; search Albums for “Miles Davis”.
- Search for nonsense to see the empty state.
- Try at phone width and use Tab/Enter to browse.

## Boundaries

- Based on issues #6–#11 and #16–#22, with a small demo catalog inspired by #12.
- Search filters six demo albums or three tracks locally. It never calls `/api/search`.
- Album IDs, titles, and artwork were checked against Spotify oEmbed while creating the demo. This is not the verified production crate catalog or the San Antonio crate from #13.
- Saves use a separate `vrs-prototype-saved` localStorage key. Only known demo album IDs are accepted. Storage failures fall back to memory with a message.
- Spotify and artwork require internet access. Playback is subject to Spotify restrictions; there is no custom playback.
- All files and the switcher are throwaway, not production assets. No production build exists; keep this branch out of main.
- No backend, accounts, live search, deployment, test suite, or production implementation.

**Verdict:** pending hands-on feedback. Do not promote a layout until one is selected.

## Verification

Browser smoke checks: crate selection, album selection, Spotify embed rendering, local saves surviving reload, removal, both search types, and no-results messages. All three layouts fit a 390px viewport without horizontal overflow. JavaScript syntax check passes. No automated suite or guaranteed audio playback check.
