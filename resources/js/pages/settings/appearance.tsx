import { Head } from '@inertiajs/react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';

import Heading from '@/components/heading';
import { Icon } from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { useAppearance } from '@/hooks/use-appearance';
import type { Appearance as AppearanceMode } from '@/hooks/use-appearance';
import { useThemeConfig } from '@/hooks/use-theme-config';
import type {
    Accent,
    DashLayout,
    Density,
    Radius,
    SidebarStyle,
} from '@/hooks/use-theme-config';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';

const THEME_OPTIONS: {
    value: AppearanceMode;
    label: string;
    icon: typeof Sun;
}[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
];

const ACCENTS: { value: Accent; color: string }[] = [
    { value: 'emerald', color: '#059669' },
    { value: 'blue', color: '#2563eb' },
    { value: 'indigo', color: '#4f46e5' },
    { value: 'violet', color: '#7c3aed' },
    { value: 'slate', color: '#0f172a' },
];

const RADII: { value: Radius; label: string }[] = [
    { value: 'sharp', label: 'Sharp' },
    { value: 'default', label: 'Default' },
    { value: 'round', label: 'Round' },
];

const DENSITIES: { value: Density; label: string }[] = [
    { value: 'compact', label: 'Compact' },
    { value: 'comfortable', label: 'Comfortable' },
];

const SIDEBAR_STYLES: { value: SidebarStyle; label: string }[] = [
    { value: 'classic', label: 'Classic' },
    { value: 'minimal', label: 'Minimal' },
];

const DASH_LAYOUTS: { value: DashLayout; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'focus', label: 'Focus' },
];

function Section({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
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

function Pill({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'h-9 rounded-md border px-4 text-[13px] font-medium transition-colors',
                active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-accent',
            )}
        >
            {children}
        </button>
    );
}

export default function Appearance() {
    const { appearance, updateAppearance } = useAppearance();
    const { config, updateThemeConfig } = useThemeConfig();

    return (
        <>
            <Head title="Appearance settings" />

            <div className="space-y-8">
                <Heading
                    variant="small"
                    title="Appearance"
                    description="Customize how Tappy looks for your account."
                />

                <Section
                    title="Theme"
                    description="Choose a light or dark theme, or follow your system."
                >
                    <div className="grid max-w-md grid-cols-3 gap-3">
                        {THEME_OPTIONS.map(
                            ({ value, label, icon: ThemeIcon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => updateAppearance(value)}
                                    className={cn(
                                        'flex flex-col items-center gap-2 rounded-xl border px-3 py-4 transition-colors',
                                        appearance === value
                                            ? 'border-primary bg-primary/[0.06] text-primary'
                                            : 'border-border text-foreground hover:bg-accent',
                                    )}
                                >
                                    <ThemeIcon className="size-5" />
                                    <span className="text-[12.5px] font-medium">
                                        {label}
                                    </span>
                                </button>
                            ),
                        )}
                    </div>
                </Section>

                <Section
                    title="Accent color"
                    description="The primary color used for buttons, links and highlights."
                >
                    <div className="flex flex-wrap gap-3">
                        {ACCENTS.map(({ value, color }) => (
                            <button
                                key={value}
                                type="button"
                                title={value}
                                onClick={() =>
                                    updateThemeConfig({ accent: value })
                                }
                                className={cn(
                                    'flex size-9 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background transition',
                                    config.accent === value
                                        ? 'ring-foreground/40'
                                        : 'ring-transparent',
                                )}
                                style={{ background: color }}
                            >
                                {config.accent === value && (
                                    <Icon
                                        name="check"
                                        className="size-4 text-white"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </Section>

                <Section
                    title="Corner radius"
                    description="How rounded surfaces and controls appear."
                >
                    <div className="flex flex-wrap gap-2.5">
                        {RADII.map(({ value, label }) => (
                            <Pill
                                key={value}
                                active={config.radius === value}
                                onClick={() =>
                                    updateThemeConfig({ radius: value })
                                }
                            >
                                {label}
                            </Pill>
                        ))}
                    </div>
                </Section>

                <Section
                    title="Density"
                    description="Compact fits more on screen; comfortable adds breathing room."
                >
                    <div className="flex flex-wrap gap-2.5">
                        {DENSITIES.map(({ value, label }) => (
                            <Pill
                                key={value}
                                active={config.density === value}
                                onClick={() =>
                                    updateThemeConfig({ density: value })
                                }
                            >
                                {label}
                            </Pill>
                        ))}
                    </div>
                </Section>

                <Section
                    title="Layout"
                    description="Tune the sidebar and dashboard presentation."
                >
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <p className="text-[13px] font-medium">
                                Sidebar style
                            </p>
                            <div className="flex flex-wrap gap-2.5">
                                {SIDEBAR_STYLES.map(({ value, label }) => (
                                    <Pill
                                        key={value}
                                        active={config.sidebarStyle === value}
                                        onClick={() =>
                                            updateThemeConfig({
                                                sidebarStyle: value,
                                            })
                                        }
                                    >
                                        {label}
                                    </Pill>
                                ))}
                            </div>
                        </div>

                        <div className="flex max-w-md items-center justify-between gap-4">
                            <div>
                                <p className="text-[13px] font-medium">
                                    Collapse sidebar
                                </p>
                                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                                    Show an icon-only rail to free up space.
                                </p>
                            </div>
                            <Switch
                                checked={config.sidebarCollapsed}
                                onCheckedChange={(sidebarCollapsed) =>
                                    updateThemeConfig({ sidebarCollapsed })
                                }
                                aria-label="Collapse sidebar"
                            />
                        </div>

                        <div className="space-y-2">
                            <p className="text-[13px] font-medium">
                                Dashboard layout
                            </p>
                            <div className="flex flex-wrap gap-2.5">
                                {DASH_LAYOUTS.map(({ value, label }) => (
                                    <Pill
                                        key={value}
                                        active={config.dashLayout === value}
                                        onClick={() =>
                                            updateThemeConfig({
                                                dashLayout: value,
                                            })
                                        }
                                    >
                                        {label}
                                    </Pill>
                                ))}
                            </div>
                        </div>
                    </div>
                </Section>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};
