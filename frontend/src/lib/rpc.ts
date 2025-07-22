import { edenTreaty } from '@elysiajs/eden'
import type { App } from '../../../backend/src/index'

const baseUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000'

// Create an Eden Treaty API client for the backend
export const api = edenTreaty<App>(baseUrl)
