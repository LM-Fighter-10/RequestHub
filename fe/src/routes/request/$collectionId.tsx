import { createFileRoute } from '@tanstack/react-router'
import RequestPage from '@/pages/RequestPage'
import {api} from "@/lib/rpc.ts";
import { useParams } from '@tanstack/react-router'

export const Route:any = createFileRoute('/request/$collectionId')({
  loader: async ({params})=>{
    const { data: col } = await api.collections[params.collectionId.toString()].get()
    const data = api.collections[params.collectionId].requests.get()
        .then(({ data }) => data);
    return {
      data,
      colName: col? col[0]?.name : 'Unknown Collection',
    }
  },
  component: () => {
    const params = useParams({ strict: false })
    return < RequestPage collId={params.collectionId} />
  },
})
