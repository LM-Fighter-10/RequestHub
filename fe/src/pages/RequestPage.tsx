import { useEffect, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { api } from '@/lib/rpc'
import { Route as collectionsRoute } from '@/routes/index'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/components/ui/select'
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash2 } from 'lucide-react'

type Pair = { key: string; value: string }
type SavedRequest = {
    id: number
    collectionId: number | null
    name: string
    method: string
    url: string
    headers: Record<string, string>
    body: any
}

export default function RequestPage() {
    const params = useParams({ strict: false })
    const rawId = params.collectionId
    const collectionId = rawId ? Number(rawId) : undefined

    const [collectionName, setCollectionName] = useState<string>('All Requests')
    const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([])
    const [method, setMethod] = useState('GET')
    const [url, setUrl] = useState('')
    const [pathParams, setPathParams] = useState<Pair[]>([])
    const [queryParams, setQueryParams] = useState<Pair[]>([])
    const [headers, setHeaders] = useState<Pair[]>([])
    const [body, setBody] = useState('{}')
    const [response, setResponse] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // ── Load collection name and saved requests ──
    useEffect(() => {
        const load = async () => {
            // Load collection name
            if (collectionId != null) {
                setLoading(true)
                try {
                    const { data: col } = await api.collections[collectionId.toString()].get()
                    // @ts-ignore
                    setCollectionName(col?.name)
                } catch {
                    setCollectionName(`Collection ${collectionId}`)
                } finally {
                    setLoading(false)
                }
            } else {
                setCollectionName('Uncategorized')
            }

            setLoading(true)
            try {
                const { data: reqs } =
                    collectionId != null
                        ? await api.collections[collectionId.toString()].requests.get()
                        : await api.requests.get()
                // @ts-ignore
                setSavedRequests(reqs)
            } catch (err) {
                console.error('Failed to load requests:', err)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [collectionId])

    // ── Pair helpers ──
    const addPair = (
        list: Pair[],
        setter: React.Dispatch<React.SetStateAction<Pair[]>>
    ) => setter([...list, { key: '', value: '' }])
    const updatePair = (
        list: Pair[],
        setter: React.Dispatch<React.SetStateAction<Pair[]>>,
        idx: number,
        field: keyof Pair,
        val: string
    ) => {
        const next = [...list]
        next[idx] = { ...next[idx], [field]: val }
        setter(next)
    }
    const removePair = (
        list: Pair[],
        setter: React.Dispatch<React.SetStateAction<Pair[]>>,
        idx: number
    ) => setter(list.filter((_, i) => i !== idx))

    // ── Send HTTP call ──
    const send = async () => {
        setError(null)
        setSubmitLoading(true)

        const hdrs: Record<string, string> = {}
        headers.forEach(({ key, value }) => key && (hdrs[key] = value))

        setLoading(true)
        try {
            const options = {
                method,
                url,
                pathParams,
                queryParams,
                headers: hdrs,
                body: body ? JSON.parse(body) : null
            }

            // For GET/HEAD/OPTIONS, no body
            if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
                options.body = null
            }

            // If you exposed sendRequest as REST:
            // @ts-ignore
            const { data: result } = await api.sendRequest.post(options)
            setResponse(result)

            // persist via REST
            const { data: newReq } = await api.requests.post({
                ...options,
                // @ts-ignore
                collectionId: collectionId ?? null,
                name: `Request ${Date.now()}`
            })
            // @ts-ignore
            setSavedRequests((prev) => [...prev, newReq])
        } catch (e: any) {
            setError(e.message)
        } finally {
            setSubmitLoading(false)
            setLoading(false)
        }
    }

    // Delete a saved request
    const removeRequest = async (id: number) => {
        await api.requests[id.toString()].delete()
        setSavedRequests((s) => s.filter((r) => r.id !== id))
    }

    const clearResponse = () => {
        setResponse(null)
        setError(null)
    }

    const clearRequestBuilder = () => {
        setMethod('GET')
        setUrl('')
        setPathParams([])
        setQueryParams([])
        setHeaders([])
        setBody('{}')
        clearResponse()
    }

    return (
        <div className="p-4 space-y-6">
            {/* Header with collection name & link */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Requests: {collectionName}</h1>
                <Link to={collectionsRoute.to} className="text-blue-600 hover:underline">
                    ← Back to Collections
                </Link>
            </div>

            {/* Saved Requests List */}
            <Card>
                <CardHeader>
                    <CardTitle>Saved Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-900" />
                        </div>
                    ) : (
                        <ul className="list-disc pl-5 space-y-1">
                            {savedRequests
                                .filter((r) => (collectionId == null ? true : r.collectionId === collectionId))
                                .map((r) => (
                                    <li key={r.id}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700">{r.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeRequest(r.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            {/* ── Builder + Response ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Builder */}
                <Card>
                    <CardHeader
                        className="flex items-center justify-between"
                        style={{ flexDirection: 'row' }}
                    >
                        <CardTitle>Build Request</CardTitle>
                        <Button variant="destructive" onClick={clearRequestBuilder}>
                            Reset Builder
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Method & URL */}
                        <div className="flex space-x-2">
                            <Select value={method} onValueChange={setMethod}>
                                <SelectTrigger style={{ width: 'fit-content' }}>
                                    <SelectValue placeholder="Method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[
                                        'GET',
                                        'POST',
                                        'PUT',
                                        'PATCH',
                                        'DELETE',
                                        'OPTIONS',
                                        'HEAD'
                                    ].map((m) => (
                                        <SelectItem key={m} value={m}>
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                className="flex-1"
                                placeholder="https://api.example.com/users/:id"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>

                        {/* Path Params */}
                        <div>
                            <Label>Path Params</Label>
                            <ScrollArea className="max-h-32 space-y-2 mb-2">
                                {pathParams.map((p, i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                        <Input
                                            placeholder="key"
                                            value={p.key}
                                            onChange={(e) =>
                                                updatePair(pathParams, setPathParams, i, 'key', e.target.value)
                                            }
                                        />
                                        <Input
                                            placeholder="value"
                                            value={p.value}
                                            onChange={(e) =>
                                                updatePair(pathParams, setPathParams, i, 'value', e.target.value)
                                            }
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removePair(pathParams, setPathParams, i)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </ScrollArea>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addPair(pathParams, setPathParams)}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Path Param
                            </Button>
                        </div>

                        {/* Query Params */}
                        <div>
                            <Label>Query Params</Label>
                            <ScrollArea className="max-h-32 space-y-2 mb-2">
                                {queryParams.map((p, i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                        <Input
                                            placeholder="key"
                                            value={p.key}
                                            onChange={(e) =>
                                                updatePair(queryParams, setQueryParams, i, 'key', e.target.value)
                                            }
                                        />
                                        <Input
                                            placeholder="value"
                                            value={p.value}
                                            onChange={(e) =>
                                                updatePair(queryParams, setQueryParams, i, 'value', e.target.value)
                                            }
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removePair(queryParams, setQueryParams, i)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </ScrollArea>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addPair(queryParams, setQueryParams)}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Query Param
                            </Button>
                        </div>

                        {/* Headers */}
                        <div>
                            <Label>Headers</Label>
                            <ScrollArea className="max-h-32 space-y-2 mb-2">
                                {headers.map((p, i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                        <Input
                                            placeholder="key"
                                            value={p.key}
                                            onChange={(e) =>
                                                updatePair(headers, setHeaders, i, 'key', e.target.value)
                                            }
                                        />
                                        <Input
                                            placeholder="value"
                                            value={p.value}
                                            onChange={(e) =>
                                                updatePair(headers, setHeaders, i, 'value', e.target.value)
                                            }
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removePair(headers, setHeaders, i)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </ScrollArea>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addPair(headers, setHeaders)}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Header
                            </Button>
                        </div>

                        {/* Body */}
                        <div>
                            <Label>Body (JSON)</Label>
                            <Textarea
                                rows={6}
                                className="font-mono"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                            />
                        </div>

                        {/* Send */}
                        <div>
                            <Button onClick={send} disabled={submitLoading}>
                                {submitLoading ? 'Sending…' : 'Send'}
                            </Button>
                            {error && <p className="text-red-600 mt-2">{error}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Response Viewer */}
                <Card>
                    <CardHeader className="flex items-center justify-between" style={{ flexDirection: 'row' }}>
                        <CardTitle>Response</CardTitle>
                        <Button variant="destructive" onClick={clearResponse}>
                            Clear
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[70vh]">
              <pre className="font-mono whitespace-pre-wrap">
                {response ? JSON.stringify(response, null, 2) : 'No response yet.'}
              </pre>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
