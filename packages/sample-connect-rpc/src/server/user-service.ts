import type { ConnectRouter } from '@connectrpc/connect';
import { UserService } from '../../generated/user/v1/user_connect.js';
import {
	RegisterUserRequest,
	RegisterUserResponse,
	User,
	ErrorDetail,
} from '../../generated/user/v1/user_pb.js';

/**
 * Implementation of UserService using Connect-es.
 * Demonstrates how to return Result pattern using oneof fields.
 */
export function routes(router: ConnectRouter) {
	router.service(UserService, {
		registerUser: async (req: RegisterUserRequest) => {
			const response = new RegisterUserResponse();

			// Validation: check if email is valid
			if (!req.email || !req.email.includes('@')) {
				// Return error case
				const error = new ErrorDetail({
					code: 'INVALID_EMAIL',
					message: 'Email address is invalid',
				});
				response.result = {
					case: 'error',
					value: error,
				};
				return response;
			}

			// Check if name is provided
			if (!req.name || req.name.trim() === '') {
				// Return error case
				const error = new ErrorDetail({
					code: 'INVALID_NAME',
					message: 'Name is required',
				});
				response.result = {
					case: 'error',
					value: error,
				};
				return response;
			}

			// Success case: create user
			const user = new User({
				id: `user_${Date.now()}`,
				name: req.name,
				email: req.email,
			});

			response.result = {
				case: 'user',
				value: user,
			};

			return response;
		},
	});
}
