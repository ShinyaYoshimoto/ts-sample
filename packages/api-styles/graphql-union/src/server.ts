import { createServer } from 'node:http';
import { createGraphQLApp } from './app';

const PORT = 4000;

createServer(createGraphQLApp()).listen(PORT, () => {
	console.log(`GraphQL: http://localhost:${PORT}/graphql`);
});
