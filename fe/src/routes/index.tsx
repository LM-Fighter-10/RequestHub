import { createFileRoute } from '@tanstack/react-router'
import CollectionsPage from '@/pages/CollectionsPage'

export const Route = createFileRoute('/')({
  component: CollectionsPage,
})
