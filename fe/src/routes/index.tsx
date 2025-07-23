import { createFileRoute } from '@tanstack/react-router'
import CollectionsPage from '@/pages/CollectionsPage'
import {api} from "@/lib/rpc.ts";

export const Route:any = createFileRoute('/')({
  component: CollectionsPage,
  loader: async () => {
    return api.collections.get()
        .then(({ data }) => data)
  }
})
