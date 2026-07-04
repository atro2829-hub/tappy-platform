import { Head, router } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { BarChart, Donut } from '@/components/ui/charts';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/data-table';
import { Icon } from '@/components/ui/icon';
import { Money } from '@/components/ui/money';
import { Page, PageHeader } from '@/components/ui/page';
import { Panel, PanelBody, PanelHead } from '@/components/ui/panel';
import { Stat } from '@/components/ui/stat';
import { StatusBadge } from '@/components/ui/status-badge';
import { downloadCsv } from '@/lib/csv';
import { fmt } from '@/lib/format';

const go = (href: string) => router.visit(href);

type Earnings = {
    commissionMtd: number;
    lifetimeCommission: number;
    avgMargin: number;
    productMix: { label: string; color: string; pct: number }[];
    monthly: { month: string; amount: number; dim: boolean }[];
    payouts: {
        id: string;
        period: string;
        amount: number;
        method: string;
        status: string;
        date: string;
    }[];
};

export default function ResellerEarnings({ earnings }: { earnings: Earnings }) {
    const exportStatement = () =>
        downloadCsv(
            'tappy-earnings-statement.csv',
            ['Payout', 'Period', 'Amount', 'Method', 'Status', 'Date'],
            earnings.payouts.map((p) => [
                p.id,
                p.period,
                p.amount,
                p.method,
                p.status,
                p.date,
            ]),
        );

    return (
        <>
            <Head title="Earnings" />
            <Page>
                <PageHeader
                    title="Earnings & commission"
                    desc="Your markup over wholesale cost, paid out monthly to your wallet or bank."
                    actions={
                        <>
                            <Button variant="outline" onClick={exportStatement}>
                                <Icon name="download" className="size-4" />
                                Statement
                            </Button>
                            <Button onClick={() => go('/wallet')}>
                                <Icon name="wallet" className="size-4" />
                                Withdraw
                            </Button>
                        </>
                    }
                />

                <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
                    <Stat
                        label="This month"
                        value={fmt(earnings.commissionMtd)}
                        icon="percent"
                        accent="success"
                    />
                    <Stat
                        label="Lifetime earned"
                        value={fmt(earnings.lifetimeCommission)}
                        icon="dollar"
                        accent="primary"
                    />
                    <Stat
                        label="Avg margin"
                        value={`${earnings.avgMargin}%`}
                        icon="trendup"
                        accent="info"
                    />
                    <Stat
                        label="Next payout"
                        value="Month end"
                        icon="calendar"
                        accent="warning"
                        sub={fmt(earnings.commissionMtd)}
                    />
                </div>

                <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                    <Panel>
                        <PanelHead
                            title="Commission by month"
                            desc="Last 6 months"
                        />
                        <PanelBody>
                            <BarChart
                                data={earnings.monthly.map((e) => ({
                                    label: e.month,
                                    value: e.amount,
                                    dim: e.dim,
                                }))}
                                height={170}
                                color="hsl(var(--success))"
                            />
                        </PanelBody>
                    </Panel>

                    <Panel>
                        <PanelHead title="Earnings by product" />
                        <PanelBody className="flex items-center gap-5">
                            <Donut
                                size={128}
                                segments={earnings.productMix.map((m) => ({
                                    value: m.pct,
                                    color: `hsl(var(--${m.color}))`,
                                }))}
                            />
                            <div className="flex flex-col gap-2">
                                {earnings.productMix.map(
                                    ({ label, pct, color }) => (
                                        <div
                                            key={label}
                                            className="flex items-center gap-2 text-[12.5px]"
                                        >
                                            <span
                                                className="size-[9px] flex-none rounded-[3px]"
                                                style={{
                                                    background: `hsl(var(--${color}))`,
                                                }}
                                            />
                                            <span className="flex-1">
                                                {label}
                                            </span>
                                            <span className="tnum font-mono font-semibold">
                                                {pct}%
                                            </span>
                                        </div>
                                    ),
                                )}
                            </div>
                        </PanelBody>
                    </Panel>
                </div>

                <Panel>
                    <PanelHead title="Payout history" />
                    <div className="mt-2">
                        <Table>
                            <THead>
                                <TR>
                                    <TH>Payout</TH>
                                    <TH>Period</TH>
                                    <TH className="hidden sm:table-cell">
                                        Method
                                    </TH>
                                    <TH className="hidden md:table-cell">
                                        Date
                                    </TH>
                                    <TH>Status</TH>
                                    <TH right>Amount</TH>
                                </TR>
                            </THead>
                            <TBody>
                                {earnings.payouts.map((p) => (
                                    <TR key={p.id}>
                                        <TD>
                                            <span className="font-mono text-[12px] font-semibold">
                                                {p.id}
                                            </span>
                                        </TD>
                                        <TD>
                                            <span className="text-[12.5px]">
                                                {p.period}
                                            </span>
                                        </TD>
                                        <TD className="hidden text-[12.5px] sm:table-cell">
                                            {p.method}
                                        </TD>
                                        <TD className="hidden md:table-cell">
                                            <span className="text-[12px] text-muted-foreground">
                                                {p.date}
                                            </span>
                                        </TD>
                                        <TD>
                                            <StatusBadge status={p.status} />
                                        </TD>
                                        <TD right>
                                            <Money
                                                value={p.amount}
                                                className={
                                                    p.status === 'success'
                                                        ? 'text-success'
                                                        : undefined
                                                }
                                            />
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                        </Table>
                    </div>
                </Panel>
            </Page>
        </>
    );
}
