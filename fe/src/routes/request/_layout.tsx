import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route:any = createFileRoute('/request/_layout')({
    component: () => (
        <div>
            <h1 className="text-xl mb-4">All Requests</h1>
            <Outlet />
        </div>
    ),
})