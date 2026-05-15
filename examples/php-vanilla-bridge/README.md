# PHP + vanilla JavaScript bridge

This example shows how to host the React/MUI EmailBuilder editor as a static asset inside a PHP app while the surrounding product remains plain PHP and vanilla JavaScript.

It covers the first integration slice requested in [issue #162](https://github.com/usewaypoint/email-builder-js/issues/162):

- load template JSON records from PHP
- save edited JSON and rendered HTML through a PHP endpoint
- upload image files through a PHP endpoint and insert the returned URL into the selected image block
- open a preview-send dialog that posts the current rendered HTML to a PHP endpoint

The PHP endpoints store data on disk so the scaffold works without database, S3, or mail credentials. Replace the file writes with your database, S3 client, and mailer once the bridge is working.

## Run locally

1. Build the editor app:

```bash
cd examples/vite-emailbuilder-mui
npm install
npm run build
```

2. Copy the built editor into this example:

```bash
mkdir -p ../php-vanilla-bridge/public/email-builder
cp -R dist/* ../php-vanilla-bridge/public/email-builder/
```

3. Start PHP from this example:

```bash
cd ../php-vanilla-bridge/public
php -S localhost:8080
```

4. Open http://localhost:8080.

## Bridge messages

The PHP host sends messages to the iframe with `source: "email-builder-host"`:

- `emailbuilder:load` with `{ document }`
- `emailbuilder:request-state`
- `emailbuilder:select-tab` with `{ tab: "editor" | "preview" | "json" | "html" }`
- `emailbuilder:set-selected-image-url` with `{ url }`

The editor replies with `source: "email-builder-js"`:

- `emailbuilder:ready`
- `emailbuilder:change`
- `emailbuilder:loaded`
- `emailbuilder:state`
- `emailbuilder:error`

State messages include both `document` and rendered `html`.
