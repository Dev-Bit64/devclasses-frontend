import { memo, useMemo, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { GripVertical, Search } from "lucide-react";
import { Input } from "../ui/input";
import { cn } from "../../libs/utils";

export interface PoolEntry {
    id: string;
    name: string;
}

interface PoolChipProps {
    entry: PoolEntry;
    selected: boolean;
    disabled?: boolean;
    // Already on the sheet; shown only where an entry can be placed more than once.
    placed?: boolean;
    onSelect: (entryId: string) => void;
}

// One draggable entry card. Clicking (or tapping) selects it for tap-to-place instead.
const PoolChip = memo(({ entry, selected, disabled, placed, onSelect }: PoolChipProps) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `pool:${entry.id}`,
        data: { entryId: entry.id, name: entry.name },
        disabled,
    });

    return (
        <li>
            <button
                ref={setNodeRef}
                type="button"
                {...listeners}
                {...attributes}
                onClick={() => onSelect(entry.id)}
                aria-pressed={selected}
                disabled={disabled}
                className={cn(
                    "flex w-full touch-manipulation items-center gap-2 rounded-lg border bg-white px-2.5 py-2 text-left text-sm font-medium text-foreground shadow-dc-xs transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected ? "border-primary bg-accent ring-2 ring-primary/30" : "border-border hover:border-primary/50",
                    isDragging && "opacity-40",
                    disabled && "cursor-not-allowed opacity-60"
                )}
            >
                <GripVertical aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 break-words">{entry.name}</span>
                {placed && <span className="shrink-0 text-xs font-normal text-muted-foreground">Placed</span>}
            </button>
        </li>
    );
});
PoolChip.displayName = "PoolChip";

export interface EntryPoolProps {
    entries: PoolEntry[];
    selectedEntryId: string | null;
    onSelect: (entryId: string) => void;
    disabled?: boolean;
    className?: string;
    // Entries already placed, for columnar statements where placed entries stay in the pool.
    placedIds?: Set<string>;
}

/**
 * Searchable list of the entries not yet on the sheet. It is also a drop target, so a placed
 * line dragged back here returns to the pool.
 */
const EntryPool = ({ entries, selectedEntryId, onSelect, disabled, className, placedIds }: EntryPoolProps) => {
    const [search, setSearch] = useState("");
    const { setNodeRef, isOver } = useDroppable({ id: "pool" });

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return query ? entries.filter((entry) => entry.name.toLowerCase().includes(query)) : entries;
    }, [entries, search]);

    return (
        <section
            ref={setNodeRef}
            aria-label="Entry pool"
            className={cn(
                "flex min-h-0 flex-col gap-3 rounded-xl border bg-muted/40 p-3 transition-colors",
                isOver ? "border-primary bg-accent/60" : "border-border",
                className
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <h2 className="dc-label">Entry pool</h2>
                <span className="dc-caption dc-numeric">{placedIds ? `${entries.length} entries` : `${entries.length} left`}</span>
            </div>

            <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    aria-label="Search entries"
                    placeholder="Search entries…"
                    className="h-10 pl-9"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>

            <p className="dc-caption">Drag an entry onto the sheet, or tap it and then tap a head.</p>

            <ul className="dc-scroll flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
                {filtered.map((entry) => (
                    <PoolChip
                        key={entry.id}
                        entry={entry}
                        selected={selectedEntryId === entry.id}
                        disabled={disabled}
                        placed={placedIds?.has(entry.id)}
                        onSelect={onSelect}
                    />
                ))}
                {filtered.length === 0 && (
                    <li className="py-6 text-center text-sm text-muted-foreground">No entries match "{search}".</li>
                )}
            </ul>
        </section>
    );
};

export { EntryPool };
