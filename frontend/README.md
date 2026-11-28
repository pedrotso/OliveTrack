# OliveTrack frontend

The frontend is a React and Vite PWA. The sample task screen uses Dexie for local data and queues changes for synchronisation with the API.

Follow the [repository setup](../README.md#local-development) to start the API and PostgreSQL. Once the shared package has been built, the frontend can be started independently. Run these commands from the repository root:

```sh
npm run dev -w frontend
npm run lint -w frontend
npm run typecheck -w frontend
npm run build -w frontend
```

The Vite configuration defines the API proxy, manifest and service worker. The service worker is disabled in the development server. To inspect the production build and service worker, run `npm run preview -w frontend` after building.
