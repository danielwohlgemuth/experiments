# Cloudflare WebSocket Counter

A real-time WebSocket counter app running on Cloudflare Workers, using Durable Objects and KV storage for state management.

![WebSocket Counter Demo](./assets/websocket-counter.png)

## Requirements

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Cloudflare account](https://dash.cloudflare.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`npm install -g wrangler or nxp wrangler`)

## Setup & Development

1. **Install dependencies:**
    ```sh
    npm install
    ```

2. **Create KV Namespace:**
    ```sh
    npm run kv-create
    ```
    Update `wrangler.jsonc` with the KV namespace ID.

3. **Upload static HTML to KV:**
    ```sh
    npm run kv-update
    # or to upload to Cloudflare:
    npm run kv-deploy
    ```

4. **Start the development server:**
    ```sh
    npm run dev
    # or
    npm start
    ```
    Open [http://localhost:8787/](http://localhost:8787/) in your browser.

5. **Generate Cloudflare types (after changing bindings in wrangler.jsonc):**
    ```sh
    npm run cf-typegen
    # or
    npm run types
    ```

6. **Deploy to Cloudflare:**
    ```sh
    npm run deploy
    ```

---

For more details, see [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/).



