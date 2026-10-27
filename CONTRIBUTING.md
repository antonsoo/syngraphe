# Contributing

Use Node 24 or later. Run `npm ci`, then `npm run dev` for the local workshop.
`npm run check` runs lint, strict types, the model tests and a production build.

Changes should improve a specific learner action or correct a reproducible
source/model mismatch. Keep prescribed values, derived arithmetic and drawing
choices distinct. Cite the printed page for Greek changes and preserve restored
letters. Read `docs/sources.md` and `docs/model.md` before changing measurements.

`npm run verify:model` checks the exact arithmetic independently in Python.
`npm run verify:sources` downloads the pinned historical PDF and reproduces its
whole-page renders. Poppler 24.02.0 is the retained renderer. Restart the dev
server after deliberately changing a source manifest or font identity: those
verified identities are fixed when Vite loads its configuration.

For browser changes, build first, install Playwright browsers, then run
`npm run test:browser -- /tmp/syngraphe-review`. Read the actual native downloads,
inspect desktop and phone screenshots and confirm current-worker offline use.
HTTP 200 alone does not verify source or hosted-file identity. The artifact
audit needs Python 3 and Poppler; run
`python3 scripts/artifacts.py /tmp/syngraphe-review` after the full browser matrix.

Never update a source hash just to silence a failure. Inspect the source and
record why its identity changed. Keep new features within an explicitly stated
model rather than completing a historical reconstruction by visual convention.
