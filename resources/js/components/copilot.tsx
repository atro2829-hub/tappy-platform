import { usePage } from '@inertiajs/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import {
    ask,
    execute,
    stream,
} from '@/actions/App/Http/Controllers/CopilotController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Flag } from '@/components/ui/flag';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { StatusBadge } from '@/components/ui/status-badge';
import { useSandbox } from '@/hooks/use-sandbox';
import { ai } from '@/lib/ai-engine';
import type { AiMessage, AiTx } from '@/lib/ai-engine';
import { fmt } from '@/lib/format';
import { AI_SUGGESTIONS } from '@/lib/mock-data';
import type { SharedData } from '@/types';

const COPILOT_EVENT = 'tappy:copilot';

function xsrfToken(): string {
    const m = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

    return m ? decodeURIComponent(m[1]) : '';
}

/** Minimal typings for the Web Speech API (not in lib.dom). */
interface SpeechRecognitionResultLike {
    readonly transcript: string;
}
interface SpeechRecognitionEventLike {
    readonly results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
}
interface SpeechRecognitionErrorEventLike {
    readonly error: string;
}
interface SpeechRecognitionLike {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    maxAlternatives: number;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionCtor;
        webkitSpeechRecognition?: SpeechRecognitionCtor;
    }
}

/** Open the Copilot drawer from anywhere, optionally seeding a prompt. */
export function openCopilot(seed?: string) {
    window.dispatchEvent(
        new CustomEvent(COPILOT_EVENT, { detail: { seed: seed ?? null } }),
    );
}

function renderRich(text: string): ReactNode {
    return String(text)
        .split(/(\*\*[^*]+\*\*)/g)
        .map((p, i) =>
            p.startsWith('**') && p.endsWith('**') ? (
                <strong key={i} className="font-semibold">
                    {p.slice(2, -2)}
                </strong>
            ) : (
                <Fragment key={i}>{p}</Fragment>
            ),
        );
}

interface CopilotCtx {
    role: string;
    walletUSD: number;
    send: (text: string) => void;
    onConfirm: (msg: AiMessage) => void;
    onEdit: (msg: AiMessage) => void;
    onCancel: (msg: AiMessage) => void;
}

type ConfirmRow = [string, ReactNode, string?, string?];

/** Detail rows for the confirmation card, tailored to the draft type. */
function confirmRows(tx: AiTx): ConfirmRow[] {
    if (tx.type === 'giftcard') {
        return [
            [
                'Deliver to',
                tx.recipientName
                    ? `${tx.recipientName} · ${tx.recipientMask}`
                    : tx.recipientMask,
            ],
            ['Brand', tx.brand ?? tx.operator],
            ['Value', fmt(tx.usd), undefined, 'success'],
            ['Quantity', String(tx.quantity ?? 1)],
            ['Fee', fmt(tx.fee)],
        ];
    }

    return [
        [
            'Recipient',
            tx.recipientName
                ? `${tx.recipientName} · ${tx.recipientMask}`
                : tx.recipientMask,
        ],
        ['Country', tx.countryName, tx.country ?? undefined],
        ['Operator / provider', tx.operator],
        ['Recipient gets', fmt(tx.localAmount, tx.cur), undefined, 'success'],
        ['Fee', fmt(tx.fee)],
        ['Discount', '−' + fmt(tx.discount), undefined, 'success'],
    ];
}

function AiConfirmCard({
    msg,
    walletUSD,
    onConfirm,
    onEdit,
    onCancel,
}: {
    msg: AiMessage;
    walletUSD: number;
    onConfirm: (m: AiMessage) => void;
    onEdit: (m: AiMessage) => void;
    onCancel: (m: AiMessage) => void;
}) {
    const tx = msg.tx as AiTx;
    const status = msg.status || 'review';
    const insufficient = tx.total > walletUSD;
    const rows = confirmRows(tx);

    return (
        <div
            className="ai-card overflow-hidden rounded-xl border bg-card shadow-sm"
            style={{
                borderColor:
                    status === 'review'
                        ? 'hsl(var(--primary) / 0.35)'
                        : undefined,
            }}
        >
            <div className="flex items-center gap-2.5 border-b bg-muted/40 px-3.5 py-3">
                <div
                    className="flex size-[30px] shrink-0 items-center justify-center rounded-lg"
                    style={{
                        background:
                            tx.brandColor || 'hsl(var(--primary) / 0.12)',
                        color: tx.brandColor ? '#fff' : 'hsl(var(--primary))',
                    }}
                >
                    <Icon name={tx.icon} className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold">{tx.action}</div>
                    <div className="text-[11.5px] text-muted-foreground">
                        {tx.product}
                    </div>
                </div>
                {status === 'review' ? (
                    <Badge variant="muted">Awaiting confirmation</Badge>
                ) : status === 'processing' ? (
                    <Spinner />
                ) : status === 'cancelled' ? (
                    <Badge variant="muted">Cancelled</Badge>
                ) : (
                    <StatusBadge status={status} />
                )}
            </div>

            <div className="px-3.5 py-1.5">
                {rows.map(([k, v, iso, color]) => (
                    <div
                        key={k}
                        className="flex justify-between gap-3 border-b py-[7px] last:border-b-0"
                    >
                        <span className="text-xs text-muted-foreground">
                            {k}
                        </span>
                        <span
                            className="inline-flex items-center gap-1.5 text-right text-[12.5px] font-medium"
                            style={{
                                color: color
                                    ? `hsl(var(--${color}))`
                                    : undefined,
                            }}
                        >
                            {iso && <Flag code={iso} size={14} />}
                            {v}
                        </span>
                    </div>
                ))}
                <div className="flex justify-between gap-3 pt-2.5 pb-1.5">
                    <span className="text-[13px] font-semibold">You pay</span>
                    <span className="tnum font-mono text-base font-bold">
                        {fmt(tx.total)}
                    </span>
                </div>
                <div className="flex justify-between gap-3 text-[11.5px]">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Icon name="clock" className="size-3" />
                        {tx.eta}
                    </span>
                    <span className="text-muted-foreground">
                        Wallet: {fmt(walletUSD)}
                    </span>
                </div>
            </div>

            {status === 'review' && (
                <div className="px-3.5 pb-3.5">
                    {insufficient ? (
                        <div className="mb-2.5 flex items-center gap-2 rounded-lg bg-destructive/10 px-2.5 py-2 text-[11.5px] font-medium text-destructive">
                            <Icon name="alert" className="size-3.5" />
                            Low wallet balance. Add funds to continue.
                        </div>
                    ) : (
                        <div className="mb-2.5 flex items-center gap-1.5 rounded-lg bg-primary/[0.07] px-2.5 py-[7px] text-[11.5px] font-medium text-primary">
                            <Icon name="shieldcheck" className="size-3.5" />
                            Please confirm before we charge your wallet.
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            className="flex-1"
                            disabled={insufficient}
                            onClick={() => onConfirm(msg)}
                        >
                            <Icon name="check" className="size-3.5" />
                            Confirm{tx.highValue ? ' & verify' : ''}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(msg)}
                        >
                            <Icon name="settings" className="size-3.5" />
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onCancel(msg)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function AiMessageRow({ m, ctx }: { m: AiMessage; ctx: CopilotCtx }) {
    if (m.who === 'user') {
        return (
            <div className="ai-row user fadein">
                <div className="ai-bubble user">{m.text}</div>
            </div>
        );
    }

    const suggestions = AI_SUGGESTIONS[ctx.role] || [];

    return (
        <div className="ai-row fadein">
            <div className="ai-avatar">
                <Icon name="sparkles" className="size-[15px]" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                {m.text && (
                    <div className="ai-bubble ai">{renderRich(m.text)}</div>
                )}
                {m.kind === 'confirm' && (
                    <AiConfirmCard
                        msg={m}
                        walletUSD={ctx.walletUSD}
                        onConfirm={ctx.onConfirm}
                        onEdit={ctx.onEdit}
                        onCancel={ctx.onCancel}
                    />
                )}
                {m.examples && (
                    <div className="ai-card flex flex-wrap gap-2">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                type="button"
                                className="ai-chip"
                                onClick={() => ctx.send(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const FOOTER_CHIPS: [string, string][] = [
    ['Recharge a number', 'Recharge 01712345678 with ৳500'],
    ['Buy gift card', 'Buy a $25 Amazon gift card'],
    ['Check transaction', 'Check my last transaction'],
    ['Recommend data pack', 'Best data pack under ৳500'],
];

export function Copilot() {
    const { auth, walletBalance } = usePage<
        SharedData & { walletBalance?: number }
    >().props;
    const { sandbox } = useSandbox();
    const role = auth.user?.role ?? 'customer';
    const walletUSD = walletBalance ?? 0;

    const greeting = (): AiMessage[] => [
        ai('text', {
            text: "Hi, I'm **TopUp Copilot**. Ask me to send airtime or data, buy gift cards, schedule recharges, or check a transaction — in your own words.",
            examples: true,
        }),
    ];

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<AiMessage[]>(greeting);
    const [thinking, setThinking] = useState(false);
    const [input, setInput] = useState('');
    const [listening, setListening] = useState(false);
    const [heard, setHeard] = useState('');
    const [hv, setHv] = useState<AiMessage | null>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    const cancelRef = useRef(false);
    const heardRef = useRef('');
    const recogRef = useRef<SpeechRecognitionLike | null>(null);
    const simTimersRef = useRef<{
        interval?: ReturnType<typeof setInterval>;
        timeout?: ReturnType<typeof setTimeout>;
    }>({});

    // Clear any in-flight simulated-voice timers if the drawer unmounts.
    useEffect(
        () => () => {
            clearInterval(simTimersRef.current.interval);
            clearTimeout(simTimersRef.current.timeout);
        },
        [],
    );

    useEffect(() => {
        requestAnimationFrame(() => {
            if (bodyRef.current) {
                bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
            }
        });
    }, [messages, thinking]);

    const pushAi = (arr: AiMessage[]) => setMessages((m) => [...m, ...arr]);
    const setStatus = (id: string, status: string) =>
        setMessages((ms) =>
            ms.map((m) => (m.id === id ? { ...m, status } : m)),
        );

    // Typewriter queue: words are appended to the live AI bubble one tick at a
    // time so the reply types out, then any draft card is revealed after.
    const typer = useRef<{
        queue: string[];
        id: string | null;
        timer: ReturnType<typeof setTimeout> | null;
    }>({ queue: [], id: null, timer: null });

    useEffect(
        () => () => {
            if (typer.current.timer) {
                clearTimeout(typer.current.timer);
            }
        },
        [],
    );

    const drain = () => {
        const t = typer.current;
        const next = t.queue.shift();

        if (next === undefined || t.id === null) {
            t.timer = null;

            return;
        }

        const id = t.id;
        setMessages((ms) =>
            ms.map((m) =>
                m.id === id ? { ...m, text: (m.text ?? '') + next } : m,
            ),
        );
        t.timer = setTimeout(drain, 18);
    };

    const enqueue = (word: string) => {
        typer.current.queue.push(word);

        if (!typer.current.timer) {
            drain();
        }
    };

    const whenDrained = (cb: () => void) => {
        const check = () => {
            if (!typer.current.queue.length && !typer.current.timer) {
                cb();
            } else {
                setTimeout(check, 30);
            }
        };

        check();
    };

    // Type out the reply, then reveal the draft card (or a default line if the
    // backend returned nothing actionable). Shared by the streaming and
    // non-streaming paths.
    const revealThenAction = (reply: string, action: AiTx | null) => {
        setThinking(false);

        if (reply) {
            const id = 'a' + Math.random().toString(36).slice(2, 9);
            typer.current.id = id;
            setMessages((m) => [
                ...m,
                { id, who: 'ai', kind: 'text', text: '' },
            ]);
            (reply.match(/\S+\s*/g) ?? [reply]).forEach(enqueue);
        }

        whenDrained(() => {
            typer.current.id = null;

            if (action) {
                pushAi([ai('confirm', { tx: { ...action, id: 'draft' } })]);
            } else if (!reply) {
                pushAi([
                    ai('text', {
                        text: "I'm here to help with top-ups, gift cards, bills and transactions.",
                    }),
                ]);
            }
        });
    };

    const headers = () => ({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken(),
    });

    // Preferred path: consume the Server-Sent Events stream, accumulating the
    // reply chunks and the draft action, then type the reply out.
    const streamReply = async (text: string) => {
        const res = await fetch(stream.url(), {
            method: 'POST',
            credentials: 'same-origin',
            headers: headers(),
            body: JSON.stringify({ message: text }),
        });

        if (!res.ok || !res.body) {
            throw new Error('stream-unavailable');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let reply = '';
        let action: AiTx | null = null;

        for (;;) {
            const { value, done } = await reader.read();

            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            const frames = buffer.split('\n\n');
            buffer = frames.pop() ?? '';

            for (const frame of frames) {
                if (!frame.trim()) {
                    continue;
                }

                let event = 'message';
                let data = '';

                for (const line of frame.split('\n')) {
                    if (line.startsWith('event:')) {
                        event = line.slice(6).trim();
                    } else if (line.startsWith('data:')) {
                        data += line.slice(5).trim();
                    }
                }

                if (!data) {
                    continue;
                }

                try {
                    const payload = JSON.parse(data);

                    if (event === 'chunk') {
                        reply += String(payload.text ?? '');
                    } else if (event === 'action' && payload.action) {
                        action = payload.action as AiTx;
                    }
                } catch {
                    // Ignore malformed frames.
                }
            }
        }

        revealThenAction(reply, action);
    };

    const send = (text: string) => {
        if (!text || !text.trim()) {
            return;
        }

        setMessages((m) => [
            ...m,
            {
                id: 'u' + Math.random().toString(36).slice(2, 9),
                who: 'user',
                kind: 'text',
                text,
            },
        ]);
        setInput('');
        setThinking(true);

        // Stream first; fall back to the plain request (still typed out) if the
        // browser or network can't stream, and surface an honest error if the
        // backend is unreachable entirely.
        streamReply(text).catch(() =>
            fetch(ask.url(), {
                method: 'POST',
                credentials: 'same-origin',
                headers: headers(),
                body: JSON.stringify({ message: text }),
            })
                .then((r) =>
                    r.ok ? r.json() : Promise.reject(new Error('ai')),
                )
                .then((data: { reply: string; action: AiTx | null }) => {
                    revealThenAction(data.reply, data.action);
                })
                .catch(() => {
                    setThinking(false);
                    pushAi([
                        ai('text', {
                            text: "Sorry — I couldn't reach the Copilot just now. Please try again in a moment.",
                        }),
                    ]);
                }),
        );
    };

    // open + seed via the global event bus
    const lastSeed = useRef<string | null>(null);
    useEffect(() => {
        const handler = (e: Event) => {
            const seed =
                (e as CustomEvent<{ seed: string | null }>).detail?.seed ??
                null;
            setOpen(true);

            if (seed && seed !== lastSeed.current) {
                lastSeed.current = seed;
                setTimeout(() => send(seed), 350);
            }
        };
        window.addEventListener(COPILOT_EVENT, handler);

        return () => window.removeEventListener(COPILOT_EVENT, handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role]);

    const close = () => {
        setOpen(false);
        lastSeed.current = null;
    };

    // Close the drawer on Escape, matching every other modal in the app.
    useEffect(() => {
        if (!open) {
            return;
        }

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                close();
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    const proceed = (msg: AiMessage) => {
        const tx0 = msg.tx as AiTx;

        // A real top-up or gift card drafted by the AI backend — execute it for
        // real against the server-side draft.
        if (tx0?.type === 'topup' || tx0?.type === 'giftcard') {
            setStatus(msg.id, 'processing');

            fetch(execute.url(), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken(),
                },
                body: JSON.stringify({ action: tx0 }),
            })
                .then((r) => r.json())
                .then(
                    (out: {
                        reference?: string;
                        status?: string;
                        message?: string;
                    }) => {
                        if (!out.reference) {
                            setStatus(msg.id, 'review');
                            toast.error('Could not complete', {
                                description: out.message ?? 'Please try again.',
                            });

                            return;
                        }

                        const failed =
                            out.status === 'failed' ||
                            out.status === 'refunded';
                        const ok = out.status === 'success';
                        setStatus(
                            msg.id,
                            failed ? 'failed' : ok ? 'success' : 'processing',
                        );
                        pushAi([
                            ai('text', {
                                text: failed
                                    ? `⚠️ That transaction failed and I've **refunded your wallet in full** — no money was lost. Want to try again?`
                                    : ok
                                      ? `✅ Done! **${tx0.product}** delivered to ${tx0.recipientMask}. Reference \`${out.reference}\`. Anything else?`
                                      : `⏳ It's processing — I'll update you the moment it settles. Reference \`${out.reference}\`.`,
                            }),
                        ]);
                        toast[failed ? 'error' : ok ? 'success' : 'warning'](
                            failed
                                ? 'Failed — refunded'
                                : ok
                                  ? 'Delivered'
                                  : 'Processing',
                            { description: tx0.product },
                        );
                    },
                )
                .catch(() => {
                    setStatus(msg.id, 'review');
                    toast.error('Something went wrong', {
                        description: 'Please try again.',
                    });
                });

            return;
        }

        // The backend only drafts executable top-ups today; anything else can't
        // be completed here — surface that instead of leaving the button inert.
        setStatus(msg.id, 'review');
        toast.error('Not available', {
            description: "This action can't be completed from chat yet.",
        });
    };

    const ctx: CopilotCtx = {
        role,
        walletUSD,
        send,
        onConfirm: (msg) => (msg.tx?.highValue ? setHv(msg) : proceed(msg)),
        onEdit: () =>
            pushAi([
                ai('text', {
                    text: "Sure — tell me what to change (amount, recipient, or operator) and I'll update the order.",
                }),
            ]),
        onCancel: (msg) => {
            setStatus(msg.id, 'cancelled');
            pushAi([
                ai('text', {
                    text: "No problem — I cancelled that. Your wallet wasn't charged.",
                }),
            ]);
        },
    };

    const runSimVoice = () => {
        const sample = (AI_SUGGESTIONS[role] || [
            'Recharge 01712345678 with ৳500',
        ])[0];
        setListening(true);
        setHeard('');
        cancelRef.current = false;
        let i = 0;
        simTimersRef.current.interval = setInterval(() => {
            i += 2;
            setHeard(sample.slice(0, i));
        }, 32);
        simTimersRef.current.timeout = setTimeout(() => {
            clearInterval(simTimersRef.current.interval);
            setListening(false);
            setHeard('');

            if (!cancelRef.current) {
                send(sample);
            }
        }, 1700);
    };

    const startVoice = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SR) {
            return runSimVoice();
        }

        let r: SpeechRecognitionLike;

        try {
            r = new SR();
        } catch {
            return runSimVoice();
        }

        recogRef.current = r;
        r.lang = 'en-US';
        r.interimResults = true;
        r.continuous = false;
        r.maxAlternatives = 1;
        cancelRef.current = false;
        heardRef.current = '';
        setHeard('');
        setListening(true);

        r.onresult = (e) => {
            const txt = Array.from(e.results)
                .map((x) => x[0].transcript)
                .join('');
            heardRef.current = txt;
            setHeard(txt);
        };
        r.onerror = (e) => {
            if (
                e.error === 'not-allowed' ||
                e.error === 'service-not-allowed' ||
                e.error === 'audio-capture'
            ) {
                runSimVoice();
            } else {
                setListening(false);
                setHeard('');
            }
        };
        r.onend = () => {
            setListening(false);
            const txt = heardRef.current;
            heardRef.current = '';
            setHeard('');

            if (txt && txt.trim() && !cancelRef.current) {
                send(txt);
            }
        };

        try {
            r.start();
        } catch {
            runSimVoice();
        }
    };

    const cancelVoice = () => {
        cancelRef.current = true;

        if (recogRef.current) {
            try {
                recogRef.current.stop();
            } catch {
                // ignore
            }
        }

        setListening(false);
        setHeard('');
    };

    if (!open) {
        return null;
    }

    return (
        <>
            <div className="ai-overlay" onClick={close} />
            <div className="ai-drawer" role="dialog" aria-label="TopUp Copilot">
                <div className="flex flex-none items-center gap-2.5 border-b px-4 py-3.5">
                    <div className="ai-avatar size-8">
                        <Icon name="sparkles" className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-sm font-bold tracking-[-0.01em]">
                            TopUp Copilot
                            <span className="size-1.5 rounded-full bg-success" />
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                            {sandbox && role !== 'customer'
                                ? 'Sandbox mode'
                                : 'AI assistant'}{' '}
                            · you always confirm
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        title="New chat"
                        onClick={() => setMessages(greeting())}
                    >
                        <Icon name="plus" className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={close}
                        aria-label="Close Copilot"
                        title="Close"
                    >
                        <Icon name="x" className="size-4" />
                    </Button>
                </div>

                <div className="ai-body" ref={bodyRef}>
                    {messages.map((m) => (
                        <AiMessageRow key={m.id} m={m} ctx={ctx} />
                    ))}
                    {thinking && (
                        <div className="ai-row fadein">
                            <div className="ai-avatar">
                                <Icon name="sparkles" className="size-[15px]" />
                            </div>
                            <div className="ai-bubble ai !p-0">
                                <div className="ai-typing">
                                    <i />
                                    <i />
                                    <i />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="ai-foot">
                    <div className="mb-2.5 flex gap-1.5 overflow-x-auto pb-0.5">
                        {FOOTER_CHIPS.map(([label, prompt]) => (
                            <button
                                key={label}
                                type="button"
                                className="ai-chip flex-none"
                                onClick={() => send(prompt)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    {listening ? (
                        <div className="ai-input">
                            <div className="flex min-h-10 flex-1 items-center gap-2.5 rounded-xl border border-primary px-3.5 py-2 text-primary">
                                <span className="ai-listening flex-none">
                                    <i />
                                    <i />
                                    <i />
                                    <i />
                                    <i />
                                </span>
                                <span
                                    className="text-[12.5px] font-medium"
                                    style={{
                                        color: heard
                                            ? 'hsl(var(--foreground))'
                                            : undefined,
                                    }}
                                >
                                    {heard || 'Listening…'}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={cancelVoice}
                            >
                                <Icon name="x" className="size-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="ai-input">
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Bulk top-up"
                                onClick={() => send('Bulk top-up from CSV')}
                            >
                                <Icon name="upload" className="size-[17px]" />
                            </Button>
                            <textarea
                                className="ai-textarea"
                                rows={1}
                                aria-label="Message Copilot"
                                placeholder="Ask Copilot anything…"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        send(input);
                                    }
                                }}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Voice input"
                                onClick={startVoice}
                            >
                                <Icon name="mic" className="size-[17px]" />
                            </Button>
                            <Button size="icon" onClick={() => send(input)}>
                                <Icon name="send" className="size-4" />
                            </Button>
                        </div>
                    )}
                    <div className="mt-2 flex items-center justify-center gap-1.5 text-[10.5px] text-muted-foreground">
                        <Icon name="shield" className="size-3" />
                        You're always in control — AI never completes a paid
                        action without your confirmation.
                    </div>
                </div>
            </div>

            <Dialog open={!!hv} onOpenChange={(o) => !o && setHv(null)}>
                <DialogContent className="max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Icon
                                name="shieldcheck"
                                className="size-5 text-warning"
                            />
                            Confirm high-value transaction
                        </DialogTitle>
                        <DialogDescription>
                            {hv &&
                                `You're about to charge your wallet ${fmt(hv.tx!.total)} for ${hv.tx!.product}. For your security we ask you to confirm high-value actions twice.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setHv(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                const m = hv;
                                setHv(null);

                                if (m) {
                                    proceed(m);
                                }
                            }}
                        >
                            <Icon name="lock" className="size-4" />
                            Confirm &amp; charge {hv && fmt(hv.tx!.total)}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function CopilotLauncher() {
    return (
        <button
            type="button"
            className="ai-launcher"
            onClick={() => openCopilot()}
            title="Ask TopUp Copilot"
            aria-label="Ask Copilot"
        >
            <Icon name="sparkles" className="size-[22px]" />
            <span className="pulse" />
        </button>
    );
}

type RecentAction = {
    icon: IconNameLite;
    tone: string;
    text: string;
    re: string;
};

export function AiCmdBar({ showRecent = false }: { showRecent?: boolean }) {
    const { auth, recentAiActions } = usePage<
        SharedData & { recentAiActions?: RecentAction[] }
    >().props;
    const role = auth.user?.role ?? 'customer';
    const recent = recentAiActions ?? [];
    const [val, setVal] = useState('');

    const chips: [string, string][] =
        role === 'admin'
            ? [
                  [
                      'Why did transactions fail today?',
                      'Why did transactions fail today?',
                  ],
                  ['Show high-risk users', 'Show high-risk users'],
                  ['Summarize pending refunds', 'Summarize pending refunds'],
              ]
            : [
                  ['Recharge a number', 'Recharge 01712345678 with ৳500'],
                  ['Buy gift card', 'Buy a $25 Amazon gift card'],
                  ['Check transaction', 'Check my last transaction'],
                  ['Recommend data pack', 'Best data pack under ৳500'],
                  ['Bulk top-up help', 'Bulk top-up from CSV'],
              ];

    const ask = (text: string) => {
        if (!text.trim()) {
            return;
        }

        openCopilot(text);
        setVal('');
    };

    return (
        <div className="mb-[18px]">
            <div className="ai-cmdbar">
                <div className="ai-cmdbar-inner">
                    <div className="ai-avatar size-[30px]">
                        <Icon name="sparkles" className="size-4" />
                    </div>
                    <input
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && ask(val)}
                        placeholder="Ask AI to send top-up, buy gift card, or check transaction…"
                        className="min-w-0 flex-1 border-none bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground"
                    />
                    <kbd className="hidden items-center rounded border bg-muted px-[5px] py-0.5 font-mono text-[11px] text-muted-foreground sm:inline-flex">
                        AI
                    </kbd>
                    <Button
                        size="sm"
                        className="hidden sm:inline-flex"
                        onClick={() => ask(val)}
                    >
                        <Icon name="arrowright" className="size-3.5" />
                        Ask
                    </Button>
                    <Button
                        size="icon"
                        className="sm:hidden"
                        aria-label="Ask"
                        onClick={() => ask(val)}
                    >
                        <Icon name="arrowright" className="size-[15px]" />
                    </Button>
                </div>
            </div>
            <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5">
                {chips.map(([label, prompt]) => (
                    <button
                        key={label}
                        type="button"
                        className="ai-chip flex-none"
                        onClick={() => ask(prompt)}
                    >
                        <Icon name="sparkles" className="size-3" />
                        {label}
                    </button>
                ))}
            </div>
            {showRecent && recent.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-3.5">
                    <span className="text-[11px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">
                        Recent AI actions
                    </span>
                    {recent.map((r, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => ask(r.re)}
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                        >
                            <Icon
                                name={r.icon}
                                className="size-3.5"
                                style={{ color: `hsl(var(--${r.tone}))` }}
                            />
                            {r.text}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

type IconNameLite = 'checkcircle' | 'clock';
