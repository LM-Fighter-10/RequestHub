import { createFileRoute } from '@tanstack/react-router'
import RequestPage from '@/pages/RequestPage'

export const Route:any = createFileRoute('/request/')({
  component: RequestPage,
})
