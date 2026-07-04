import { createInertiaApp, router } from '@inertiajs/react';
import { ConfirmProvider } from '@/components/ui/confirm-dialog';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { initializeThemeConfig } from '@/hooks/use-theme-config';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

// The document-title suffix tracks the admin-configured brand name (shared on
// every Inertia page as `branding.appName`) rather than a build-time constant,
// so renaming the app from System Settings updates browser tabs immediately.
let appName: string = import.meta.env.VITE_APP_NAME || 'Tappy';

const syncAppName = (props: Record<string, unknown>): void => {
    const branding = props.branding as { appName?: string } | undefined;

    if (branding?.appName) {
        appName = branding.appName;
    }
};

try {
    const initial =
        document.querySelector<HTMLElement>('[data-page]')?.dataset.page;

    if (initial) {
        syncAppName(JSON.parse(initial).props);
    }
} catch {
    // Keep the fallback name if the server payload can't be read.
}

router.on('navigate', (event) => syncAppName(event.detail.page.props));

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
            case name === 'documentation':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                <ConfirmProvider>{app}</ConfirmProvider>
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

// Apply saved accent / radius / density on load...
initializeThemeConfig();
