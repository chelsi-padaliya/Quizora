"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FolderOpen, Pencil, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DeleteDialog } from "@/components/shared/DeleteDialog";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { SearchBar } from "@/components/shared/SearchBar";
import { useDebounce } from "@/hooks/use-debounce";
import { createTechnology, deleteTechnology, updateTechnology } from "@/actions/technology.actions";

type Technology = { id: string; name: string; _count: { subjects: number } };

export function TechnologyManager({ technologies, page, total, totalPages }: { technologies: Technology[]; page: number; total: number; totalPages: number }) {
  const router = useRouter(); const pathname = usePathname(); const searchParams = useSearchParams();
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<Technology | null>(null); const [name, setName] = useState(""); const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? ""); const debouncedSearch = useDebounce(search, 300);
  const updateParams = useCallback((updates: Record<string, string | undefined>) => { const params = new URLSearchParams(searchParams.toString()); Object.entries(updates).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key)); router.push(`${pathname}?${params.toString()}`, { scroll: false }); }, [pathname, router, searchParams]);
  useEffect(() => { if (debouncedSearch !== (searchParams.get("search") ?? "")) updateParams({ search: debouncedSearch || undefined, page: "1" }); }, [debouncedSearch, searchParams, updateParams]);
  const save = () => startTransition(async () => { const result = editing ? await updateTechnology(editing.id, { name }) : await createTechnology({ name }); if (result.success) { setOpen(false); setEditing(null); setName(""); router.refresh(); } else alert(result.error); });
  const remove = (id: string) => startTransition(async () => { const result = await deleteTechnology(id); if (!result.success) alert(result.error); else router.refresh(); });
  return <div className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><SearchBar value={search} onChange={setSearch} placeholder="Search technologies..." className="w-full flex-1 sm:max-w-sm" /><div className="flex flex-col gap-2 sm:flex-row"><Button variant="outline" asChild><Link href="/admin/subjects"><FolderOpen />Manage Subjects</Link></Button><Button variant="outline" asChild><Link href="/admin/topics"><Tag />Manage Topics</Link></Button><Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button onClick={() => { setEditing(null); setName(""); }}><Plus className="mr-2 h-4 w-4" />Add Technology</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{editing ? "Edit Technology" : "Create Technology"}</DialogTitle></DialogHeader><div className="space-y-4"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Frontend" /><Button onClick={save} disabled={pending || name.trim().length < 2}>{pending ? "Saving..." : "Save"}</Button></div></DialogContent></Dialog></div></div><p className="text-sm text-muted-foreground">{total} technolog{total === 1 ? "y" : "ies"} found</p><div className="divide-y rounded-lg border">{technologies.length ? technologies.map((technology) => <div key={technology.id} className="flex items-center justify-between gap-4 px-4 py-3"><div><p className="font-medium">{technology.name}</p><p className="text-sm text-muted-foreground">{technology._count.subjects} subject{technology._count.subjects === 1 ? "" : "s"}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => { setEditing(technology); setName(technology.name); setOpen(true); }}><Pencil className="h-4 w-4" /></Button><DeleteDialog title="Delete technology?" description="This will also remove its subjects and topics." onConfirm={() => remove(technology.id)} disabled={pending} /></div></div>) : <p className="py-8 text-center text-muted-foreground">No technologies found.</p>}</div><PaginationControls page={page} totalPages={totalPages} onPageChange={(nextPage) => updateParams({ page: String(nextPage) })} /></div>;
}
