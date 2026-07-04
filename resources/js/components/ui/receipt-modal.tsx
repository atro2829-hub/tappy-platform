import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { StatusBadge } from '@/components/ui/status-badge';
import { fmt } from '@/lib/format';
import { COUNTRIES, type Txn } from '@/lib/mock-data';

export function ReceiptModal({ txn, open, onClose }: { txn: Txn | null; open: boolean; onClose: () => void }) {
    if (!txn) {
        return null;
    }

    const c = COUNTRIES.find((x) => x.iso === txn.country);
    const tone = txn.status === 'success' ? 'success' : txn.status === 'failed' ? 'destructive' : 'warning';
    const icon = txn.status === 'success' ? 'checkcircle' : txn.status === 'failed' ? 'xcircle' : 'clock';
    const when = txn.date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    const rows: [string, string][] = [
        ['Type', txn.type],
        ['Recipient', txn.recipient],
        ['Operator', txn.operator],
        ['Country', c?.name ?? txn.country],
        ['Recipient gets', fmt(txn.localAmount, txn.cur)],
        ['Fee', fmt(txn.fee)],
        ['Reference', txn.id],
    ];

    const download = () => {
        const lines = [
            '            TAPPY — TRANSACTION RECEIPT',
            '',
            'Status        : ' + txn.status.toUpperCase(),
            'Reference     : ' + txn.id,
            'Type          : ' + txn.type,
            'Recipient     : ' + txn.recipient,
            'Operator      : ' + txn.operator,
            'Country       : ' + (c?.name ?? txn.country),
            'Recipient gets: ' + fmt(txn.localAmount, txn.cur),
            'Fee           : ' + fmt(txn.fee),
            'Amount charged: ' + fmt(txn.amountUSD),
            'Date          : ' + when,
            '',
            'Secured by Tappy',
            'Questions? support@tappy.io',
        ].join('\n');
        const blob = new Blob([lines], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'receipt-' + txn.id + '.txt';
        a.click();
        URL.revokeObjectURL(a.href);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-[440px]">
                <DialogHeader>
                    <DialogTitle>Transaction receipt</DialogTitle>
                </DialogHeader>

                <div className="pb-1 text-center">
                    <div
                        className="mx-auto mb-3 flex size-[52px] items-center justify-center rounded-full"
                        style={{ background: `hsl(var(--${tone}) / 0.12)`, color: `hsl(var(--${tone}))` }}
                    >
                        <Icon name={icon} className="size-[26px]" />
                    </div>
                    <div className="font-mono tnum text-[26px] font-bold">{fmt(txn.amountUSD)}</div>
                    <div className="mt-2 flex justify-center">
                        <StatusBadge status={txn.status} />
                    </div>
                </div>

                <div className="rounded-lg border px-3.5">
                    {rows.map(([k, v], i) => (
                        <div
                            key={k}
                            className="flex justify-between gap-4 py-[9px]"
                            style={{ borderBottom: i < rows.length - 1 ? '1px solid hsl(var(--border))' : undefined }}
                        >
                            <span className="text-[12.5px] text-muted-foreground">{k}</span>
                            <span className={`text-right text-[12.5px] font-medium ${k === 'Reference' ? 'font-mono break-all' : ''}`}>
                                {v}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11.5px] text-muted-foreground">
                    <Icon name="lock" className="size-3" /> Secured by Tappy · {when}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={download}>
                        <Icon name="download" className="size-4" />
                        Download
                    </Button>
                    <Button onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
