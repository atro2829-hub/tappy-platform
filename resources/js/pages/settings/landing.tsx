import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import {
    landing as landingRoute,
    resetLanding,
    updateLanding,
} from '@/actions/App/Http/Controllers/Admin/AdminSettingsController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { SharedData } from '@/types';
import type { LandingContent, LandingSection } from '@/types/landing';

interface Props {
    content: LandingContent;
}

// Curated icon names offered in the per-item icon pickers.
const ICON_CHOICES: IconName[] = [
    'phone',
    'signal',
    'gift',
    'layers',
    'zap',
    'wallet',
    'receipt',
    'chart',
    'code',
    'key',
    'webhook',
    'shield',
    'shieldcheck',
    'lock',
    'fingerprint',
    'cpu',
    'globe',
    'flag',
    'audit',
    'percent',
    'dollar',
    'card',
    'bell',
    'check',
    'checkcircle',
    'sparkles',
    'send',
    'star',
    'bookmark',
    'wifi',
    'flame',
    'trendup',
    'trenddown',
    'users',
    'user',
    'building',
    'headset',
    'grid',
    'clock',
    'mail',
    'device',
    'hash',
    'droplet',
    'tv',
    'list',
];

const TONE_CHOICES = ['primary', 'info', 'violet', 'warning', 'success'];

/** Immutably set a deep value by path. */
function setIn(
    obj: unknown,
    path: (string | number)[],
    value: unknown,
): unknown {
    if (path.length === 0) {
        return value;
    }

    const [head, ...rest] = path;

    if (Array.isArray(obj)) {
        const copy = [...obj];
        copy[head as number] = setIn(copy[head as number], rest, value);

        return copy;
    }

    const copy = { ...(obj as Record<string, unknown>) };
    copy[head as string] = setIn(copy[head as string], rest, value);

    return copy;
}

/** Read a deep value by path. */
function getIn(obj: unknown, path: (string | number)[]): unknown {
    return path.reduce<unknown>(
        (acc, key) => (acc as Record<string, unknown> | undefined)?.[key],
        obj,
    );
}

function TextField({
    label,
    value,
    onChange,
    placeholder,
    mono,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    mono?: boolean;
}) {
    return (
        <label className="block space-y-1.5">
            <span className="text-[12.5px] font-medium">{label}</span>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={mono ? 'font-mono text-[12px]' : undefined}
            />
        </label>
    );
}

function AreaField({
    label,
    value,
    onChange,
    rows = 3,
    mono,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    rows?: number;
    mono?: boolean;
}) {
    return (
        <label className="block space-y-1.5">
            <span className="text-[12.5px] font-medium">{label}</span>
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                className={mono ? 'font-mono text-[12px]' : undefined}
            />
        </label>
    );
}

function IconSelect({
    value,
    onChange,
}: {
    value: IconName;
    onChange: (v: string) => void;
}) {
    const opts = ICON_CHOICES.includes(value)
        ? ICON_CHOICES
        : [value, ...ICON_CHOICES];

    return (
        <label className="block space-y-1.5">
            <span className="text-[12.5px] font-medium">Icon</span>
            <div className="flex items-center gap-2">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-primary">
                    <Icon name={value} className="size-4" />
                </span>
                <NativeSelect
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {opts.map((ic) => (
                        <option key={ic} value={ic}>
                            {ic}
                        </option>
                    ))}
                </NativeSelect>
            </div>
        </label>
    );
}

function SectionCard({
    title,
    description,
    enabled,
    onToggle,
    onReset,
    busy,
    children,
}: {
    title: string;
    description?: string;
    enabled?: boolean;
    onToggle?: (v: boolean) => void;
    onReset: () => void;
    busy: boolean;
    children: ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <section className="rounded-xl border">
            <div className="flex items-center gap-3 px-4 py-3">
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    className="flex flex-1 items-center gap-2.5 text-left"
                    aria-expanded={open}
                >
                    <Icon
                        name={open ? 'chevdown' : 'chevright'}
                        className="size-4 shrink-0 text-muted-foreground"
                    />
                    <span>
                        <span className="block text-[13.5px] font-semibold">
                            {title}
                        </span>
                        {description && (
                            <span className="block text-[12px] text-muted-foreground">
                                {description}
                            </span>
                        )}
                    </span>
                </button>
                {onToggle && (
                    <span className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">
                            {enabled ? 'Visible' : 'Hidden'}
                        </span>
                        <Switch
                            checked={!!enabled}
                            onCheckedChange={onToggle}
                            aria-label={`Show ${title} section`}
                        />
                    </span>
                )}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground"
                    onClick={onReset}
                    disabled={busy}
                >
                    <Icon name="refresh" className="size-3.5" />
                    Reset
                </Button>
            </div>
            {open && (
                <div className="space-y-4 border-t px-4 py-4">{children}</div>
            )}
        </section>
    );
}

function ListEditor<T>({
    items,
    onAdd,
    onRemove,
    addLabel,
    render,
}: {
    items: T[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    addLabel: string;
    render: (item: T, index: number) => ReactNode;
}) {
    return (
        <div className="space-y-2.5">
            {items.map((item, i) => (
                <div
                    key={i}
                    className="space-y-2.5 rounded-lg border bg-muted/20 p-3"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-muted-foreground">
                            #{i + 1}
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1.5 text-xs text-destructive"
                            onClick={() => onRemove(i)}
                            aria-label="Remove item"
                        >
                            <Icon name="trash" className="size-3.5" />
                        </Button>
                    </div>
                    {render(item, i)}
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={onAdd}>
                <Icon name="plus" className="size-3.5" />
                {addLabel}
            </Button>
        </div>
    );
}

export default function LandingSettings({ content }: Props) {
    const { props } = usePage<SharedData & { content: LandingContent }>();
    const serverImage = props.content.seo?.image ?? null;

    const [c, setC] = useState<LandingContent>(content);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);

    const [ogFile, setOgFile] = useState<File | null>(null);
    const [ogRemoved, setOgRemoved] = useState(false);
    const [ogPreview, setOgPreview] = useState<string | null>(null);
    const ogObjectUrl = useRef<string | null>(null);
    const ogInput = useRef<HTMLInputElement>(null);

    useEffect(
        () => () => {
            if (ogObjectUrl.current) {
                URL.revokeObjectURL(ogObjectUrl.current);
            }
        },
        [],
    );

    const upd = (path: (string | number)[], value: unknown) =>
        setC((prev) => setIn(prev, path, value) as LandingContent);

    const addTo = (path: (string | number)[], item: unknown) =>
        setC(
            (prev) =>
                setIn(prev, path, [
                    ...(getIn(prev, path) as unknown[]),
                    item,
                ]) as LandingContent,
        );

    const removeAt = (path: (string | number)[], index: number) =>
        setC(
            (prev) =>
                setIn(
                    prev,
                    path,
                    (getIn(prev, path) as unknown[]).filter(
                        (_, i) => i !== index,
                    ),
                ) as LandingContent,
        );

    const previewSrc = ogRemoved ? null : (ogPreview ?? serverImage);

    const pickOg = (file: File | null) => {
        if (ogObjectUrl.current) {
            URL.revokeObjectURL(ogObjectUrl.current);
            ogObjectUrl.current = null;
        }

        if (file) {
            const url = URL.createObjectURL(file);
            ogObjectUrl.current = url;
            setOgPreview(url);
            setOgFile(file);
            setOgRemoved(false);
        } else {
            setOgPreview(null);
            setOgFile(null);
        }
    };

    const removeOg = () => {
        pickOg(null);
        setOgRemoved(true);
    };

    const save = () => {
        const payload: LandingContent = { ...c, seo: { ...c.seo } };
        delete payload.seo.image;
        delete payload.seo.image_path;

        setSaving(true);
        router.post(
            updateLanding().url,
            {
                content: JSON.stringify(payload),
                og_image: ogFile,
                remove_og_image: ogRemoved,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setOgFile(null);
                    setOgRemoved(false);

                    if (ogObjectUrl.current) {
                        URL.revokeObjectURL(ogObjectUrl.current);
                        ogObjectUrl.current = null;
                    }

                    setOgPreview(null);
                },
                onFinish: () => setSaving(false),
            },
        );
    };

    // Server-side reset; the POST remounts this page with the refreshed content.
    const reset = (section: LandingSection) => {
        setResetting(true);
        router.post(
            resetLanding().url,
            { section },
            {
                preserveScroll: true,
                onFinish: () => setResetting(false),
            },
        );
    };

    const busy = saving || resetting;

    return (
        <>
            <Head title="Landing page" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <Heading
                        variant="small"
                        title="Landing page"
                        description="Edit every section of your public homepage. Changes go live on save."
                    />
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href="/" target="_blank" rel="noreferrer">
                                <Icon name="external" className="size-3.5" />
                                View live
                            </a>
                        </Button>
                        <Button onClick={save} disabled={busy}>
                            {saving ? 'Saving…' : 'Save changes'}
                        </Button>
                    </div>
                </div>

                {/* ── SEO & social ─────────────────────────────────────── */}
                <SectionCard
                    title="SEO & social meta"
                    description="Browser title, search description and share image."
                    onReset={() => reset('seo')}
                    busy={busy}
                >
                    <TextField
                        label="Page title"
                        value={c.seo.title}
                        onChange={(v) => upd(['seo', 'title'], v)}
                    />
                    <AreaField
                        label="Meta description"
                        value={c.seo.description}
                        onChange={(v) => upd(['seo', 'description'], v)}
                        rows={2}
                    />
                    <div className="space-y-1.5">
                        <span className="text-[12.5px] font-medium">
                            Social-share image
                        </span>
                        <div className="flex h-[120px] items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/30">
                            {previewSrc ? (
                                <img
                                    src={previewSrc}
                                    alt=""
                                    className="max-h-full max-w-full object-contain"
                                />
                            ) : (
                                <Icon
                                    name="upload"
                                    className="size-6 text-muted-foreground"
                                />
                            )}
                        </div>
                        <input
                            ref={ogInput}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) =>
                                pickOg(e.target.files?.[0] ?? null)
                            }
                        />
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => ogInput.current?.click()}
                            >
                                Upload image
                            </Button>
                            {previewSrc && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs text-destructive"
                                    onClick={removeOg}
                                >
                                    <Icon name="trash" className="size-3.5" />
                                    Remove
                                </Button>
                            )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            PNG, JPG or WebP · 1200×630px recommended.
                        </p>
                    </div>
                </SectionCard>

                {/* ── Navigation ───────────────────────────────────────── */}
                <SectionCard
                    title="Navigation bar"
                    description="Header menu links and button labels."
                    onReset={() => reset('nav')}
                    busy={busy}
                >
                    <div className="space-y-1.5">
                        <span className="text-[12.5px] font-medium">
                            Menu links
                        </span>
                        <ListEditor
                            items={c.nav.links}
                            addLabel="Add link"
                            onAdd={() =>
                                addTo(['nav', 'links'], {
                                    label: '',
                                    anchor: '',
                                })
                            }
                            onRemove={(i) => removeAt(['nav', 'links'], i)}
                            render={(link, i) => (
                                <div className="grid grid-cols-2 gap-2.5">
                                    <TextField
                                        label="Label"
                                        value={link.label}
                                        onChange={(v) =>
                                            upd(['nav', 'links', i, 'label'], v)
                                        }
                                    />
                                    <TextField
                                        label="Anchor (section id)"
                                        value={link.anchor}
                                        onChange={(v) =>
                                            upd(
                                                ['nav', 'links', i, 'anchor'],
                                                v,
                                            )
                                        }
                                    />
                                </div>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                        <TextField
                            label="Docs label"
                            value={c.nav.docs_label}
                            onChange={(v) => upd(['nav', 'docs_label'], v)}
                        />
                        <TextField
                            label="Sign-in label"
                            value={c.nav.sign_in_label}
                            onChange={(v) => upd(['nav', 'sign_in_label'], v)}
                        />
                        <TextField
                            label="Start button label"
                            value={c.nav.start_label}
                            onChange={(v) => upd(['nav', 'start_label'], v)}
                        />
                        <TextField
                            label="Dashboard button label"
                            value={c.nav.dashboard_label}
                            onChange={(v) => upd(['nav', 'dashboard_label'], v)}
                        />
                    </div>
                </SectionCard>

                {/* ── Hero ─────────────────────────────────────────────── */}
                <SectionCard
                    title="Hero"
                    description="Headline, badges and the preview card."
                    onReset={() => reset('hero')}
                    busy={busy}
                >
                    <TextField
                        label="Badge"
                        value={c.hero.badge}
                        onChange={(v) => upd(['hero', 'badge'], v)}
                    />
                    <div className="grid grid-cols-2 gap-2.5">
                        <TextField
                            label="Headline"
                            value={c.hero.title}
                            onChange={(v) => upd(['hero', 'title'], v)}
                        />
                        <TextField
                            label="Headline (highlighted)"
                            value={c.hero.title_highlight}
                            onChange={(v) =>
                                upd(['hero', 'title_highlight'], v)
                            }
                        />
                    </div>
                    <AreaField
                        label="Subheading"
                        value={c.hero.subheading}
                        onChange={(v) => upd(['hero', 'subheading'], v)}
                    />
                    <div className="grid grid-cols-2 gap-2.5">
                        <TextField
                            label="Primary button"
                            value={c.hero.primary_cta}
                            onChange={(v) => upd(['hero', 'primary_cta'], v)}
                        />
                        <TextField
                            label="Secondary button"
                            value={c.hero.secondary_cta}
                            onChange={(v) => upd(['hero', 'secondary_cta'], v)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <span className="text-[12.5px] font-medium">
                            Trust badges
                        </span>
                        <ListEditor
                            items={c.hero.badges}
                            addLabel="Add badge"
                            onAdd={() => addTo(['hero', 'badges'], '')}
                            onRemove={(i) => removeAt(['hero', 'badges'], i)}
                            render={(badge, i) => (
                                <Input
                                    value={badge}
                                    onChange={(e) =>
                                        upd(
                                            ['hero', 'badges', i],
                                            e.target.value,
                                        )
                                    }
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-3 rounded-lg border border-dashed p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[12.5px] font-medium">
                                Preview card
                            </span>
                            <Switch
                                checked={c.hero.preview.enabled}
                                onCheckedChange={(v) =>
                                    upd(['hero', 'preview', 'enabled'], v)
                                }
                                aria-label="Show preview card"
                            />
                        </div>
                        <TextField
                            label="Caption"
                            value={c.hero.preview.label}
                            onChange={(v) =>
                                upd(['hero', 'preview', 'label'], v)
                            }
                        />
                        <ListEditor
                            items={c.hero.preview.metrics}
                            addLabel="Add metric"
                            onAdd={() =>
                                addTo(['hero', 'preview', 'metrics'], {
                                    label: '',
                                    value: '',
                                    icon: 'wallet',
                                    tone: 'primary',
                                })
                            }
                            onRemove={(i) =>
                                removeAt(['hero', 'preview', 'metrics'], i)
                            }
                            render={(m, i) => (
                                <>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <TextField
                                            label="Label"
                                            value={m.label}
                                            onChange={(v) =>
                                                upd(
                                                    [
                                                        'hero',
                                                        'preview',
                                                        'metrics',
                                                        i,
                                                        'label',
                                                    ],
                                                    v,
                                                )
                                            }
                                        />
                                        <TextField
                                            label="Value"
                                            value={m.value}
                                            onChange={(v) =>
                                                upd(
                                                    [
                                                        'hero',
                                                        'preview',
                                                        'metrics',
                                                        i,
                                                        'value',
                                                    ],
                                                    v,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <IconSelect
                                            value={m.icon}
                                            onChange={(v) =>
                                                upd(
                                                    [
                                                        'hero',
                                                        'preview',
                                                        'metrics',
                                                        i,
                                                        'icon',
                                                    ],
                                                    v,
                                                )
                                            }
                                        />
                                        <label className="block space-y-1.5">
                                            <span className="text-[12.5px] font-medium">
                                                Color
                                            </span>
                                            <NativeSelect
                                                value={m.tone}
                                                onChange={(e) =>
                                                    upd(
                                                        [
                                                            'hero',
                                                            'preview',
                                                            'metrics',
                                                            i,
                                                            'tone',
                                                        ],
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                {TONE_CHOICES.map((t) => (
                                                    <option key={t} value={t}>
                                                        {t}
                                                    </option>
                                                ))}
                                            </NativeSelect>
                                        </label>
                                    </div>
                                </>
                            )}
                        />
                    </div>
                </SectionCard>

                {/* ── Copilot ──────────────────────────────────────────── */}
                <SectionCard
                    title="Copilot section"
                    description="AI assistant pitch and the 3 how-it-works steps."
                    enabled={c.copilot.enabled}
                    onToggle={(v) => upd(['copilot', 'enabled'], v)}
                    onReset={() => reset('copilot')}
                    busy={busy}
                >
                    <TextField
                        label="Badge"
                        value={c.copilot.badge}
                        onChange={(v) => upd(['copilot', 'badge'], v)}
                    />
                    <TextField
                        label="Headline"
                        value={c.copilot.title}
                        onChange={(v) => upd(['copilot', 'title'], v)}
                    />
                    <AreaField
                        label="Description"
                        value={c.copilot.description}
                        onChange={(v) => upd(['copilot', 'description'], v)}
                    />
                    <TextField
                        label="Description (bold tail)"
                        value={c.copilot.description_strong}
                        onChange={(v) =>
                            upd(['copilot', 'description_strong'], v)
                        }
                    />
                    <div className="space-y-1.5">
                        <span className="text-[12.5px] font-medium">
                            Feature tags
                        </span>
                        <ListEditor
                            items={c.copilot.tags}
                            addLabel="Add tag"
                            onAdd={() => addTo(['copilot', 'tags'], '')}
                            onRemove={(i) => removeAt(['copilot', 'tags'], i)}
                            render={(tag, i) => (
                                <Input
                                    value={tag}
                                    onChange={(e) =>
                                        upd(
                                            ['copilot', 'tags', i],
                                            e.target.value,
                                        )
                                    }
                                />
                            )}
                        />
                    </div>
                    <TextField
                        label="Reassurance line"
                        value={c.copilot.reassurance}
                        onChange={(v) => upd(['copilot', 'reassurance'], v)}
                    />
                    <div className="grid grid-cols-2 gap-2.5">
                        <TextField
                            label="Primary button"
                            value={c.copilot.primary_cta}
                            onChange={(v) => upd(['copilot', 'primary_cta'], v)}
                        />
                        <TextField
                            label="Secondary button"
                            value={c.copilot.secondary_cta}
                            onChange={(v) =>
                                upd(['copilot', 'secondary_cta'], v)
                            }
                        />
                    </div>
                    <div className="space-y-1.5">
                        <span className="text-[12.5px] font-medium">
                            How-it-works steps
                        </span>
                        <ListEditor
                            items={c.copilot.steps}
                            addLabel="Add step"
                            onAdd={() =>
                                addTo(['copilot', 'steps'], {
                                    title: '',
                                    desc: '',
                                    icon: 'send',
                                })
                            }
                            onRemove={(i) => removeAt(['copilot', 'steps'], i)}
                            render={(step, i) => (
                                <>
                                    <TextField
                                        label="Title"
                                        value={step.title}
                                        onChange={(v) =>
                                            upd(
                                                [
                                                    'copilot',
                                                    'steps',
                                                    i,
                                                    'title',
                                                ],
                                                v,
                                            )
                                        }
                                    />
                                    <AreaField
                                        label="Description"
                                        value={step.desc}
                                        onChange={(v) =>
                                            upd(
                                                ['copilot', 'steps', i, 'desc'],
                                                v,
                                            )
                                        }
                                        rows={2}
                                    />
                                    <IconSelect
                                        value={step.icon}
                                        onChange={(v) =>
                                            upd(
                                                ['copilot', 'steps', i, 'icon'],
                                                v,
                                            )
                                        }
                                    />
                                </>
                            )}
                        />
                    </div>
                </SectionCard>

                {/* ── Products ─────────────────────────────────────────── */}
                <SectionCard
                    title="Products section"
                    description="Heading and the product cards."
                    enabled={c.products.enabled}
                    onToggle={(v) => upd(['products', 'enabled'], v)}
                    onReset={() => reset('products')}
                    busy={busy}
                >
                    <TextField
                        label="Eyebrow"
                        value={c.products.eyebrow}
                        onChange={(v) => upd(['products', 'eyebrow'], v)}
                    />
                    <TextField
                        label="Title"
                        value={c.products.title}
                        onChange={(v) => upd(['products', 'title'], v)}
                    />
                    <AreaField
                        label="Description"
                        value={c.products.desc}
                        onChange={(v) => upd(['products', 'desc'], v)}
                        rows={2}
                    />
                    <ListEditor
                        items={c.products.items}
                        addLabel="Add product"
                        onAdd={() =>
                            addTo(['products', 'items'], {
                                icon: 'phone',
                                label: '',
                                desc: '',
                            })
                        }
                        onRemove={(i) => removeAt(['products', 'items'], i)}
                        render={(item, i) => (
                            <>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <TextField
                                        label="Label"
                                        value={item.label}
                                        onChange={(v) =>
                                            upd(
                                                [
                                                    'products',
                                                    'items',
                                                    i,
                                                    'label',
                                                ],
                                                v,
                                            )
                                        }
                                    />
                                    <IconSelect
                                        value={item.icon}
                                        onChange={(v) =>
                                            upd(
                                                [
                                                    'products',
                                                    'items',
                                                    i,
                                                    'icon',
                                                ],
                                                v,
                                            )
                                        }
                                    />
                                </div>
                                <TextField
                                    label="Description"
                                    value={item.desc}
                                    onChange={(v) =>
                                        upd(['products', 'items', i, 'desc'], v)
                                    }
                                />
                            </>
                        )}
                    />
                </SectionCard>

                {/* ── Coverage ─────────────────────────────────────────── */}
                <SectionCard
                    title="Coverage section"
                    description="Heading and the coverage stat numbers."
                    enabled={c.coverage.enabled}
                    onToggle={(v) => upd(['coverage', 'enabled'], v)}
                    onReset={() => reset('coverage')}
                    busy={busy}
                >
                    <TextField
                        label="Eyebrow"
                        value={c.coverage.eyebrow}
                        onChange={(v) => upd(['coverage', 'eyebrow'], v)}
                    />
                    <TextField
                        label="Title"
                        value={c.coverage.title}
                        onChange={(v) => upd(['coverage', 'title'], v)}
                    />
                    <AreaField
                        label="Description"
                        value={c.coverage.desc}
                        onChange={(v) => upd(['coverage', 'desc'], v)}
                        rows={2}
                    />
                    <div className="space-y-1.5">
                        <span className="text-[12.5px] font-medium">Stats</span>
                        <ListEditor
                            items={c.coverage.stats}
                            addLabel="Add stat"
                            onAdd={() =>
                                addTo(['coverage', 'stats'], {
                                    value: '',
                                    label: '',
                                })
                            }
                            onRemove={(i) => removeAt(['coverage', 'stats'], i)}
                            render={(stat, i) => (
                                <div className="grid grid-cols-2 gap-2.5">
                                    <TextField
                                        label="Value"
                                        value={stat.value}
                                        onChange={(v) =>
                                            upd(
                                                [
                                                    'coverage',
                                                    'stats',
                                                    i,
                                                    'value',
                                                ],
                                                v,
                                            )
                                        }
                                    />
                                    <TextField
                                        label="Label"
                                        value={stat.label}
                                        onChange={(v) =>
                                            upd(
                                                [
                                                    'coverage',
                                                    'stats',
                                                    i,
                                                    'label',
                                                ],
                                                v,
                                            )
                                        }
                                    />
                                </div>
                            )}
                        />
                    </div>
                    <TextField
                        label="“More countries” label"
                        value={c.coverage.more_label}
                        onChange={(v) => upd(['coverage', 'more_label'], v)}
                    />
                </SectionCard>

                {/* ── Developers ───────────────────────────────────────── */}
                <SectionCard
                    title="Developers section"
                    description="API pitch, feature list and code sample."
                    enabled={c.developers.enabled}
                    onToggle={(v) => upd(['developers', 'enabled'], v)}
                    onReset={() => reset('developers')}
                    busy={busy}
                >
                    <TextField
                        label="Eyebrow"
                        value={c.developers.eyebrow}
                        onChange={(v) => upd(['developers', 'eyebrow'], v)}
                    />
                    <TextField
                        label="Title"
                        value={c.developers.title}
                        onChange={(v) => upd(['developers', 'title'], v)}
                    />
                    <AreaField
                        label="Description"
                        value={c.developers.desc}
                        onChange={(v) => upd(['developers', 'desc'], v)}
                        rows={2}
                    />
                    <div className="space-y-1.5">
                        <span className="text-[12.5px] font-medium">
                            Feature bullets
                        </span>
                        <ListEditor
                            items={c.developers.features}
                            addLabel="Add feature"
                            onAdd={() =>
                                addTo(['developers', 'features'], {
                                    icon: 'check',
                                    label: '',
                                })
                            }
                            onRemove={(i) =>
                                removeAt(['developers', 'features'], i)
                            }
                            render={(f, i) => (
                                <>
                                    <TextField
                                        label="Label"
                                        value={f.label}
                                        onChange={(v) =>
                                            upd(
                                                [
                                                    'developers',
                                                    'features',
                                                    i,
                                                    'label',
                                                ],
                                                v,
                                            )
                                        }
                                    />
                                    <IconSelect
                                        value={f.icon}
                                        onChange={(v) =>
                                            upd(
                                                [
                                                    'developers',
                                                    'features',
                                                    i,
                                                    'icon',
                                                ],
                                                v,
                                            )
                                        }
                                    />
                                </>
                            )}
                        />
                    </div>
                    <TextField
                        label="Code: endpoint label"
                        value={c.developers.code.endpoint}
                        onChange={(v) =>
                            upd(['developers', 'code', 'endpoint'], v)
                        }
                        mono
                    />
                    <AreaField
                        label="Code: request"
                        value={c.developers.code.request}
                        onChange={(v) =>
                            upd(['developers', 'code', 'request'], v)
                        }
                        rows={6}
                        mono
                    />
                    <AreaField
                        label="Code: response"
                        value={c.developers.code.response}
                        onChange={(v) =>
                            upd(['developers', 'code', 'response'], v)
                        }
                        rows={5}
                        mono
                    />
                </SectionCard>

                {/* ── Pricing ──────────────────────────────────────────── */}
                <SectionCard
                    title="Pricing section"
                    description="Heading and pricing plans."
                    enabled={c.pricing.enabled}
                    onToggle={(v) => upd(['pricing', 'enabled'], v)}
                    onReset={() => reset('pricing')}
                    busy={busy}
                >
                    <TextField
                        label="Eyebrow"
                        value={c.pricing.eyebrow}
                        onChange={(v) => upd(['pricing', 'eyebrow'], v)}
                    />
                    <TextField
                        label="Title"
                        value={c.pricing.title}
                        onChange={(v) => upd(['pricing', 'title'], v)}
                    />
                    <AreaField
                        label="Description"
                        value={c.pricing.desc}
                        onChange={(v) => upd(['pricing', 'desc'], v)}
                        rows={2}
                    />
                    <ListEditor
                        items={c.pricing.plans}
                        addLabel="Add plan"
                        onAdd={() =>
                            addTo(['pricing', 'plans'], {
                                name: '',
                                price: '',
                                unit: '',
                                popular: false,
                                cta: '',
                                features: [],
                            })
                        }
                        onRemove={(i) => removeAt(['pricing', 'plans'], i)}
                        render={(plan, i) => (
                            <>
                                <TextField
                                    label="Name"
                                    value={plan.name}
                                    onChange={(v) =>
                                        upd(['pricing', 'plans', i, 'name'], v)
                                    }
                                />
                                <div className="grid grid-cols-2 gap-2.5">
                                    <TextField
                                        label="Price"
                                        value={plan.price}
                                        onChange={(v) =>
                                            upd(
                                                [
                                                    'pricing',
                                                    'plans',
                                                    i,
                                                    'price',
                                                ],
                                                v,
                                            )
                                        }
                                    />
                                    <TextField
                                        label="Unit"
                                        value={plan.unit}
                                        onChange={(v) =>
                                            upd(
                                                ['pricing', 'plans', i, 'unit'],
                                                v,
                                            )
                                        }
                                    />
                                </div>
                                <TextField
                                    label="Button label"
                                    value={plan.cta}
                                    onChange={(v) =>
                                        upd(['pricing', 'plans', i, 'cta'], v)
                                    }
                                />
                                <label className="flex items-center justify-between rounded-md border px-3 py-2">
                                    <span className="text-[12.5px] font-medium">
                                        Most popular
                                    </span>
                                    <Switch
                                        checked={plan.popular}
                                        onCheckedChange={(v) =>
                                            upd(
                                                [
                                                    'pricing',
                                                    'plans',
                                                    i,
                                                    'popular',
                                                ],
                                                v,
                                            )
                                        }
                                        aria-label="Mark plan as popular"
                                    />
                                </label>
                                <div className="space-y-1.5">
                                    <span className="text-[12px] font-medium">
                                        Features
                                    </span>
                                    <ListEditor
                                        items={plan.features}
                                        addLabel="Add feature"
                                        onAdd={() =>
                                            addTo(
                                                [
                                                    'pricing',
                                                    'plans',
                                                    i,
                                                    'features',
                                                ],
                                                '',
                                            )
                                        }
                                        onRemove={(fi) =>
                                            removeAt(
                                                [
                                                    'pricing',
                                                    'plans',
                                                    i,
                                                    'features',
                                                ],
                                                fi,
                                            )
                                        }
                                        render={(feat, fi) => (
                                            <Input
                                                value={feat}
                                                onChange={(e) =>
                                                    upd(
                                                        [
                                                            'pricing',
                                                            'plans',
                                                            i,
                                                            'features',
                                                            fi,
                                                        ],
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        )}
                                    />
                                </div>
                            </>
                        )}
                    />
                </SectionCard>

                {/* ── Security ─────────────────────────────────────────── */}
                <SectionCard
                    title="Security section"
                    description="Heading and trust cards."
                    enabled={c.security.enabled}
                    onToggle={(v) => upd(['security', 'enabled'], v)}
                    onReset={() => reset('security')}
                    busy={busy}
                >
                    <TextField
                        label="Eyebrow"
                        value={c.security.eyebrow}
                        onChange={(v) => upd(['security', 'eyebrow'], v)}
                    />
                    <TextField
                        label="Title"
                        value={c.security.title}
                        onChange={(v) => upd(['security', 'title'], v)}
                    />
                    <AreaField
                        label="Description"
                        value={c.security.desc}
                        onChange={(v) => upd(['security', 'desc'], v)}
                        rows={2}
                    />
                    <ListEditor
                        items={c.security.features}
                        addLabel="Add card"
                        onAdd={() =>
                            addTo(['security', 'features'], {
                                icon: 'shield',
                                title: '',
                                desc: '',
                            })
                        }
                        onRemove={(i) => removeAt(['security', 'features'], i)}
                        render={(f, i) => (
                            <>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <TextField
                                        label="Title"
                                        value={f.title}
                                        onChange={(v) =>
                                            upd(
                                                [
                                                    'security',
                                                    'features',
                                                    i,
                                                    'title',
                                                ],
                                                v,
                                            )
                                        }
                                    />
                                    <IconSelect
                                        value={f.icon}
                                        onChange={(v) =>
                                            upd(
                                                [
                                                    'security',
                                                    'features',
                                                    i,
                                                    'icon',
                                                ],
                                                v,
                                            )
                                        }
                                    />
                                </div>
                                <TextField
                                    label="Description"
                                    value={f.desc}
                                    onChange={(v) =>
                                        upd(
                                            ['security', 'features', i, 'desc'],
                                            v,
                                        )
                                    }
                                />
                            </>
                        )}
                    />
                </SectionCard>

                {/* ── FAQ ──────────────────────────────────────────────── */}
                <SectionCard
                    title="FAQ section"
                    description="Heading and question / answer pairs."
                    enabled={c.faq.enabled}
                    onToggle={(v) => upd(['faq', 'enabled'], v)}
                    onReset={() => reset('faq')}
                    busy={busy}
                >
                    <TextField
                        label="Eyebrow"
                        value={c.faq.eyebrow}
                        onChange={(v) => upd(['faq', 'eyebrow'], v)}
                    />
                    <TextField
                        label="Title"
                        value={c.faq.title}
                        onChange={(v) => upd(['faq', 'title'], v)}
                    />
                    <ListEditor
                        items={c.faq.items}
                        addLabel="Add question"
                        onAdd={() => addTo(['faq', 'items'], { q: '', a: '' })}
                        onRemove={(i) => removeAt(['faq', 'items'], i)}
                        render={(item, i) => (
                            <>
                                <TextField
                                    label="Question"
                                    value={item.q}
                                    onChange={(v) =>
                                        upd(['faq', 'items', i, 'q'], v)
                                    }
                                />
                                <AreaField
                                    label="Answer"
                                    value={item.a}
                                    onChange={(v) =>
                                        upd(['faq', 'items', i, 'a'], v)
                                    }
                                />
                            </>
                        )}
                    />
                </SectionCard>

                {/* ── Final CTA ────────────────────────────────────────── */}
                <SectionCard
                    title="Call-to-action banner"
                    description="The closing call-to-action."
                    enabled={c.cta.enabled}
                    onToggle={(v) => upd(['cta', 'enabled'], v)}
                    onReset={() => reset('cta')}
                    busy={busy}
                >
                    <TextField
                        label="Headline"
                        value={c.cta.title}
                        onChange={(v) => upd(['cta', 'title'], v)}
                    />
                    <AreaField
                        label="Description"
                        value={c.cta.description}
                        onChange={(v) => upd(['cta', 'description'], v)}
                        rows={2}
                    />
                    <div className="grid grid-cols-2 gap-2.5">
                        <TextField
                            label="Primary button"
                            value={c.cta.primary_cta}
                            onChange={(v) => upd(['cta', 'primary_cta'], v)}
                        />
                        <TextField
                            label="Secondary button"
                            value={c.cta.secondary_cta}
                            onChange={(v) => upd(['cta', 'secondary_cta'], v)}
                        />
                    </div>
                </SectionCard>

                {/* ── Footer ───────────────────────────────────────────── */}
                <SectionCard
                    title="Footer"
                    description="Tagline, link columns and legal line."
                    onReset={() => reset('footer')}
                    busy={busy}
                >
                    <AreaField
                        label="Tagline"
                        value={c.footer.tagline}
                        onChange={(v) => upd(['footer', 'tagline'], v)}
                        rows={2}
                    />
                    <div className="space-y-1.5">
                        <span className="text-[12.5px] font-medium">
                            Link columns
                        </span>
                        <ListEditor
                            items={c.footer.columns}
                            addLabel="Add column"
                            onAdd={() =>
                                addTo(['footer', 'columns'], {
                                    heading: '',
                                    links: [],
                                })
                            }
                            onRemove={(i) => removeAt(['footer', 'columns'], i)}
                            render={(col, i) => (
                                <>
                                    <TextField
                                        label="Heading"
                                        value={col.heading}
                                        onChange={(v) =>
                                            upd(
                                                [
                                                    'footer',
                                                    'columns',
                                                    i,
                                                    'heading',
                                                ],
                                                v,
                                            )
                                        }
                                    />
                                    <ListEditor
                                        items={col.links}
                                        addLabel="Add link"
                                        onAdd={() =>
                                            addTo(
                                                [
                                                    'footer',
                                                    'columns',
                                                    i,
                                                    'links',
                                                ],
                                                { label: '', href: '#' },
                                            )
                                        }
                                        onRemove={(li) =>
                                            removeAt(
                                                [
                                                    'footer',
                                                    'columns',
                                                    i,
                                                    'links',
                                                ],
                                                li,
                                            )
                                        }
                                        render={(link, li) => (
                                            <div className="grid grid-cols-2 gap-2.5">
                                                <TextField
                                                    label="Label"
                                                    value={link.label}
                                                    onChange={(v) =>
                                                        upd(
                                                            [
                                                                'footer',
                                                                'columns',
                                                                i,
                                                                'links',
                                                                li,
                                                                'label',
                                                            ],
                                                            v,
                                                        )
                                                    }
                                                />
                                                <TextField
                                                    label="URL (# = none)"
                                                    value={link.href}
                                                    onChange={(v) =>
                                                        upd(
                                                            [
                                                                'footer',
                                                                'columns',
                                                                i,
                                                                'links',
                                                                li,
                                                                'href',
                                                            ],
                                                            v,
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}
                                    />
                                </>
                            )}
                        />
                    </div>
                    <TextField
                        label="Legal line"
                        value={c.footer.legal}
                        onChange={(v) => upd(['footer', 'legal'], v)}
                    />
                    <TextField
                        label="Copyright ({app} = your brand name)"
                        value={c.footer.copyright}
                        onChange={(v) => upd(['footer', 'copyright'], v)}
                    />
                </SectionCard>

                <div className="flex justify-end">
                    <Button onClick={save} disabled={busy}>
                        {saving ? 'Saving…' : 'Save changes'}
                    </Button>
                </div>
            </div>
        </>
    );
}

LandingSettings.layout = {
    breadcrumbs: [{ title: 'Landing page', href: landingRoute() }],
};
