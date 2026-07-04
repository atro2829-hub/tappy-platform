import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { detect, store } from '@/actions/App/Http/Controllers/TopUpController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Flag } from '@/components/ui/flag';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { OperatorMark } from '@/components/ui/operator-mark';
import { Page, PageHeader } from '@/components/ui/page';
import { Panel, PanelBody, PanelHead } from '@/components/ui/panel';
import { Progress } from '@/components/ui/progress';
import { SearchInput } from '@/components/ui/search-input';
import { Spinner } from '@/components/ui/spinner';
import { StatusBadge } from '@/components/ui/status-badge';
import { Stepper } from '@/components/ui/stepper';
import { SummaryRow } from '@/components/ui/summary-row';
import { useSandbox } from '@/hooks/use-sandbox';
import { useTransactionStatus } from '@/hooks/use-transaction-status';
import { fmt } from '@/lib/format';
import { COUNTRIES } from '@/lib/mock-data';
import type { Country, Operator } from '@/lib/mock-data';
import { refundPolicy } from '@/routes/legal';

const go = (href: string) => router.visit(href);

function xsrfToken(): string {
    const m = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

    return m ? decodeURIComponent(m[1]) : '';
}

function hueFrom(name: string): number {
    let h = 0;

    for (let i = 0; i < name.length; i++) {
        h = (h << 5) - h + name.charCodeAt(i);
        h |= 0;
    }

    return Math.abs(h) % 360;
}

/**
 * Resolve the recipient's mobile operator live via the provider, returning the
 * operator plus its local currency and exchange rate (or null when unknown).
 */
async function detectOperator(
    phone: string,
    country: string,
): Promise<Operator | null> {
    let res: Response;

    try {
        res = await fetch(detect.url(), {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': xsrfToken(),
            },
            body: JSON.stringify({ phone, country }),
        });
    } catch {
        return null;
    }

    if (!res.ok) {
        return null;
    }

    const d = await res.json().catch(() => null);

    if (!d || !d.operatorId) {
        return null;
    }

    return {
        id: String(d.operatorId),
        name: String(d.name ?? 'Operator'),
        type: d.denominationType === 'FIXED' ? 'fixed' : 'range',
        amounts: Array.isArray(d.fixedAmounts)
            ? d.fixedAmounts.map(Number)
            : [],
        min: d.minLocal ?? undefined,
        max: d.maxLocal ?? undefined,
        fx: d.fxRate ?? 1,
        cur: d.localCurrency ?? country,
        color: `hsl(${hueFrom(String(d.name ?? ''))} 58% 45%)`,
        txt: '#fff',
    };
}

interface Fees {
    fee: number;
    discount: number;
    total: number;
}

function CountryPicker({
    value,
    onSelect,
}: {
    value: Country | null;
    onSelect: (c: Country) => void;
}) {
    const [q, setQ] = useState('');
    const list = COUNTRIES.filter(
        (c) =>
            c.name.toLowerCase().includes(q.toLowerCase()) ||
            c.dial.includes(q),
    );

    return (
        <div>
            <SearchInput
                placeholder="Search 150+ countries…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="mb-3.5"
            />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
                {list.map((c) => (
                    <button
                        key={c.iso}
                        type="button"
                        onClick={() => onSelect(c)}
                        className="flex items-center gap-2.5 rounded-xl border bg-card px-3.5 py-3 text-left"
                        style={
                            value?.iso === c.iso
                                ? {
                                      borderColor: 'hsl(var(--primary))',
                                      boxShadow:
                                          '0 0 0 3px hsl(var(--ring) / 0.18)',
                                  }
                                : undefined
                        }
                    >
                        <Flag code={c.iso} size={24} />
                        <div className="min-w-0">
                            <div className="truncate text-[13px] font-semibold">
                                {c.name}
                            </div>
                            <div className="font-mono text-[11px] text-muted-foreground">
                                {c.dial} · {c.cur}
                            </div>
                        </div>
                    </button>
                ))}
                {!list.length && (
                    <div className="p-4 text-[13px] text-muted-foreground">
                        No countries match "{q}".
                    </div>
                )}
            </div>
        </div>
    );
}

function OperatorStep({
    country,
    phone,
    setPhone,
    operator,
    setOperator,
    error,
}: {
    country: Country;
    phone: string;
    setPhone: (v: string) => void;
    operator: Operator | null;
    setOperator: (o: Operator | null) => void;
    error?: string;
}) {
    const [detecting, setDetecting] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const onPhone = (v: string) => {
        setPhone(v);
        setNotFound(false);
        setOperator(null);
        const digits = v.replace(/\D/g, '');
        clearTimeout(timer.current);

        if (digits.length < 7) {
            setDetecting(false);

            return;
        }

        setDetecting(true);
        timer.current = setTimeout(() => {
            void detectOperator(`${country.dial}${digits}`, country.iso).then(
                (op) => {
                    setDetecting(false);

                    if (op) {
                        setOperator(op);
                    } else {
                        setNotFound(true);
                    }
                },
            );
        }, 700);
    };

    return (
        <div className="flex flex-col gap-[18px]">
            <Field
                label="Recipient phone number"
                error={error}
                hint={
                    !error &&
                    'We auto-detect the mobile operator from the number.'
                }
            >
                <div className="flex gap-2">
                    <div className="flex h-9 flex-none items-center gap-1.5 rounded-md border bg-muted/50 px-3">
                        <Flag code={country.iso} size={18} />
                        <span className="font-mono text-[13px]">
                            {country.dial}
                        </span>
                    </div>
                    <div className="relative flex-1">
                        <Input
                            placeholder="803 555 0142"
                            value={phone}
                            onChange={(e) => onPhone(e.target.value)}
                            aria-invalid={!!error}
                            inputMode="tel"
                        />
                        {detecting && (
                            <span className="absolute top-2.5 right-2.5 text-muted-foreground">
                                <Spinner />
                            </span>
                        )}
                        {operator && !detecting && (
                            <span className="absolute top-2.5 right-2.5 text-success">
                                <Icon name="checkcircle" className="size-4" />
                            </span>
                        )}
                    </div>
                </div>
            </Field>

            {operator && (
                <div className="fadein flex items-center gap-3 rounded-md border border-success/25 bg-success/[0.08] p-3">
                    <OperatorMark op={operator} size={34} />
                    <div className="flex-1">
                        <div className="text-[13px] font-semibold">
                            {operator.name}
                        </div>
                        <div className="text-[11.5px] font-medium text-success">
                            Operator auto-detected
                        </div>
                    </div>
                    <Badge variant="success" dot>
                        Matched
                    </Badge>
                </div>
            )}

            {notFound && !detecting && (
                <div className="flex items-center gap-2.5 rounded-md border border-warning/25 bg-warning/[0.08] p-3 text-[12.5px] text-muted-foreground">
                    <Icon
                        name="info"
                        className="size-4 flex-none text-warning"
                    />
                    We couldn't detect an operator for that number. Double-check
                    the number for {country.name}.
                </div>
            )}
        </div>
    );
}

function AmountStep({
    operator,
    country,
    amount,
    setAmount,
    error,
}: {
    operator: Operator;
    country: Country;
    amount: number;
    setAmount: (n: number) => void;
    error?: string;
}) {
    const cur = operator.cur ?? country.cur;
    const fx = operator.fx ?? 1;

    if (operator.type === 'fixed') {
        return (
            <div>
                <div className="mb-1.5 text-[12.5px] font-medium">
                    Choose a plan ({cur})
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5">
                    {(operator.amounts ?? []).map((a) => {
                        const sel = amount === a;

                        return (
                            <button
                                key={a}
                                type="button"
                                onClick={() => setAmount(a)}
                                className="rounded-xl border bg-card px-3 py-3.5 text-center"
                                style={
                                    sel
                                        ? {
                                              borderColor:
                                                  'hsl(var(--primary))',
                                              background:
                                                  'hsl(var(--primary) / 0.06)',
                                              boxShadow:
                                                  '0 0 0 3px hsl(var(--ring) / 0.18)',
                                          }
                                        : undefined
                                }
                            >
                                <div
                                    className="tnum font-mono text-base font-bold"
                                    style={
                                        sel
                                            ? { color: 'hsl(var(--primary))' }
                                            : undefined
                                    }
                                >
                                    {fmt(a, cur)}
                                </div>
                                <div className="mt-0.5 text-[11px] text-muted-foreground">
                                    ≈ {fmt(a / fx)}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <Field
            label={`Enter amount (${cur})`}
            error={error}
            hint={
                !error &&
                `Min ${fmt(operator.min ?? 0, cur)} · Max ${fmt(operator.max ?? 0, cur)}`
            }
        >
            <div className="relative flex items-center">
                <span className="absolute left-3 font-mono text-sm font-semibold text-muted-foreground">
                    {cur}
                </span>
                <Input
                    type="number"
                    placeholder="0.00"
                    value={amount || ''}
                    onChange={(e) => setAmount(+e.target.value)}
                    aria-invalid={!!error}
                    className="h-12 pl-[52px] text-base font-semibold"
                />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
                {[500, 1000, 2000, 5000].map((a) => (
                    <Button
                        key={a}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(a)}
                    >
                        {fmt(a, cur)}
                    </Button>
                ))}
            </div>
        </Field>
    );
}

function ReviewStep({
    country,
    operator,
    amount,
    phone,
    fees,
    sandbox,
}: {
    country: Country;
    operator: Operator;
    amount: number;
    phone: string;
    fees: Fees;
    sandbox: boolean;
}) {
    const cur = operator.cur ?? country.cur;
    const fx = operator.fx ?? 1;

    return (
        <div>
            <div className="mb-[18px] flex items-center gap-3">
                <OperatorMark op={operator} size={44} />
                <div>
                    <div className="text-[15px] font-bold">{operator.name}</div>
                    <div className="font-mono text-[12.5px] text-muted-foreground">
                        {country.dial} {phone}
                    </div>
                </div>
                <div className="flex-1" />
                <Flag code={country.iso} size={26} />
            </div>
            {sandbox && (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-warning/10 px-3 py-2 text-xs font-medium text-[hsl(38_92%_38%)]">
                    <Icon name="info" className="size-3.5" />
                    Sandbox mode — no real money will be charged.
                </div>
            )}
            <div className="rounded-md border px-4 py-1.5">
                <SummaryRow label="Recipient gets" strong>
                    <span className="text-success">{fmt(amount, cur)}</span>
                </SummaryRow>
                <div className="h-px bg-border" />
                <SummaryRow label="Exchange rate">
                    <span className="font-mono">
                        1 USD = {fx} {cur}
                    </span>
                </SummaryRow>
                <div className="h-px bg-border" />
                <SummaryRow label="Service fee">{fmt(fees.fee)}</SummaryRow>
                <div className="h-px bg-border" />
                <SummaryRow
                    label={
                        <span className="text-success">Loyalty discount</span>
                    }
                >
                    <span className="text-success">−{fmt(fees.discount)}</span>
                </SummaryRow>
                <div className="h-px bg-border" />
                <SummaryRow label="Total to pay" big>
                    {fmt(fees.total)}
                </SummaryRow>
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[12.5px] text-muted-foreground">
                <input
                    type="checkbox"
                    defaultChecked
                    className="mt-0.5 accent-primary"
                />
                <span>
                    I've confirmed the recipient number and operator. Top-ups
                    are non-reversible once delivered.{' '}
                    <Link
                        href={refundPolicy.url()}
                        className="text-primary hover:underline"
                    >
                        Refund policy
                    </Link>
                </span>
            </label>
        </div>
    );
}

function OrderSummary({
    country,
    operator,
    amount,
    phone,
    fees,
}: {
    country: Country | null;
    operator: Operator | null;
    amount: number;
    phone: string;
    fees: Fees | null;
}) {
    return (
        <Panel className="sticky top-[76px]">
            <PanelHead title="Order summary" />
            <PanelBody className="pt-3">
                <SummaryRow label="Destination">
                    {country ? (
                        <span className="inline-flex items-center gap-1.5">
                            <Flag code={country.iso} size={16} />
                            {country.name}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    )}
                </SummaryRow>
                <SummaryRow label="Recipient">
                    {phone && country ? (
                        <span className="font-mono">
                            {country.dial} {phone}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    )}
                </SummaryRow>
                <SummaryRow label="Operator">
                    {operator ? (
                        operator.name
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    )}
                </SummaryRow>
                <div className="my-2 h-px bg-border" />
                <SummaryRow label="Recipient gets">
                    {amount && country ? (
                        <span className="font-bold text-success">
                            {fmt(amount, operator?.cur ?? country.cur)}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    )}
                </SummaryRow>
                {fees && country && operator && (
                    <>
                        <SummaryRow label="FX rate">
                            <span className="font-mono text-muted-foreground">
                                1 USD = {operator.fx ?? 1}{' '}
                                {operator.cur ?? country.cur}
                            </span>
                        </SummaryRow>
                        <SummaryRow label="Service fee">
                            {fmt(fees.fee)}
                        </SummaryRow>
                        <SummaryRow
                            label={
                                <span className="text-success">Discount</span>
                            }
                        >
                            <span className="text-success">
                                −{fmt(fees.discount)}
                            </span>
                        </SummaryRow>
                        <div className="my-2 h-px bg-border" />
                        <SummaryRow label="You pay" big>
                            {fmt(fees.total)}
                        </SummaryRow>
                        <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                            <Icon name="clock" className="size-3" />
                            Est. delivery: instant – 30s
                        </div>
                    </>
                )}
            </PanelBody>
        </Panel>
    );
}

function TopupResult({
    result,
    processing,
    country,
    operator,
    amount,
    phone,
    fees,
    reference,
    reset,
}: {
    result: string | null;
    processing: boolean;
    country: Country;
    operator: Operator;
    amount: number;
    phone: string;
    fees: Fees;
    reference: string;
    reset: () => void;
}) {
    const cfg = {
        success: {
            icon: 'checkcircle' as const,
            tone: 'success',
            title: 'Top-up delivered!',
            desc: `${fmt(amount, operator?.cur ?? country.cur)} airtime was sent to ${country.dial} ${phone}.`,
        },
        pending: {
            icon: 'clock' as const,
            tone: 'warning',
            title: 'Top-up is processing',
            desc: `We're confirming delivery with ${operator.name}. You'll get a webhook update shortly.`,
        },
        failed: {
            icon: 'xcircle' as const,
            tone: 'destructive',
            title: 'Transaction failed',
            desc: `We couldn't reach ${operator.name}. Your wallet has been fully refunded — no money was lost.`,
        },
        // Request never completed (network/timeout) — no transaction was created
        // and nothing was charged, so we must NOT claim a refund.
        error: {
            icon: 'alert' as const,
            tone: 'warning',
            title: "Couldn't submit top-up",
            desc: "We couldn't reach the server just now — nothing was charged to your wallet. Please check your connection and try again.",
        },
    }[result ?? 'success'] ?? {
        icon: 'checkcircle' as const,
        tone: 'success',
        title: '',
        desc: '',
    };

    return (
        <Page>
            <div className="mx-auto mt-[4vh] max-w-[480px]">
                <Panel>
                    <PanelBody className="p-8 text-center">
                        {processing ? (
                            <div className="py-5">
                                <div className="mx-auto mb-[18px] size-14 text-primary">
                                    <Spinner className="size-14" />
                                </div>
                                <div className="text-base font-semibold">
                                    Processing your top-up…
                                </div>
                                <p className="mt-2 text-[13px] text-muted-foreground">
                                    Creating transaction → debiting wallet →
                                    calling provider
                                </p>
                                <div className="mt-5">
                                    <Progress value={66} />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="fadein mx-auto mb-[18px] flex size-16 items-center justify-center rounded-full"
                                    style={{
                                        background: `hsl(var(--${cfg.tone}) / 0.12)`,
                                        color: `hsl(var(--${cfg.tone}))`,
                                    }}
                                >
                                    <Icon name={cfg.icon} className="size-8" />
                                </div>
                                <h2 className="text-[21px] font-bold tracking-[-0.02em]">
                                    {cfg.title}
                                </h2>
                                <p className="mx-auto mt-2.5 max-w-[360px] text-[13.5px] leading-relaxed text-muted-foreground">
                                    {cfg.desc}
                                </p>
                                {result !== 'error' && (
                                    <div className="my-[22px] rounded-md border px-4 py-1 text-left">
                                        {reference && (
                                            <>
                                                <SummaryRow label="Reference">
                                                    <span className="font-mono text-xs">
                                                        {reference}
                                                    </span>
                                                </SummaryRow>
                                                <div className="h-px bg-border" />
                                            </>
                                        )}
                                        <SummaryRow
                                            label={
                                                result === 'failed'
                                                    ? 'Amount refunded'
                                                    : 'Amount charged'
                                            }
                                        >
                                            {fmt(fees.total)}
                                        </SummaryRow>
                                        <div className="h-px bg-border" />
                                        <SummaryRow label="Status">
                                            <StatusBadge
                                                status={result ?? 'success'}
                                            />
                                        </SummaryRow>
                                    </div>
                                )}
                                <div className="flex flex-wrap justify-center gap-2.5">
                                    <Button onClick={reset}>
                                        <Icon
                                            name={
                                                result === 'failed' ||
                                                result === 'error'
                                                    ? 'refresh'
                                                    : 'send'
                                            }
                                            className="size-4"
                                        />
                                        {result === 'failed' ||
                                        result === 'error'
                                            ? 'Try again'
                                            : 'Send another'}
                                    </Button>
                                    {result !== 'error' && (
                                        <Button
                                            variant="outline"
                                            onClick={() => go('/transactions')}
                                        >
                                            <Icon
                                                name="receipt"
                                                className="size-4"
                                            />
                                            View in history
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}
                    </PanelBody>
                </Panel>
            </div>
        </Page>
    );
}

const STEPS = ['Country', 'Recipient', 'Amount', 'Review', 'Done'];

export default function TopupFlow() {
    const { sandbox } = useSandbox();
    const [step, setStep] = useState(0);
    const [country, setCountry] = useState<Country | null>(null);
    const [phone, setPhone] = useState('');
    const [operator, setOperator] = useState<Operator | null>(null);
    const [amount, setAmount] = useState(0);
    const [errors, setErrors] = useState<{ phone?: string; amount?: string }>(
        {},
    );
    const [result, setResult] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [txnRef, setTxnRef] = useState('');

    // Live-update a pending top-up: poll until the provider settles it, then
    // reflect success/failure on the result screen without a manual refresh.
    const liveStatus = useTransactionStatus(
        txnRef || null,
        result === 'pending',
    );

    // Derive the displayed outcome from the live status (no extra state).
    const shownResult =
        liveStatus === 'success'
            ? 'success'
            : liveStatus === 'failed' || liveStatus === 'refunded'
              ? 'failed'
              : result;

    useEffect(() => {
        // Side-effect only: toast the user when a pending top-up settles.
        if (liveStatus === 'success') {
            toast.success('Top-up delivered!');
        } else if (liveStatus === 'failed' || liveStatus === 'refunded') {
            toast.error('Transaction failed', {
                description: 'Your wallet has been fully refunded.',
            });
        }
    }, [liveStatus]);

    const fees: Fees | null =
        country && operator && amount
            ? (() => {
                  const usd = amount / (operator.fx ?? 1);
                  const fee = +(usd * 0.025 + 0.2).toFixed(2);
                  const discount = +(usd * 0.01).toFixed(2);

                  return {
                      fee,
                      discount,
                      total: +(usd + fee - discount).toFixed(2),
                  };
              })()
            : null;

    const submit = async () => {
        if (!country || !operator) {
            return;
        }

        setProcessing(true);
        setStep(4);
        setResult(null);

        const digits = phone.replace(/\D/g, '');
        const usd = +(amount / (operator.fx ?? 1)).toFixed(2);

        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': xsrfToken(),
        };

        try {
            // The operator id, currency and rate were already resolved live
            // during detection, so the order can be placed directly.
            const res = await fetch(store.url(), {
                method: 'POST',
                credentials: 'same-origin',
                headers,
                body: JSON.stringify({
                    country: country.iso,
                    recipient: `${country.dial}${digits}`,
                    operator_id: String(operator.id),
                    operator_name: operator.name,
                    amount: usd,
                    local_amount: amount,
                    local_currency: operator.cur ?? country.cur,
                    type: 'airtime',
                }),
            });

            if (res.status === 422) {
                const body = await res.json().catch(() => ({}));
                setProcessing(false);
                setStep(3);
                toast.error('Could not send top-up', {
                    description:
                        body.message ??
                        'Please check the details and try again.',
                });

                return;
            }

            // 419 = expired CSRF/session token. Nothing was charged; the user
            // just needs a fresh page so the token matches.
            if (res.status === 419) {
                setProcessing(false);
                setResult('error');
                toast.error('Session expired', {
                    description:
                        'Please refresh the page, then try the top-up again.',
                });

                return;
            }

            if (!res.ok) {
                // Surface the real status code so a bounced request is
                // diagnosable instead of a vague "something went wrong".
                setProcessing(false);
                setResult('error');
                toast.error("Couldn't submit top-up", {
                    description: `Server returned ${res.status}. Nothing was charged.`,
                });

                return;
            }

            // A followed redirect (e.g. POST → /login when the session lapsed)
            // returns HTML, not JSON. Treat that as a session problem.
            if (
                res.redirected ||
                !res.headers.get('content-type')?.includes('application/json')
            ) {
                setProcessing(false);
                setResult('error');
                toast.error('Session expired', {
                    description:
                        'Please log in again, then retry — nothing was charged.',
                });

                return;
            }

            const txn = await res.json();
            const outcome =
                txn.status === 'success'
                    ? 'success'
                    : txn.status === 'processing'
                      ? 'pending'
                      : 'failed';

            setTxnRef(txn.reference);
            setResult(outcome);
            setProcessing(false);

            if (outcome === 'failed') {
                toast.error('Transaction failed', {
                    description: 'Your wallet has been fully refunded.',
                });
            } else if (outcome === 'pending') {
                toast.warning('Top-up pending', {
                    description:
                        "Provider is processing — we'll update via webhook.",
                });
            } else {
                toast.success('Top-up delivered!', {
                    description: `${fmt(amount, operator?.cur ?? country.cur)} sent to ${operator.name}.`,
                });
            }
        } catch {
            // The request itself didn't complete — no charge was made, so this
            // is an error state, not a failed-and-refunded transaction.
            setProcessing(false);
            setResult('error');
            toast.error("Couldn't submit top-up", {
                description: 'Nothing was charged. Please try again.',
            });
        }
    };

    const next = () => {
        const e: { phone?: string; amount?: string } = {};

        if (step === 0 && !country) {
            toast.warning('Select a destination country');

            return;
        }

        if (step === 1) {
            if (phone.replace(/\D/g, '').length < 7) {
                e.phone = 'Enter a valid phone number (min 7 digits).';
            }

            if (!operator) {
                e.phone = e.phone || 'Select or auto-detect an operator.';
            }
        }

        if (step === 2 && country && operator) {
            if (!amount) {
                e.amount = 'Choose or enter an amount.';
            } else if (
                operator.type === 'range' &&
                (amount < (operator.min ?? 0) || amount > (operator.max ?? 0))
            ) {
                e.amount = `Amount must be between ${fmt(operator.min ?? 0, operator.cur ?? country.cur)} and ${fmt(operator.max ?? 0, operator.cur ?? country.cur)}.`;
            }
        }

        setErrors(e);

        if (Object.keys(e).length) {
            return;
        }

        if (step === 3) {
            submit();

            return;
        }

        setStep((s) => s + 1);
    };

    const back = () => (step === 0 ? go('/dashboard') : setStep((s) => s - 1));

    const reset = () => {
        setStep(0);
        setCountry(null);
        setPhone('');
        setOperator(null);
        setAmount(0);
        setResult(null);
        setErrors({});
        setTxnRef('');
    };

    if (step === 4 && country && operator && fees) {
        return (
            <>
                <Head title="Send top-up" />
                <TopupResult
                    {...{
                        result: shownResult,
                        processing,
                        country,
                        operator,
                        amount,
                        phone,
                        fees,
                        reference: txnRef,
                        reset,
                    }}
                />
            </>
        );
    }

    return (
        <>
            <Head title="Send top-up" />
            <Page>
                <PageHeader
                    title="Send airtime top-up"
                    desc="Recharge any mobile number across 150+ countries in seconds."
                    breadcrumb={
                        <>
                            <span
                                className="cursor-pointer"
                                onClick={() => go('/dashboard')}
                            >
                                Dashboard
                            </span>
                            <Icon name="chevright" className="size-3" />
                            <span>Top-up</span>
                        </>
                    }
                />
                <div className="mb-[22px] overflow-x-auto pb-1">
                    <Stepper steps={STEPS} current={step} />
                </div>

                <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,1fr)_340px]">
                    <Panel>
                        <PanelBody>
                            {step === 0 && (
                                <CountryPicker
                                    value={country}
                                    onSelect={(c) => {
                                        setCountry(c);
                                        setOperator(null);
                                        setAmount(0);
                                    }}
                                />
                            )}
                            {step === 1 && country && (
                                <OperatorStep
                                    country={country}
                                    phone={phone}
                                    setPhone={setPhone}
                                    operator={operator}
                                    setOperator={setOperator}
                                    error={errors.phone}
                                />
                            )}
                            {step === 2 && country && operator && (
                                <AmountStep
                                    operator={operator}
                                    country={country}
                                    amount={amount}
                                    setAmount={setAmount}
                                    error={errors.amount}
                                />
                            )}
                            {step === 3 && country && operator && fees && (
                                <ReviewStep
                                    country={country}
                                    operator={operator}
                                    amount={amount}
                                    phone={phone}
                                    fees={fees}
                                    sandbox={sandbox}
                                />
                            )}
                            <div className="my-5 h-px bg-border" />
                            <div className="flex justify-between gap-3">
                                <Button variant="ghost" onClick={back}>
                                    <Icon name="chevleft" className="size-4" />
                                    {step === 0 ? 'Cancel' : 'Back'}
                                </Button>
                                <Button onClick={next}>
                                    {step === 3 ? (
                                        <>
                                            <Icon
                                                name="lock"
                                                className="size-4"
                                            />
                                            Pay {fees ? fmt(fees.total) : ''}
                                        </>
                                    ) : (
                                        <>
                                            Continue
                                            <Icon
                                                name="arrowright"
                                                className="size-4"
                                            />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </PanelBody>
                    </Panel>
                    <OrderSummary
                        country={country}
                        operator={operator}
                        amount={amount}
                        phone={phone}
                        fees={step >= 2 ? fees : null}
                    />
                </div>
            </Page>
        </>
    );
}
