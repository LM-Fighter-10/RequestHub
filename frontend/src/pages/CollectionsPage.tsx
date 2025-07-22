import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { api } from '@/lib/rpc'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export default function CollectionsPage() {
    const [collections, setCollections] = useState<{ id: number; name: string }[]>([])
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true);
            api.collections
              .get()
              .then(({ data }) => {
                  // if data is null, default to an empty array
                  setCollections(data ?? [])
              })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [])

    const create = async () => {
        if (!name) return;
        setLoading(true);
        // @ts-ignore
        const { data: created } = await api.collections.post({ name })
        setLoading(false);
        // @ts-ignore
        setCollections((cs) => [...cs, created]);
        setName('');

    }

    const remove = async (id: number) => {
        setLoading(true);
        await api.collections[id.toString()].delete()
        setLoading(false);
        setCollections((cs) => cs.filter((c) => c.id !== id));
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Collections</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-900" />
                  </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {collections.map((c) => (
                                    <TableRow key={c.id} className="hover:bg-gray-50">
                                        <TableCell>{c.name}</TableCell>
                                        <TableCell className="text-right space-x-2 w-32">
                                            {/* @ts-ignore */}
                                            <Link to={`/request/${c.id}`} className="text-blue-600 hover:underline">
                                                View
                                            </Link>
                                            <Button variant="ghost" size="icon" onClick={() => remove(c.id)}>
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="hover:bg-gray-50">
                                    <TableCell>Uncategorized</TableCell>
                                    <TableCell className="space-x-2 text-center">
                                        <Link to="/request"
                                              className="text-blue-600 hover:underline">
                                            View
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                )}
                <div className="mt-4 flex space-x-2">
                    <Input
                        placeholder="New collection name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Button onClick={create}>Add Collection</Button>
                </div>
            </CardContent>
        </Card>
    )
}