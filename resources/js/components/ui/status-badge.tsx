import { Badge } from '@/components/ui/badge';

type BadgeVariant = 'success' | 'warning' | 'destructive' | 'info' | 'violet' | 'muted';

const STATUS_MAP: Record<string, { variant: BadgeVariant; label: string }> = {
    success: { variant: 'success', label: 'Success' },
    delivered: { variant: 'success', label: 'Delivered' },
    completed: { variant: 'success', label: 'Completed' },
    active: { variant: 'success', label: 'Active' },
    approved: { variant: 'success', label: 'Approved' },
    paid: { variant: 'success', label: 'Paid' },
    pending: { variant: 'warning', label: 'Pending' },
    processing: { variant: 'warning', label: 'Processing' },
    queued: { variant: 'warning', label: 'Queued' },
    paused: { variant: 'warning', label: 'Paused' },
    failed: { variant: 'destructive', label: 'Failed' },
    declined: { variant: 'destructive', label: 'Declined' },
    error: { variant: 'destructive', label: 'Error' },
    suspended: { variant: 'destructive', label: 'Suspended' },
    refunded: { variant: 'info', label: 'Refunded' },
    reversed: { variant: 'info', label: 'Reversed' },
    info: { variant: 'info', label: 'Info' },
    review: { variant: 'violet', label: 'Manual Review' },
    hold: { variant: 'violet', label: 'On Hold' },
};

export function StatusBadge({ status }: { status: string }) {
    const s = STATUS_MAP[status] ?? { variant: 'muted' as const, label: status };

    return (
        <Badge variant={s.variant} dot>
            {s.label}
        </Badge>
    );
}
