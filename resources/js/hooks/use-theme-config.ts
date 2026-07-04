import { useSyncExternalStore } from 'react';

export type Accent = 'emerald' | 'blue' | 'indigo' | 'violet' | 'slate';
export type Radius = 'sharp' | 'default' | 'round';
export type Density = 'compact' | 'comfortable';
export type SidebarStyle = 'classic' | 'minimal';
export type DashLayout = 'default' | 'focus';

export interface ThemeConfig {
    accent: Accent;
    radius: Radius;
    density: Density;
    sidebarStyle: SidebarStyle;
    sidebarCollapsed: boolean;
    dashLayout: DashLayout;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
    accent: 'emerald',
    radius: 'default',
    density: 'compact',
    sidebarStyle: 'classic',
    sidebarCollapsed: false,
    dashLayout: 'default',
};

const STORAGE_KEY = 'tappy_theme_config';
const listeners = new Set<() => void>();

const read = (): ThemeConfig => {
    if (typeof window === 'undefined') {
        return DEFAULT_THEME_CONFIG;
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        return raw
            ? { ...DEFAULT_THEME_CONFIG, ...JSON.parse(raw) }
            : DEFAULT_THEME_CONFIG;
    } catch {
        return DEFAULT_THEME_CONFIG;
    }
};

let config = read();

const apply = (c: ThemeConfig): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const el = document.documentElement;
    el.setAttribute('data-accent', c.accent);
    el.setAttribute('data-radius', c.radius);
    el.setAttribute('data-density', c.density);
    el.setAttribute('data-sidebar-style', c.sidebarStyle);
    el.setAttribute('data-dashlayout', c.dashLayout);
    el.setAttribute('data-sidebar-collapsed', String(c.sidebarCollapsed));
};

export function initializeThemeConfig(): void {
    config = read();
    apply(config);
}

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const updateThemeConfig = (patch: Partial<ThemeConfig>): void => {
    config = { ...config, ...patch };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
        // ignore
    }

    apply(config);
    listeners.forEach((listener) => listener());
};

export function useThemeConfig() {
    const value = useSyncExternalStore(
        subscribe,
        () => config,
        () => DEFAULT_THEME_CONFIG,
    );

    return { config: value, updateThemeConfig } as const;
}
