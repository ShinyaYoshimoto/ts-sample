import { serve } from '@hono/node-server';
import { createApp } from './server';

const port = 3000;

serve({ fetch: createApp().fetch, port }, () => {
	console.log(`REST API: http://localhost:${port}/users (POST)`);
	console.log(`OpenAPI : http://localhost:${port}/openapi.json`);
});
