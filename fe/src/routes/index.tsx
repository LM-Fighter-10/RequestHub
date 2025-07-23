import { createFileRoute } from '@tanstack/react-router'
import CollectionsPage from '@/pages/CollectionsPage'

export const Route:any = createFileRoute('/')({
  component: CollectionsPage,
})
