import { createPromiseClient, type PromiseClient } from '@connectrpc/connect';
import { createRouterTransport } from '@connectrpc/connect';
import { UserService } from '../../generated/user/v1/user_connect.js';
import { RegisterUserRequest } from '../../generated/user/v1/user_pb.js';
import { routes } from '../server/user-service.js';

/**
 * Client implementation that demonstrates how to handle the Result pattern
 * with case-based branching on the response.
 */
export class UserClient {
	private client: PromiseClient<typeof UserService>;

	constructor() {
		// Create an in-memory transport for testing
		// In production, you would use createConnectTransport with a real URL
		const transport = createRouterTransport(routes);
		this.client = createPromiseClient(UserService, transport);
	}

	/**
	 * Register a new user and handle the result using case-based branching.
	 * This demonstrates the TypeScript Union type generated from protobuf oneof.
	 */
	async registerUser(name: string, email: string): Promise<{
		success: boolean;
		userId?: string;
		errorCode?: string;
		errorMessage?: string;
	}> {
		const request = new RegisterUserRequest({
			name,
			email,
		});

		const response = await this.client.registerUser(request);

		// Case-based branching on the result field
		// TypeScript knows the structure because of the discriminated union
		switch (response.result.case) {
			case 'user':
				// TypeScript knows result.value is User here
				return {
					success: true,
					userId: response.result.value.id,
				};

			case 'error':
				// TypeScript knows result.value is ErrorDetail here
				return {
					success: false,
					errorCode: response.result.value.code,
					errorMessage: response.result.value.message,
				};

			case undefined:
				// Handle the case where no result is set
				return {
					success: false,
					errorCode: 'UNKNOWN',
					errorMessage: 'No result returned',
				};
		}
	}

	/**
	 * Alternative implementation using if-else with case checking.
	 */
	async registerUserAlt(name: string, email: string): Promise<{
		success: boolean;
		userId?: string;
		errorCode?: string;
		errorMessage?: string;
	}> {
		const request = new RegisterUserRequest({
			name,
			email,
		});

		const response = await this.client.registerUser(request);

		// Alternative: if-else based branching
		if (response.result.case === 'user') {
			return {
				success: true,
				userId: response.result.value.id,
			};
		}

		if (response.result.case === 'error') {
			return {
				success: false,
				errorCode: response.result.value.code,
				errorMessage: response.result.value.message,
			};
		}

		return {
			success: false,
			errorCode: 'UNKNOWN',
			errorMessage: 'No result returned',
		};
	}
}
