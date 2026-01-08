/**
 * Connect (gRPC) Result Pattern Sample
 * 
 * This package demonstrates Contract-first Result Pattern implementation
 * using Connect (gRPC) and Protocol Buffers.
 * 
 * @packageDocumentation
 */

// Export client
export { UserClient } from './client/user-client.js';

// Export server
export { routes } from './server/user-service.js';

// Re-export generated types for convenience
export {
	User,
	ErrorDetail,
	RegisterUserRequest,
	RegisterUserResponse,
} from '../generated/user/v1/user_pb.js';

export { UserService } from '../generated/user/v1/user_connect.js';
