export {
	type Client,
	createClient,
	createTransport,
} from './client/user-client.js';
export { createRoutes, toFetch } from './server/user-service.js';
export {
	ErrorDetail,
	GetUserRequest,
	GetUserResponse,
	RegisterUserRequest,
	RegisterUserResponse,
	User,
} from '../generated/user/v1/user_pb.js';
export { UserService } from '../generated/user/v1/user_connect.js';
