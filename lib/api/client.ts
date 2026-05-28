/**
 * API client - switches between mock and real API based on env
 * TODO: replace with real API implementation
 */
import { env } from '@/config/env';
import { mockApi } from './mock/handlers';

export const api = env.useMock ? mockApi : mockApi; // TODO: swap with real client
