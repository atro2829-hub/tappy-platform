import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import {
    branding as brandingSettings,
    integrations as integrationsSettings,
    landing as landingSettings,
} from '@/actions/App/Http/Controllers/Admin/AdminSettingsController';
import { edit as verificationSettings } from '@/actions/App/Http/Controllers/Settings/KycController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem, SharedData } from '@/types';

const accountNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: null,
    },
    {
        title: 'Security',
        href: editSecurity(),
        icon: null,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: null,
    },
];

// Platform-wide configuration, only shown to system admins.
const adminNavItems: NavItem[] = [
    {
        title: 'Branding',
        href: brandingSettings(),
        icon: null,
    },
    {
        title: 'Landing page',
        href: landingSettings(),
        icon: null,
    },
    {
        title: 'Integrations',
        href: integrationsSettings(),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const role = usePage<SharedData>().props.auth?.user?.role;
    const isAdmin = role === 'admin';
    // KYC verification only applies to Business and Reseller accounts.
    const showVerification = role === 'business' || role === 'reseller';

    const accountItems: NavItem[] = [
        ...accountNavItems,
        ...(showVerification
            ? [
                  {
                      title: 'Verification',
                      href: verificationSettings(),
                      icon: null,
                  },
              ]
            : []),
    ];

    const navItems = [...accountItems, ...(isAdmin ? adminNavItems : [])];

    // When one nav href is a prefix of another (e.g. /admin/settings is a
    // parent of /admin/settings/integrations), only the longest match should
    // light up — otherwise the parent stays highlighted on the child route.
    const activeHref = navItems
        .map((item) => toUrl(item.href))
        .filter((href) => isCurrentOrParentUrl(href))
        .sort((a, b) => b.length - a.length)[0];

    const renderItem = (item: NavItem, index: number) => (
        <Button
            key={`${toUrl(item.href)}-${index}`}
            size="sm"
            variant="ghost"
            asChild
            className={cn('w-full justify-start', {
                'bg-muted': toUrl(item.href) === activeHref,
            })}
        >
            <Link href={item.href}>
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.title}
            </Link>
        </Button>
    );

    return (
        <div className="px-4 py-6">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav
                        className="flex flex-col space-y-1 space-x-0"
                        aria-label="Settings"
                    >
                        {accountItems.map(renderItem)}

                        {isAdmin && (
                            <>
                                <p className="px-3 pt-4 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                    Platform
                                </p>
                                {adminNavItems.map(renderItem)}
                            </>
                        )}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
