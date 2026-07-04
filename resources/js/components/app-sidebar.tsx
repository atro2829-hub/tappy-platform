import { Link, usePage } from '@inertiajs/react';

import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useThemeConfig } from '@/hooks/use-theme-config';
import { NAV } from '@/lib/nav';
import type { NavLink } from '@/lib/nav';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
    return (
        <Brand
            surface="dashboard"
            hideText={collapsed}
            className={cn(collapsed && 'justify-center')}
        />
    );
}

function NavItem({
    item,
    active,
    collapsed,
    onNavigate,
    badge,
}: {
    item: NavLink;
    active: boolean;
    collapsed: boolean;
    onNavigate?: () => void;
    badge?: number;
}) {
    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
                'relative flex h-[34px] items-center gap-2.5 rounded-md text-[13px] transition-colors',
                collapsed ? 'justify-center px-0' : 'px-2.5',
                active
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'font-[450] text-sidebar-foreground hover:bg-accent',
            )}
        >
            <Icon
                name={item.icon}
                className="size-[17px] shrink-0"
                strokeWidth={active ? 2.2 : 2}
            />
            {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
            )}
            {!collapsed && !!badge && (
                <span
                    className={cn(
                        'inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-[5px] text-[10.5px] font-semibold',
                        active
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted-foreground/20 text-muted-foreground',
                    )}
                >
                    {badge}
                </span>
            )}
            {collapsed && !!badge && (
                <span className="absolute top-[5px] right-[7px] size-[6px] rounded-full bg-primary" />
            )}
        </Link>
    );
}

/** Sidebar content shared by the desktop rail and the mobile drawer. */
export function SidebarBody({
    onNavigate,
    forceExpanded = false,
}: {
    onNavigate?: () => void;
    forceExpanded?: boolean;
}) {
    const { props, url } = usePage<
        SharedData & { navBadges?: Record<string, number> }
    >();
    const { config } = useThemeConfig();
    const role = props.auth.user.role;
    const nav = NAV[role];
    const navBadges = props.navBadges ?? {};

    // The mobile drawer always renders expanded; only the desktop rail collapses.
    const collapsed = forceExpanded ? false : config.sidebarCollapsed;
    const minimal = config.sidebarStyle === 'minimal';

    // Inertia's `url` includes the query string and hash; match on pathname only.
    const pathname = url.split(/[?#]/)[0];
    const isActive = (href: string) =>
        href === '/dashboard'
            ? pathname === '/dashboard' || pathname === '/'
            : pathname === href;

    return (
        <div
            className={cn(
                'flex h-full flex-col',
                minimal ? 'bg-background' : 'bg-sidebar',
            )}
        >
            <div
                className={cn(
                    'flex h-14 flex-none items-center',
                    collapsed ? 'justify-center px-0' : 'px-4',
                    minimal && 'border-b border-sidebar-border',
                )}
            >
                <SidebarBrand collapsed={collapsed} />
            </div>

            <nav
                className={cn(
                    'flex flex-1 flex-col overflow-y-auto py-2',
                    collapsed ? 'px-2' : 'px-3',
                    minimal ? 'gap-0.5' : 'gap-1',
                )}
            >
                {nav.map((grp, gi) => (
                    <div
                        key={gi}
                        className={gi > 0 ? (minimal ? 'mt-3' : 'mt-2.5') : ''}
                    >
                        {grp.section && !collapsed && (
                            <div className="px-2.5 pt-1.5 pb-1 text-[10.5px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                                {grp.section}
                            </div>
                        )}
                        {grp.section && collapsed && gi > 0 && (
                            <div className="mx-2 my-1.5 h-px bg-sidebar-border" />
                        )}
                        <div className="flex flex-col gap-0.5">
                            {grp.items.map((it) => (
                                <NavItem
                                    key={it.id}
                                    item={it}
                                    active={isActive(it.href)}
                                    collapsed={collapsed}
                                    onNavigate={onNavigate}
                                    badge={navBadges[it.id]}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {!collapsed && (
                <div className="flex-none p-3">
                    <div className="rounded-xl border border-primary/20 bg-primary/[0.06] p-3">
                        <div className="mb-1.5 flex items-center gap-2">
                            <Icon
                                name="sparkles"
                                className="size-[15px] text-primary"
                            />
                            <span className="text-[12.5px] font-semibold">
                                API Sandbox
                            </span>
                        </div>
                        <p className="mb-2.5 text-[11.5px] leading-snug text-muted-foreground">
                            Test top-ups &amp; gift cards with no real money.
                        </p>
                        <Button asChild size="sm" className="w-full">
                            <Link href="/developers" onClick={onNavigate}>
                                <Icon name="code" className="size-3.5" />
                                View API docs
                            </Link>
                        </Button>
                    </div>
                    <Link
                        href="/documentation"
                        onClick={onNavigate}
                        className="mt-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-medium text-muted-foreground no-underline hover:text-foreground"
                    >
                        <Icon name="file" className="size-[14px]" />
                        Documentation
                    </Link>
                </div>
            )}
        </div>
    );
}

/** Desktop sidebar rail. */
export function AppSidebar() {
    const { config } = useThemeConfig();

    return (
        <aside
            className={cn(
                'hidden flex-none border-r border-sidebar-border transition-[width] duration-200 ease-out md:flex',
                config.sidebarCollapsed ? 'w-16' : 'w-[244px]',
            )}
        >
            <SidebarBody />
        </aside>
    );
}
