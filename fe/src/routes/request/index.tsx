import { createFileRoute } from '@tanstack/react-router'
import RequestPage from '@/pages/RequestPage'
import {api} from "@/lib/rpc.ts";

export const Route:any = createFileRoute('/request/')({
  loader: async () => {
    return api.requests.get().then(({ data }) => data)
  },
  component: RequestPage,
})
