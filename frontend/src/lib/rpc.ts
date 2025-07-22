import { edenTreaty } from '@elysiajs/eden'
import type { App } from '../../../backend/src/index'

const baseUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000'

// Create an Eden Treaty API client for the backend
export const api = edenTreaty<App>(baseUrl)

// export type RPCResult<T> = { jsonrpc: '2.0'; id: number | string; result: T }
//
// export async function rpc<T = any>(
//     method: string,
//     params: any = {}
// ): Promise<T> {
//     const id = Date.now()
//     const res = await fetch('/rpc', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ jsonrpc: '2.0', id, method, params })
//     })
//     const payload = await res.json() as RPCResult<T> & { error?: any }
//     if (payload.error) throw new Error(payload.error.message)
//     return payload.result
// }

