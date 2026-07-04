import { Head, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

import {
    branding as brandingRoute,
    updateBranding,
} from '@/actions/App/Http/Controllers/Admin/AdminSettingsController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Switch } from '@/components/ui/switch';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import type { BrandMode, BrandSurface } from '@/types';

type AssetField = 'logo_light' | 'logo_dark' | 'favicon';

interface BrandingData {
    appName: string;
    logoLight: string | null;
    logoDark: string | null;
    favicon: string | null;
    homepageEnabled: boolean;
    modes: Record<BrandSurface, BrandMode>;
}

interface AssetGuide {
    label: string;
    hint: string;
    accept: string;
}

interface Props {
    branding: BrandingData;
    assetGuides: Record<AssetField, AssetGuide>;
    surfaces: BrandSurface[];
    modes: BrandMode[];
}

const MODE_LABELS: Record<BrandMode, string> = {
    logo_text: 'Logo + name',
    logo: 'Logo only',
    text: 'Name only',
};

const SURFACE_LABELS: Record<BrandSurface, { label: string; desc: string }> = {
    dashboard: { label: 'Dashboard sidebar', desc: 'Signed-in app navigation' },
    auth: { label: 'Auth pages', desc: 'Sign in, register, reset' },
    homepage: { label: 'Homepage header', desc: 'Public marketing site' },
    footer: { label: 'Footer', desc: 'Homepage footer mark' },
};

function Section({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-3">
            <div>
                <h3 className="text-sm font-semibold">{title}</h3>
                {description && (
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </section>
    );
}

/** Compact inline preview of the brand mark for a surface. */
function BrandPreview({
    mode,
    appName,
    logo,
}: {
    mode: BrandMode;
    appName: string;
    logo: string | null;
}) {
    return (
        <div className="flex h-12 items-center gap-2.5 rounded-lg border bg-muted/30 px-3">
            {mode !== 'text' &&
                (logo ? (
                    <img
                        src={logo}
                        alt=""
                        className="h-6 w-auto object-contain"
                    />
                ) : (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Icon name="zap" className="size-4" strokeWidth={2.4} />
                    </div>
                ))}
            {mode !== 'logo' && (
                <span className="text-[15px] font-bold tracking-[-0.02em]">
                    {appName || 'Tappy'}
                </span>
            )}
        </div>
    );
}

function AssetUploader({
    guide,
    preview,
    dark,
    onPick,
    onRemove,
    error,
}: {
    guide: AssetGuide;
    preview: string | null;
    dark?: boolean;
    onPick: (file: File | null) => void;
    onRemove: () => void;
    error?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div>
            <p className="mb-1.5 text-[12.5px] font-medium">{guide.label}</p>
            <div
                className={cn(
                    'flex h-[68px] items-center justify-center rounded-lg border border-dashed',
                    dark
                        ? 'border-white/15 bg-[hsl(240_10%_8%)]'
                        : 'bg-muted/30',
                )}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt=""
                        className="max-h-11 max-w-[80%] object-contain"
                    />
                ) : (
                    <Icon
                        name="upload"
                        className="size-5 text-muted-foreground"
                    />
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept={guide.accept}
                className="hidden"
                onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
            <div className="mt-2 flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 flex-1 text-xs"
                    onClick={() => inputRef.current?.click()}
                >
                    Upload
                </Button>
                {preview && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-destructive"
                        onClick={onRemove}
                    >
                        <Icon name="trash" className="size-3.5" />
                    </Button>
                )}
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
                {guide.hint}
            </p>
            {error && (
                <p className="mt-1 text-[11px] text-destructive">{error}</p>
            )}
        </div>
    );
}

export default function BrandingSettings({
    branding,
    assetGuides,
    surfaces,
    modes,
}: Props) {
    const { resolvedAppearance } = useAppearance();
    const form = useForm<{
        app_name: string;
        homepage_enabled: boolean;
        modes: Record<string, BrandMode>;
        logo_light: File | null;
        logo_dark: File | null;
        favicon: File | null;
        remove: AssetField[];
    }>({
        app_name: branding.appName,
        homepage_enabled: branding.homepageEnabled,
        modes: { ...branding.modes },
        logo_light: null,
        logo_dark: null,
        favicon: null,
        remove: [],
    });

    const [previews, setPreviews] = useState<
        Partial<Record<AssetField, string>>
    >({});

    const currentUrl: Record<AssetField, string | null> = {
        logo_light: branding.logoLight,
        logo_dark: branding.logoDark,
        favicon: branding.favicon,
    };

    const resolvedAsset = (field: AssetField): string | null => {
        if (form.data.remove.includes(field)) {
            return null;
        }

        return previews[field] ?? currentUrl[field];
    };

    const pickFile = (field: AssetField, file: File | null) => {
        form.setData(field, file as never);
        form.setData(
            'remove',
            form.data.remove.filter((f) => f !== field),
        );
        setPreviews((p) => ({
            ...p,
            [field]: file ? URL.createObjectURL(file) : undefined,
        }));
    };

    const removeAsset = (field: AssetField) => {
        form.setData(field, null as never);
        setPreviews((p) => ({ ...p, [field]: undefined }));

        if (currentUrl[field]) {
            form.setData('remove', [...form.data.remove, field]);
        }
    };

    const submit = () => {
        form.post(updateBranding().url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.setData({
                    ...form.data,
                    logo_light: null,
                    logo_dark: null,
                    favicon: null,
                    remove: [],
                });
                setPreviews({});
            },
        });
    };

    const previewLogo =
        resolvedAppearance === 'dark'
            ? resolvedAsset('logo_dark')
            : resolvedAsset('logo_light');

    return (
        <>
            <Head title="Branding settings" />

            <div className="space-y-8">
                <Heading
                    variant="small"
                    title="Branding"
                    description="White-label how the platform looks for everyone."
                />

                <Section
                    title="Application name"
                    description="Shown across the dashboard, auth pages, homepage and emails."
                >
                    <Input
                        value={form.data.app_name}
                        onChange={(e) =>
                            form.setData('app_name', e.target.value)
                        }
                        maxLength={60}
                        placeholder="Tappy"
                        className="max-w-md"
                    />
                    {form.errors.app_name && (
                        <p className="text-xs text-destructive">
                            {form.errors.app_name}
                        </p>
                    )}
                </Section>

                <Section
                    title="Logos & favicon"
                    description="Upload custom marks, or leave blank to use the default."
                >
                    <div className="grid grid-cols-3 gap-3">
                        {(Object.keys(assetGuides) as AssetField[]).map(
                            (field) => (
                                <AssetUploader
                                    key={field}
                                    guide={assetGuides[field]}
                                    preview={resolvedAsset(field)}
                                    dark={field === 'logo_dark'}
                                    onPick={(file) => pickFile(field, file)}
                                    onRemove={() => removeAsset(field)}
                                    error={form.errors[field]}
                                />
                            ),
                        )}
                    </div>
                </Section>

                <Section
                    title="Display modes"
                    description="Choose how the brand appears on each surface."
                >
                    <div className="space-y-3">
                        {surfaces.map((surface) => (
                            <div
                                key={surface}
                                className="space-y-3 rounded-lg border p-3"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[13px] font-medium">
                                            {SURFACE_LABELS[surface].label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {SURFACE_LABELS[surface].desc}
                                        </p>
                                    </div>
                                    <NativeSelect
                                        className="w-[150px]"
                                        value={form.data.modes[surface]}
                                        onChange={(e) =>
                                            form.setData('modes', {
                                                ...form.data.modes,
                                                [surface]: e.target
                                                    .value as BrandMode,
                                            })
                                        }
                                    >
                                        {modes.map((m) => (
                                            <option key={m} value={m}>
                                                {MODE_LABELS[m]}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </div>
                                <BrandPreview
                                    mode={form.data.modes[surface]}
                                    appName={form.data.app_name}
                                    logo={previewLogo}
                                />
                            </div>
                        ))}
                    </div>
                </Section>

                <Section
                    title="Public homepage"
                    description="When disabled, visitors are sent straight to sign in."
                >
                    <div className="flex max-w-md items-center justify-between gap-4">
                        <span className="text-[13px] font-medium">
                            Marketing homepage enabled
                        </span>
                        <Switch
                            checked={form.data.homepage_enabled}
                            onCheckedChange={(v) =>
                                form.setData('homepage_enabled', v)
                            }
                            aria-label="Homepage enabled"
                        />
                    </div>
                </Section>

                <div className="flex">
                    <Button onClick={submit} disabled={form.processing}>
                        {form.processing ? 'Saving…' : 'Save branding'}
                    </Button>
                </div>
            </div>
        </>
    );
}

BrandingSettings.layout = {
    breadcrumbs: [{ title: 'Branding settings', href: brandingRoute() }],
};
