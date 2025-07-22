import { db } from './db'
import { collections, requests } from './schema'
import {eq, sql} from 'drizzle-orm'

// Type definitions for JSON-RPC requests and responses
type JSONRPCRequest = {
    jsonrpc: '2.0'
    id: number | string
    method: string
    params?: any
}
type Pair = { key: string; value: string }
type SavedRequest = {
    id: number
    collectionId: number | null
    name: string
    method: string
    url: string
    headers: Record<string, string>
    body: any
}

// RPC method implementations using Drizzle ORM
export const methods = {
    // Collections CRUD
    async listCollections() {
        return db.select().from(collections).all()
    },

    async getCollection({ id }: { id: number }) {
        const col = db
            .select()
            .from(collections)
            .where(eq(collections.id, id))
            .all()
        return col || null
    },

    async getRequestsWithoutCollection(): Promise<SavedRequest[]> {
        return db
            .select()
            .from(requests)
            .where(sql`${requests.collectionId} IS NULL`)
            .all()
    },

    async createCollection({ name }: { name: string }) {
        const [col] = await db
            .insert(collections)
            .values({ name })
            .returning()
        return col
    },

    async updateCollection({ id, name }: { id: number; name: string }) {
        const [col] = await db
            .update(collections)
            .set({ name })
            .where(eq(collections.id, id))
            .returning()
        return col
    },

    async deleteCollection({ id }: { id: number }) {
        // Cascade delete related requests
        await db.delete(requests).where(eq(requests.collectionId, id))
        await db.delete(collections).where(eq(collections.id, id))
        return { success: true }
    },

    // Requests CRUD
    async listRequests({ collectionId }: { collectionId?: number | null } = {}) {
        return db
            .select()
            .from(requests)
            .where(
                collectionId != null
                    ? eq(requests.collectionId, collectionId)
                    : sql`collection_id IS NULL`
            )
            .all()
    },

    async getRequest({ id }: { id: number }) {
        const [req] = await db
            .select()
            .from(requests)
            .where(eq(requests.id, id))
            .all()
        return req || null
    },

    async createRequest(params: {
        collectionId: number
        name: string
        method: string
        url: string
        headers: Record<string, string>
        body: any
    }) {
        const [req] = await db
            .insert(requests)
            .values(params)
            .returning()
        return req
    },

    async updateRequest(params: {
        id: number
        name?: string
        method?: string
        url?: string
        headers?: Record<string, string>
        body?: any
    }) {
        const { id, ...fields } = params
        const [req] = await db
            .update(requests)
            .set(fields)
            .where(eq(requests.id, id))
            .returning()
        return req
    },

    async deleteRequest({ id }: { id: number }) {
        await db.delete(requests).where(eq(requests.id, id))
        return { success: true }
    },

    async rpc({ request }: { request: any }) {
        const { id, method, params } =
            (await request.json()) as JSONRPCRequest
        const handler = (methods as any)[method]

        if (!handler) {
            return new Response(
                JSON.stringify({
                    jsonrpc: '2.0',
                    id,
                    error: { code: -32601, message: 'Method not found' }
                }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            )
        }

        try {
            const result = await handler(params || {})
            return new Response(
                JSON.stringify({ jsonrpc: '2.0', id, result }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            )
        } catch (err: any) {
            return new Response(
                JSON.stringify({
                    jsonrpc: '2.0',
                    id,
                    error: { code: -32000, message: err.message || String(err) }
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            )
        }
    },

    // HTTP request executor
    async sendRequest(params: {
        method: string
        url: string
        pathParams?: Pair[]
        queryParams?: Pair[]
        headers?: Record<string, string>
        body?: any
    }) {
        let { method, url, pathParams = [], queryParams = [], headers = {}, body } = params

        // Build URL with path params
        const finalUrl = pathParams.reduce(
            (acc, { key, value }) => acc.replace(`:${key}`, encodeURIComponent(value)),
            url
        )

        // Append query string
        const qp: Record<string, string> = {}
        for (const { key, value } of queryParams) qp[key] = value
        const qs = new URLSearchParams(qp).toString()
        const requestUrl = qs ? `${finalUrl}?${qs}` : finalUrl

        // Prepare fetch init
        const init: RequestInit = { method, headers }

        // Only attach a body if it's NOT GET/HEAD/OPTIONS
        if (!['GET','HEAD','OPTIONS'].includes(method.toUpperCase())) {
            init.body =
                typeof body === 'string'
                    ? body
                    : JSON.stringify(body)
        }

        const res = await fetch(finalUrl, init)

        const text = await res.text()
        let data: any
        try { data = JSON.parse(text) } catch { data = text }

        return {
            status: res.status,
            statusText: res.statusText,
            headers: Object.fromEntries(res.headers.entries()),
            data
        }
    }
}
