import { Elysia, t } from 'elysia'
import cors from '@elysiajs/cors'
import { methods } from './handlers'

// Instantiate Elysia app with CORS
const app = new Elysia()
    .use(cors())

    // JSON-RPC endpoint
    .post('/rpc', methods.rpc)

    // RESTful CRUD endpoints for Collections
    .get('/collections', () => methods.listCollections())
    .get('/collections/:collectionId', async ({ params }) => {
            if (!params.collectionId || params.collectionId == null) {
                return methods.getRequestsWithoutCollection()
            } else {
                return methods.getCollection({ id: Number(params.collectionId) })
            }
        }
    )
    .post('/collections', async ({ request }) => {
        const { name } = (await request.json()) as { name: string }
        return methods.createCollection({ name })
    })
    .put('/collections/:collectionId', async ({ params, request }) => {
        const id = Number(params.collectionId)
        const { name } = (await request.json()) as { name: string }
        return methods.updateCollection({ id, name })
    })
    .delete('/collections/:collectionId', async ({ params }) =>
        methods.deleteCollection({ id: Number(params.collectionId) })
    )

    // RESTful CRUD endpoints for Requests
    .get('/requests', () => methods.listRequests({}))
    .get('/collections/:collectionId/requests', async ({ params }) =>
        methods.listRequests({ collectionId: Number(params.collectionId) })
    )
    .get('/requests/:id', async ({ params }) =>
        methods.getRequest({ id: Number(params.id) })
    )
    .post('/requests', async ({ body }) => {
        return methods.createRequest(body)
    },{
        body: t.Object({
            collectionId: t.Number(),
            name: t.String(),
            method: t.String(),
            url: t.String(),
            headers: t.Record(t.String(), t.String()),
            body: t.Any()
        })
    })
    .put('/requests/:id', async ({ params, request }) => {
        const id = Number(params.id)
        const fields = (await request.json()) as Partial<{
            name: string
            method: string
            url: string
            headers: Record<string, string>
            body: any
        }>
        return methods.updateRequest({ id, ...fields })
    })
    .delete('/requests/:id', async ({ params }) =>
        methods.deleteRequest({ id: Number(params.id) })
    )
    .post('/sendRequest', async ({ request }) => {
        const body: any = await request.json()
        return methods.sendRequest(body)
    })
    .listen(3000, () => console.log('🚀 Backend listening on http://localhost:3000'));

export type App = typeof app
