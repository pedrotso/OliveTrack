# OliveTrack demo

Interactive mobile and tablet prototype for olive-harvest management.

## Required files

Keep this structure:

```text
index.html
vendor/
  pdf-lib.min.js
  pdf-lib-LICENSE.md
```

`index.html` contains the screens, styles and application logic.
`pdf-lib.min.js` supports PDF generation; keep its accompanying licence file.

## Run

Open `index.html` in Chrome or Edge and select **Load demo workspace**.
Use **Mobile** or **Tablet** to change the preview size.
No installation or build step is required.

This is a demonstration: authentication, permissions and offline synchronisation
are simulated. Data is kept in memory and is lost when the page is refreshed.
