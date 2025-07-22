// app/router.tsx
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function createRouter() {
    const router = createTanStackRouter({
        routeTree,
    })

    return router
}

declare module '@tanstack/react-router' {
    interface Register {
        // @ts-ignore
        router: ReturnType<typeof createRouter>
    }
}