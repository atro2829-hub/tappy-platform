import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export interface PaginationMeta {
    total: number;
    currentPage: number;
    lastPage: number;
    from: number | null;
    to: number | null;
}

/** Shared "Showing X–Y of Z · Page n/N" footer with prev/next navigation. */
export function Pagination({
    meta,
    onPage,
}: {
    meta: PaginationMeta;
    onPage: (page: number) => void;
}) {
    if (meta.total === 0) {
        return null;
    }

    return (
        <div className="flex items-center justify-between border-t px-5 py-3">
            <span className="text-[12.5px] text-muted-foreground">
                Showing {meta.from ?? 0}–{meta.to ?? 0} of {meta.total}
            </span>
            <div className="flex items-center gap-1.5">
                <Button
                    size="sm"
                    variant="outline"
                    disabled={meta.currentPage <= 1}
                    onClick={() => onPage(meta.currentPage - 1)}
                    aria-label="Previous page"
                >
                    <Icon name="chevleft" className="size-4" />
                </Button>
                <span className="px-1 text-[12px] text-muted-foreground">
                    Page {meta.currentPage} / {meta.lastPage}
                </span>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={meta.currentPage >= meta.lastPage}
                    onClick={() => onPage(meta.currentPage + 1)}
                    aria-label="Next page"
                >
                    Next
                    <Icon name="chevright" className="size-4" />
                </Button>
            </div>
        </div>
    );
}
