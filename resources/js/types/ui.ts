import type { ReactNode } from 'react';
import type { Auth } from '@/types/auth';
import type { BreadcrumbItem } from '@/types/navigation';

export type AppLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export type BrandMode = 'logo_text' | 'logo' | 'text';

export type BrandSurface = 'dashboard' | 'auth' | 'homepage' | 'footer';

export type Branding = {
    appName: string;
    logoLight: string | null;
    logoDark: string | null;
    favicon: string | null;
    homepageEnabled: boolean;
    modes: Record<BrandSurface, BrandMode>;
};

export type SharedData = {
    name: string;
    branding: Branding;
    auth: Auth;
    sidebarOpen: boolean;
    impersonating?: boolean;
    flash?: { toast?: FlashToast | null };
    [key: string]: unknown;
};

export type AppVariant = 'header' | 'sidebar';

export type FlashToast = {
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
};

export type AuthLayoutProps = {
    children?: ReactNode;
    name?: string;
    title?: string;
    description?: string;
};
