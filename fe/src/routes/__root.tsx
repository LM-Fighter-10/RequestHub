import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

export const Route:any = createRootRoute({
    component: () => (
        <div className="min-h-screen flex flex-col">
            <nav className="bg-gray-100 p-4 flex space-x-4">
                <Link to="/">Collections</Link>
                <Link to="/request">Requests</Link>
            </nav>
            <main className="flex-1 p-4">
                <Outlet />
            </main>
        </div>
    ),
})