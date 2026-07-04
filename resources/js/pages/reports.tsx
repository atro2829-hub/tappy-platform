import { Head } from '@inertiajs/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { BarChart, Donut, Sparkline } from '@/components/ui/charts';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/data-table';
import { Flag } from '@/components/ui/flag';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon';
import { Money } from '@/components/ui/money';
import { Page, PageHeader } from '@/components/ui/page';
import { Panel, PanelBody, PanelHead } from '@/components/ui/panel';
import { Stat } from '@/components/ui/stat';
import { Tabs } from '@/components/ui/tabs';
import { downloadCsv } from '@/lib/csv';
import { fmt, fmtInt } from '@/lib/format';

type ReportData = {
    totalRevenue: number;
    grossMargin: number;
    transactions: number;
    failureRate: number;
    revenue30d: number[];
    weekSales: { label: string; value: number }[];
    productMix: { label: string; token: string; value: number }[];
    topDestinations: {
        iso: string;
        name: string;
        volume: number;
        txns: number;
        share: number;
        margin: number;
    }[];
};

export default function ReportsScreen({ report }: { report: ReportData }) {
    const [range, setRange] = useState('30d');

    const exportCsv = () =>
        downloadCsv(
            'tappy-report.csv',
            ['Country', 'Volume', 'Transactions', 'Share', 'Margin'],
            report.topDestinations.map((c) => [
                c.name,
                c.volume,
                c.txns,
                c.share + '%',
                c.margin,
            ]),
        );

    const kpis: {
        label: string;
        value: string;
        icon: IconName;
        accent: string;
        spark?: number[];
    }[] = [
        {
            label: 'Total revenue',
            value: fmt(report.totalRevenue),
            icon: 'dollar' as IconName,
            accent: 'primary',
            spark: report.revenue30d,
        },
        {
            label: 'Gross margin',
            value: fmt(report.grossMargin),
            icon: 'percent' as IconName,
            accent: 'success',
        },
        {
            label: 'Transactions',
            value: fmtInt(report.transactions),
            icon: 'receipt' as IconName,
            accent: 'info',
        },
        {
            label: 'Failure rate',
            value: `${report.failureRate}%`,
            icon: 'alert' as IconName,
            accent: 'warning',
        },
    ];

    return (
        <>
            <Head title="Reports" />
            <Page>
                <PageHeader
                    title="Reports & analytics"
                    desc="Revenue, margin and performance across products and destinations."
                    actions={
                        <>
                            <Tabs
                                tabs={[
                                    { value: '7d', label: '7d' },
                                    { value: '30d', label: '30d' },
                                    { value: '90d', label: '90d' },
                                ]}
                                value={range}
                                onChange={setRange}
                            />
                            <Button variant="outline" onClick={exportCsv}>
                                <Icon name="download" className="size-4" />
                                Export
                            </Button>
                        </>
                    }
                />

                <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
                    {kpis.map((k) => (
                        <Stat key={k.label} {...k} />
                    ))}
                </div>

                <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                    {/* Revenue trend */}
                    <Panel>
                        <PanelHead
                            title="Revenue trend"
                            desc="Daily gross value · last 30 days"
                        />
                        <PanelBody>
                            <div className="mb-4 flex items-baseline gap-2.5">
                                <span className="tnum font-mono text-[26px] font-bold">
                                    {fmt(report.totalRevenue)}
                                </span>
                                <span className="inline-flex items-center gap-[3px] text-[12.5px] font-semibold text-success">
                                    <Icon
                                        name="trendup"
                                        className="size-[13px]"
                                    />
                                    30d
                                </span>
                            </div>
                            <Sparkline
                                data={report.revenue30d}
                                width={620}
                                height={120}
                                fill
                            />
                        </PanelBody>
                    </Panel>

                    {/* Product mix */}
                    <Panel>
                        <PanelHead title="Product mix" desc="Share of volume" />
                        <PanelBody className="flex items-center gap-5">
                            <Donut
                                size={130}
                                segments={report.productMix.map((p) => ({
                                    value: p.value,
                                    color: `hsl(var(--${p.token}))`,
                                }))}
                            />
                            <div className="flex flex-col gap-2">
                                {report.productMix.map((p) => (
                                    <div
                                        key={p.label}
                                        className="flex items-center gap-2 text-[12.5px]"
                                    >
                                        <span
                                            className="size-[9px] flex-none rounded-[3px]"
                                            style={{
                                                background: `hsl(var(--${p.token}))`,
                                            }}
                                        />
                                        <span className="flex-1">
                                            {p.label}
                                        </span>
                                        <span className="tnum font-mono font-semibold">
                                            {p.value}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </PanelBody>
                    </Panel>
                </div>

                {/* Weekly sales bar chart */}
                <Panel className="mb-4">
                    <PanelHead
                        title="Weekly sales"
                        desc="Gross transaction value"
                    />
                    <PanelBody>
                        <BarChart data={report.weekSales} height={150} />
                    </PanelBody>
                </Panel>

                {/* Top destinations table */}
                <Panel>
                    <PanelHead title="Top destinations" />
                    <div className="mt-2">
                        <Table>
                            <THead>
                                <TR>
                                    <TH>Country</TH>
                                    <TH right>Volume</TH>
                                    <TH right className="hidden sm:table-cell">
                                        Txns
                                    </TH>
                                    <TH right>Share</TH>
                                    <TH right className="hidden md:table-cell">
                                        Margin
                                    </TH>
                                </TR>
                            </THead>
                            <TBody>
                                {report.topDestinations.map((c) => (
                                    <TR key={c.iso}>
                                        <TD>
                                            <span className="inline-flex items-center gap-2">
                                                <Flag code={c.iso} size={18} />
                                                <span className="text-[12.5px] font-semibold">
                                                    {c.name}
                                                </span>
                                            </span>
                                        </TD>
                                        <TD right>
                                            <Money value={c.volume} />
                                        </TD>
                                        <TD
                                            right
                                            className="tnum hidden font-mono sm:table-cell"
                                        >
                                            {fmtInt(c.txns)}
                                        </TD>
                                        <TD right>
                                            <span className="tnum font-mono">
                                                {c.share}%
                                            </span>
                                        </TD>
                                        <TD
                                            right
                                            className="hidden md:table-cell"
                                        >
                                            <Money
                                                value={c.margin}
                                                className="text-success"
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
