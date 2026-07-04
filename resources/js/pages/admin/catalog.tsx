import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import { sync as syncCatalog } from '@/actions/App/Http/Controllers/Admin/AdminCatalogController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Flag } from '@/components/ui/flag';
import { Icon } from '@/components/ui/icon';
import { NativeSelect } from '@/components/ui/native-select';
import { OperatorMark } from '@/components/ui/operator-mark';
import { Page, PageHeader } from '@/components/ui/page';
import { Panel, PanelBody, PanelHead } from '@/components/ui/panel';
import { SearchInput } from '@/components/ui/search-input';
import { Tabs } from '@/components/ui/tabs';
import { fmt } from '@/lib/format';
import { COUNTRIES, OPERATORS } from '@/lib/mock-data';

type SyncInfo = { operators: number; countries: number; at: string };

type CatalogOperator = {
    id: string;
    name: string;
    type: string;
    amounts?: number[];
    min?: number;
    max?: number;
    color: string;
    txt: string;
};

type CatalogCountry = {
    iso: string;
    name: string;
    cur: string;
    operators: CatalogOperator[];
};

type TypeFilter = 'all' | 'fixed' | 'range';

const TYPE_TABS = [
    { value: 'all', label: 'All types' },
    { value: 'fixed', label: 'Fixed' },
    { value: 'range', label: 'Range' },
];

const MAX_RESULTS = 200;

function rangeLabel(op: CatalogOperator): string {
    return op.type === 'fixed'
        ? `${op.amounts?.length ?? 0} plans`
        : `${fmt(op.min ?? 0, '')}–${fmt(op.max ?? 0, '')}`;
}

export default function AdminCatalog({
    sync,
    catalog,
    driver,
}: {
    sync: SyncInfo | null;
    catalog: CatalogCountry[] | null;
    driver: string;
}) {
    // Use the live synced catalog when present; otherwise fall back to the
    // bundled reference catalog so the page is never empty.
    const countries: CatalogCountry[] =
        catalog && catalog.length > 0
            ? catalog
            : COUNTRIES.map((c) => ({
                  iso: c.iso,
                  name: c.name,
                  cur: c.cur,
                  operators: (OPERATORS[c.iso] ?? []) as CatalogOperator[],
              }));

    const [query, setQuery] = useState('');
    const [type, setType] = useState<TypeFilter>('all');
    const [cur, setCur] = useState('all');
    const [country, setCountry] = useState(countries[0]?.iso ?? 'NG');
    const [syncing, setSyncing] = useState(false);

    const q = query.trim().toLowerCase();
    const searching = q !== '';

    const currencies = useMemo(
        () =>
            Array.from(
                new Set(countries.map((c) => c.cur).filter(Boolean)),
            ).sort(),
        [countries],
    );

    const passesType = (op: CatalogOperator) =>
        type === 'all' || op.type === type;
    const countryMetaMatches = (c: CatalogCountry) =>
        c.name.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q) ||
        c.cur.toLowerCase().includes(q);

    // Countries shown in the left rail: must pass the currency + type filters and
    // match the query (by country metadata or by a contained operator name).
    const filteredCountries = useMemo(
        () =>
            countries.filter((c) => {
                if (cur !== 'all' && c.cur !== cur) {
                    return false;
                }

                if (!c.operators.some(passesType)) {
                    return false;
                }

                if (!q) {
                    return true;
                }

                return (
                    countryMetaMatches(c) ||
                    c.operators.some((op) => op.name.toLowerCase().includes(q))
                );
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [countries, cur, type, q],
    );

    // Flattened cross-country operator matches for search mode. A country whose
    // metadata matches contributes all its (type-passing) operators; otherwise
    // only operators whose name matches the query are included.
    const searchResults = useMemo(() => {
        if (!searching) {
            return [];
        }

        const rows: Array<{ op: CatalogOperator; country: CatalogCountry }> =
            [];

        for (const c of filteredCountries) {
            const metaHit = countryMetaMatches(c);

            for (const op of c.operators) {
                if (!passesType(op)) {
                    continue;
                }

                if (metaHit || op.name.toLowerCase().includes(q)) {
                    rows.push({ op, country: c });
                }
            }
        }

        return rows;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredCountries, q, type, searching]);

    const selectedCountry =
        filteredCountries.find((c) => c.iso === country) ??
        filteredCountries[0];
    const browseOps = (selectedCountry?.operators ?? []).filter(passesType);

    const totalOperators = useMemo(
        () =>
            filteredCountries.reduce(
                (n, c) => n + c.operators.filter(passesType).length,
                0,
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [filteredCountries, type],
    );

    const runSync = () =>
        router.post(
            syncCatalog.url(),
            {},
            {
                preserveScroll: true,
                onStart: () => setSyncing(true),
                onFinish: () => setSyncing(false),
            },
        );

    const syncedAt = sync
        ? new Date(sync.at).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
          })
        : null;

    return (
        <>
            <Head title="Countries & Operators" />
            <Page>
                <PageHeader
                    title="Countries & operators"
                    desc="Live product catalog from your connected provider. Search and filter operators across every country."
                    actions={
                        <Button onClick={runSync} disabled={syncing}>
                            <Icon name="refresh" className="size-4" />
                            {syncing ? 'Syncing…' : 'Force sync now'}
                        </Button>
                    }
                />

                <div
                    className="mb-[18px] flex items-center gap-3 rounded-xl border p-3 px-4"
                    style={{
                        background: 'hsl(var(--info) / 0.05)',
                        borderLeft: '3px solid hsl(var(--info))',
                    }}
                >
                    <Icon
                        name="info"
                        className="size-[18px] flex-none"
                        style={{ color: 'hsl(var(--info))' }}
                    />
                    <div className="flex-1">
                        <span className="text-[13px] font-semibold">
                            {syncedAt
                                ? `Catalog last synced ${syncedAt}`
                                : driver === 'reloadly'
                                  ? 'Catalog not synced yet'
                                  : 'Reference catalog (set PROVIDER_DRIVER=reloadly to sync live)'}
                        </span>
                        {sync && (
                            <span className="ml-2 hidden text-[13px] text-muted-foreground sm:inline">
                                {sync.operators.toLocaleString()} operators ·{' '}
                                {sync.countries.toLocaleString()} countries
                            </span>
                        )}
                    </div>
                </div>

                {/* Advanced search & filter toolbar */}
                <div className="mb-[18px] flex flex-col gap-3 lg:flex-row lg:items-center">
                    <SearchInput
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search operators or countries (e.g. MTN, Nigeria, NGN)…"
                        className="lg:max-w-md"
                        aria-label="Search catalog"
                    />
                    <Tabs
                        tabs={TYPE_TABS}
                        value={type}
                        onChange={(v) => setType(v as TypeFilter)}
                    />
                    <NativeSelect
                        value={cur}
                        onChange={(e) => setCur(e.target.value)}
                        className="lg:w-[170px]"
                        aria-label="Filter by currency"
                    >
                        <option value="all">All currencies</option>
                        {currencies.map((code) => (
                            <option key={code} value={code}>
                                {code}
                            </option>
                        ))}
                    </NativeSelect>
                    <div className="text-[12.5px] whitespace-nowrap text-muted-foreground lg:ml-auto">
                        {filteredCountries.length.toLocaleString()} countries ·{' '}
                        {totalOperators.toLocaleString()} operators
                    </div>
                </div>

                <div className="grid items-start gap-4 md:grid-cols-[240px_minmax(0,1fr)]">
                    <Panel>
                        <PanelBody className="max-h-[640px] overflow-y-auto p-2">
                            {filteredCountries.length === 0 ? (
                                <p className="px-2.5 py-6 text-center text-[12.5px] text-muted-foreground">
                                    No countries match.
                                </p>
                            ) : (
                                filteredCountries.map((c) => (
                                    <button
                                        key={c.iso}
                                        type="button"
                                        onClick={() => {
                                            setCountry(c.iso);
                                            setQuery('');
                                        }}
                                        className="flex w-full items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-[9px] text-left text-[13px] transition-colors"
                                        style={{
                                            background:
                                                !searching && country === c.iso
                                                    ? 'hsl(var(--accent))'
                                                    : 'transparent',
                                            fontWeight:
                                                !searching && country === c.iso
                                                    ? 600
                                                    : 450,
                                        }}
                                    >
                                        <Flag code={c.iso} size={18} />
                                        <span className="flex-1">{c.name}</span>
                                        <span className="text-[11px] text-muted-foreground">
                                            {
                                                c.operators.filter(passesType)
                                                    .length
                                            }
                                        </span>
                                    </button>
                                ))
                            )}
                        </PanelBody>
                    </Panel>

                    <Panel>
                        {searching ? (
                            <>
                                <PanelHead
                                    title={`Search results for “${query.trim()}”`}
                                    action={
                                        <Badge variant="muted">
                                            {searchResults.length.toLocaleString()}{' '}
                                            found
                                        </Badge>
                                    }
                                />
                                <div className="mt-2">
                                    {searchResults.length === 0 ? (
                                        <EmptyState
                                            icon="search"
                                            title="No operators found"
                                            desc="Try a different name, country or currency."
                                        />
                                    ) : (
                                        <Table>
                                            <THead>
                                                <TR>
                                                    <TH>Operator</TH>
                                                    <TH>Country</TH>
                                                    <TH>Type</TH>
                                                    <TH className="hidden sm:table-cell">
                                                        Range / Plans
                                                    </TH>
                                                </TR>
                                            </THead>
                                            <TBody>
                                                {searchResults
                                                    .slice(0, MAX_RESULTS)
                                                    .map(
                                                        ({
                                                            op,
                                                            country: c,
                                                        }) => (
                                                            <TR
                                                                key={`${c.iso}-${op.id}`}
                                                            >
                                                                <TD>
                                                                    <span className="inline-flex items-center gap-2.5">
                                                                        <OperatorMark
                                                                            op={
                                                                                op
                                                                            }
                                                                            size={
                                                                                28
                                                                            }
                                                                        />
                                                                        <span className="text-[12.5px] font-semibold">
                                                                            {
                                                                                op.name
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                </TD>
                                                                <TD>
                                                                    <span className="inline-flex items-center gap-2 text-[12.5px]">
                                                                        <Flag
                                                                            code={
                                                                                c.iso
                                                                            }
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                        {c.name}
                                                                    </span>
                                                                </TD>
                                                                <TD>
                                                                    <Badge variant="muted">
                                                                        {op.type ===
                                                                        'fixed'
                                                                            ? 'Fixed'
                                                                            : 'Range'}
                                                                    </Badge>
                                                                </TD>
                                                                <TD className="hidden text-[12px] sm:table-cell">
                                                                    {rangeLabel(
                                                                        op,
                                                                    )}{' '}
                                                                    <span className="font-mono text-muted-foreground">
                                                                        {c.cur}
                                                                    </span>
                                                                </TD>
                                                            </TR>
                                                        ),
                                                    )}
                                            </TBody>
                                        </Table>
                                    )}
                                    {searchResults.length > MAX_RESULTS && (
                                        <p className="px-4 py-3 text-[12px] text-muted-foreground">
                                            Showing the first {MAX_RESULTS} of{' '}
                                            {searchResults.length.toLocaleString()}{' '}
                                            matches — refine your search to
                                            narrow it down.
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <PanelHead
                                    title={`${selectedCountry?.name ?? country} operators`}
                                    action={
                                        <Badge variant="success" dot>
                                            Synced
                                        </Badge>
                                    }
                                />
                                <div className="mt-2">
                                    {browseOps.length === 0 ? (
                                        <EmptyState
                                            icon="globe"
                                            title="No operators"
                                            desc="No operators match the current filters for this country."
                                        />
                                    ) : (
                                        <Table>
                                            <THead>
                                                <TR>
                                                    <TH>Operator</TH>
                                                    <TH>Type</TH>
                                                    <TH className="hidden sm:table-cell">
                                                        Currency
                                                    </TH>
                                                    <TH>Range / Plans</TH>
                                                    <TH>Status</TH>
                                                </TR>
                                            </THead>
                                            <TBody>
                                                {browseOps.map((op) => (
                                                    <TR key={op.id}>
                                                        <TD>
                                                            <span className="inline-flex items-center gap-2.5">
                                                                <OperatorMark
                                                                    op={op}
                                                                    size={28}
                                                                />
                                                                <span className="text-[12.5px] font-semibold">
                                                                    {op.name}
                                                                </span>
                                                            </span>
                                                        </TD>
                                                        <TD>
                                                            <Badge variant="muted">
                                                                {op.type ===
                                                                'fixed'
                                                                    ? 'Fixed'
                                                                    : 'Range'}
                                                            </Badge>
                                                        </TD>
                                                        <TD className="hidden font-mono text-[12px] sm:table-cell">
                                                            {
                                                                selectedCountry?.cur
                                                            }
                                                        </TD>
                                                        <TD className="text-[12px]">
                                                            {rangeLabel(op)}
                                                        </TD>
                                                        <TD>
                                                            <Badge
                                                                variant="success"
                                                                dot
                                                            >
                                                                Active
                                                            </Badge>
                                                        </TD>
                                                    </TR>
                                                ))}
                                            </TBody>
                                        </Table>
                                    )}
                                </div>
                            </>
                        )}
                    </Panel>
                </div>
            </Page>
        </>
    );
}
