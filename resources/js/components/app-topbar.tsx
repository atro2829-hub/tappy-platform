import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { markAllRead as markAllReadRoute } from '@/actions/App/Http/Controllers/NotificationController';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAppearance } from '@/hooks/use-appearance';
import { useInitials } from '@/hooks/use-initials';
import { useSandbox } from '@/hooks/use-sandbox';
import { ROLE_META } from '@/lib/roles';
import type { SharedData, UserRole } from '@/types';

const ROLE_AVATAR_STYLE: Record<
    UserRole,
    { background: string; color: string }
> = {
    business: {
        background: 'hsl(186 80% 50% / 0.12)',
        color: 'hsl(186 65% 35%)',
    },
    reseller: {
        background: 'hsl(38 90% 52% / 0.12)',
        color: 'hsl(38 70% 35%)',
    },
    customer: {
        background: 'hsl(263 70% 60% / 0.12)',
        color: 'hsl(263 55% 45%)',
    },
    admin: { background: 'hsl(215 20% 50% / 0.12)', color: 'hsl(215 15% 38%)' },
};

interface Notification {
    id?: string;
    icon: IconName;
    color: string;
    title: string;
    desc: string;
    time: string;
    read?: boolean;
}

function NotificationsMenu({
    items,
    unread,
}: {
    items: Notification[];
    unread: number;
}) {
    const markAllRead = () => {
        if (unread === 0) {
            return;
        }

        router.post(
            markAllReadRoute.url(),
            {},
            { preserveScroll: true, preserveState: false },
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative size-[34px]"
                    aria-label={
                        unread > 0
                            ? `Notifications, ${unread} unread`
                            : 'Notifications'
                    }
                >
                    <Icon name="bell" className="size-[17px]" />
                    {unread > 0 && (
                        <span className="absolute top-1.5 right-1.5 size-[7px] rounded-full bg-destructive ring-2 ring-background" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-1.5">
                <div className="flex items-center justify-between px-2 pt-1 pb-1.5">
                    <span className="text-[13px] font-semibold">
                        Notifications
                    </span>
                    <button
                        type="button"
                        onClick={markAllRead}
                        disabled={unread === 0}
                        className="cursor-pointer text-[11.5px] text-muted-foreground hover:text-foreground disabled:cursor-default disabled:opacity-50"
                    >
                        Mark all read
                    </button>
                </div>
                {items.length === 0 && (
                    <div className="px-2 py-6 text-center text-[12px] text-muted-foreground">
                        You're all caught up.
                    </div>
                )}
                {items.map((n, i) => (
                    <div
                        key={n.id ?? i}
                        className="flex gap-2.5 rounded-md p-2 hover:bg-accent"
                        style={{ opacity: n.read ? 0.55 : 1 }}
                    >
                        <div
                            className="mt-0.5 shrink-0"
                            style={{ color: `hsl(var(--${n.color}))` }}
                        >
                            <Icon name={n.icon} className="size-[17px]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-[12.5px] font-semibold">
                                {n.title}
                            </div>
                            <div className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
                                {n.desc}
                            </div>
                        </div>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                            {n.time}
                        </span>
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function AppTopbar({ onOpenMobile }: { onOpenMobile: () => void }) {
    const { auth, notifications, unreadNotifications } = usePage<
        SharedData & {
            notifications?: Notification[];
            unreadNotifications?: number;
        }
    >().props;
    const user = auth.user;
    const role = user.role;
    const getInitials = useInitials();
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const { sandbox, toggleSandbox } = useSandbox();
    const [query, setQuery] = useState('');

    const runSearch = () => {
        if (query.trim()) {
            router.visit(
                '/transactions?search=' + encodeURIComponent(query.trim()),
            );
            setQuery('');
        }
    };

    const isDark = resolvedAppearance === 'dark';
    const showSandbox = role !== 'customer';
    const tone = sandbox ? 'warning' : 'success';

    return (
        <header className="sticky top-0 z-40 flex h-14 flex-none items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md">
            <Button
                variant="ghost"
                size="icon"
                className="size-[34px] md:hidden"
                onClick={onOpenMobile}
                aria-label="Open menu"
            >
                <Icon name="menu" className="size-[18px]" />
            </Button>

            <div className="relative hidden w-[300px] max-w-[32vw] sm:block">
                <Icon
                    name="search"
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                    className="h-[34px] bg-muted/50 pl-9"
                    placeholder="Search transactions, recipients…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                />
                <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground lg:block">
                    ⌘K
                </kbd>
            </div>

            <div className="flex-1" />

            {showSandbox && (
                <button
                    type="button"
                    onClick={() => {
                        const next = !sandbox;
                        toggleSandbox();
                        toast[next ? 'warning' : 'success'](
                            next
                                ? 'Sandbox mode — no real money'
                                : 'Production mode enabled',
                        );
                    }}
                    title="Toggle API mode"
                    className="hidden h-[30px] items-center gap-1.5 rounded-full border px-2.5 text-[11.5px] font-semibold lg:flex"
                    style={{
                        borderColor: `hsl(var(--${tone}) / 0.35)`,
                        background: `hsl(var(--${tone}) / 0.1)`,
                        color: `hsl(var(--${tone}))`,
                    }}
                >
                    <span className="size-1.5 rounded-full bg-current" />
                    {sandbox ? 'Sandbox' : 'Production'}
                </button>
            )}

            <Button
                variant="ghost"
                size="icon"
                className="size-[34px]"
                title="Go to homepage"
                aria-label="Go to homepage"
                asChild
            >
                <a href="/">
                    <Icon name="home" className="size-[17px]" />
                </a>
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="size-[34px]"
                title="Toggle theme"
                onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            >
                <Icon name={isDark ? 'sun' : 'moon'} className="size-[17px]" />
            </Button>

            <NotificationsMenu
                items={notifications ?? []}
                unread={unreadNotifications ?? 0}
            />

            <div className="h-6 w-px bg-border" />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="flex items-center gap-2 rounded-full p-0.5 outline-none"
                    >
                        <Avatar className="size-[30px]">
                            <AvatarFallback
                                className="text-xs font-semibold"
                                style={ROLE_AVATAR_STYLE[role]}
                            >
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="hidden text-left leading-tight lg:block">
                            <div className="text-[12.5px] font-semibold">
                                {user.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                                {ROLE_META[role].label}
                            </div>
                        </div>
                        <Icon
                            name="chevdown"
                            className="hidden size-3.5 text-muted-foreground lg:block"
                        />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <UserMenuContent user={user} />
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
