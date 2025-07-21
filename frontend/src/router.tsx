import {
    createRootRoute,
    createRoute,
    createRouter,
    RouterProvider,
    Link,
    Outlet,
} from '@tanstack/react-router'
import CollectionsPage from './pages/CollectionsPage'
import RequestPage     from './pages/RequestPage'

const rootRoute = createRootRoute({
    component: () => (
        <div className="min-h-screen flex flex-col">
            <nav className="w-full bg-gray-100 p-4 flex space-x-4">
                <Link to={collectionsRoute.to}>Collections</Link>
                <Link to={requestIndexRoute.to}>Requests</Link>
            </nav>
            <main className="flex-1 w-full p-4">
                <Outlet/>
            </main>
        </div>
    )
})

// Collections route at "/"
export const collectionsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: CollectionsPage,
});

// Request parent route at "/request"
const requestRootRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'request',
    component: Outlet,
});

// Request index route ("/request")
const requestIndexRoute = createRoute({
    getParentRoute: () => requestRootRoute,
    path: '/', // renders at "/request"
    component: RequestPage,
});

// Request by collection ("/request/:collectionId")
const requestByCollectionRoute = createRoute({
    getParentRoute: () => requestRootRoute,
    path: '$collectionId',
    component: RequestPage,
});

// Build the route tree
const routeTree = rootRoute.addChildren([
    collectionsRoute,
    requestRootRoute.addChildren([requestIndexRoute, requestByCollectionRoute]),
]);

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

export function App() {
    return <RouterProvider router={router} />
}
