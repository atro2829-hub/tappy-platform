import { Head } from '@inertiajs/react';

import { Page, PageHeader } from '@/components/ui/page';
import { Panel, PanelBody } from '@/components/ui/panel';

const SECTIONS: { title: string; body: string }[] = [
    {
        title: 'Instant, non-reversible delivery',
        body: 'Airtime top-ups, data bundles, gift cards and bill payments are delivered to the recipient instantly. Once a transaction has been delivered successfully it cannot be reversed, because the value has already reached the recipient or biller.',
    },
    {
        title: 'Automatic refunds on failure',
        body: 'If a transaction fails, is rejected by the operator, or cannot be delivered, the full amount you were charged — including any fee — is automatically returned to your Tappy wallet. You do not need to request it; settlement happens as soon as the provider reports the outcome.',
    },
    {
        title: 'Where refunds appear',
        body: 'Every refund is posted to your wallet as a "Refund" entry in the wallet ledger, restoring your available balance. The original transaction is marked Refunded so the two always reconcile.',
    },
    {
        title: 'Wallet funds',
        body: 'Wallet funds are held in USD and can be spent on any product. Added funds are not separately refundable to your card; they remain in your wallet until you spend them.',
    },
    {
        title: 'Wrong recipient or amount',
        body: 'Because delivery is instant and final, Tappy cannot recover a top-up sent to a number you entered incorrectly. Please confirm the recipient number and operator before you confirm a purchase.',
    },
    {
        title: 'Disputes',
        body: 'If you believe a transaction was charged but not delivered, open a ticket from the Support page with the transaction reference and our team will investigate.',
    },
];

export default function RefundPolicy() {
    return (
        <>
            <Head title="Refund policy" />
            <Page>
                <PageHeader
                    title="Refund policy"
                    desc="How charges, failures and refunds are handled on Tappy."
                />

                <Panel>
                    <PanelBody className="flex flex-col gap-6 p-6">
                        {SECTIONS.map((s) => (
                            <div key={s.title}>
                                <h2 className="mb-1.5 text-[14px] font-semibold">
                                    {s.title}
                                </h2>
                                <p className="max-w-[640px] text-[13px] leading-relaxed text-muted-foreground">
                                    {s.body}
                                </p>
                            </div>
                        ))}
                    </PanelBody>
                </Panel>
            </Page>
        </>
    );
}
