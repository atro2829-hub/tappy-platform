import type { IconName } from '@/components/ui/icon';
import type { UserRole } from '@/types';

export interface NavLink {
    id: string;
    label: string;
    icon: IconName;
    href: string;
    badge?: string;
}

export interface NavSection {
    section: string | null;
    items: NavLink[];
}

/**
 * Role-based navigation, ported from the Tappy design system. The logged-in
 * user's role (shared via Inertia) selects which tree the sidebar renders.
 */
export const NAV: Record<UserRole, NavSection[]> = {
    business: [
        {
            section: 'Overview',
            items: [
                {
                    id: 'dashboard',
                    label: 'Dashboard',
                    icon: 'dashboard',
                    href: '/dashboard',
                },
            ],
        },
        {
            section: 'Sell',
            items: [
                {
                    id: 'topup',
                    label: 'Send Top-up',
                    icon: 'phone',
                    href: '/topup',
                },
                {
                    id: 'giftcards',
                    label: 'Gift Cards',
                    icon: 'gift',
                    href: '/giftcards',
                },
                {
                    id: 'bulk',
                    label: 'Bulk Orders',
                    icon: 'layers',
                    href: '/bulk',
                },
            ],
        },
        {
            section: 'Manage',
            items: [
                {
                    id: 'recipients',
                    label: 'Recipients',
                    icon: 'users',
                    href: '/recipients',
                },
                {
                    id: 'automations',
                    label: 'Automations',
                    icon: 'refresh',
                    href: '/automations',
                },
                {
                    id: 'wallet',
                    label: 'Wallet',
                    icon: 'wallet',
                    href: '/wallet',
                },
                {
                    id: 'transactions',
                    label: 'Transactions',
                    icon: 'receipt',
                    href: '/transactions',
                },
                {
                    id: 'reports',
                    label: 'Reports',
                    icon: 'chart',
                    href: '/reports',
                },
            ],
        },
        {
            section: 'Copilot',
            items: [
                {
                    id: 'ai-activity',
                    label: 'AI Activity',
                    icon: 'sparkles',
                    href: '/ai-activity',
                },
            ],
        },
        {
            section: 'Developer',
            items: [
                {
                    id: 'api',
                    label: 'API & Webhooks',
                    icon: 'code',
                    href: '/developers',
                },
            ],
        },
        {
            section: 'Account',
            items: [
                {
                    id: 'support',
                    label: 'Support',
                    icon: 'headset',
                    href: '/support',
                },
                {
                    id: 'settings',
                    label: 'Settings',
                    icon: 'settings',
                    href: '/settings',
                },
            ],
        },
    ],
    reseller: [
        {
            section: 'Overview',
            items: [
                {
                    id: 'dashboard',
                    label: 'Dashboard',
                    icon: 'dashboard',
                    href: '/dashboard',
                },
                {
                    id: 'reseller-customers',
                    label: 'My Customers',
                    icon: 'users',
                    href: '/reseller/customers',
                },
            ],
        },
        {
            section: 'Sell',
            items: [
                {
                    id: 'topup',
                    label: 'Send Top-up',
                    icon: 'phone',
                    href: '/topup',
                },
                {
                    id: 'giftcards',
                    label: 'Gift Cards',
                    icon: 'gift',
                    href: '/giftcards',
                },
                {
                    id: 'bulk',
                    label: 'Bulk Orders',
                    icon: 'layers',
                    href: '/bulk',
                },
            ],
        },
        {
            section: 'Manage',
            items: [
                {
                    id: 'recipients',
                    label: 'Recipients',
                    icon: 'users',
                    href: '/recipients',
                },
                {
                    id: 'automations',
                    label: 'Automations',
                    icon: 'refresh',
                    href: '/automations',
                },
                {
                    id: 'wallet',
                    label: 'Wallet',
                    icon: 'wallet',
                    href: '/wallet',
                },
                {
                    id: 'transactions',
                    label: 'Transactions',
                    icon: 'receipt',
                    href: '/transactions',
                },
                {
                    id: 'reseller-earnings',
                    label: 'Earnings',
                    icon: 'percent',
                    href: '/reseller/earnings',
                },
            ],
        },
        {
            section: 'Copilot',
            items: [
                {
                    id: 'ai-activity',
                    label: 'AI Activity',
                    icon: 'sparkles',
                    href: '/ai-activity',
                },
            ],
        },
        {
            section: 'Account',
            items: [
                {
                    id: 'support',
                    label: 'Support',
                    icon: 'headset',
                    href: '/support',
                },
                {
                    id: 'settings',
                    label: 'Settings',
                    icon: 'settings',
                    href: '/settings',
                },
            ],
        },
    ],
    customer: [
        {
            section: null,
            items: [
                {
                    id: 'dashboard',
                    label: 'Home',
                    icon: 'dashboard',
                    href: '/dashboard',
                },
                {
                    id: 'topup',
                    label: 'Send Airtime',
                    icon: 'phone',
                    href: '/topup',
                },
                {
                    id: 'giftcards',
                    label: 'Buy Gift Cards',
                    icon: 'gift',
                    href: '/giftcards',
                },
            ],
        },
        {
            section: 'My account',
            items: [
                {
                    id: 'recipients',
                    label: 'Saved Recipients',
                    icon: 'bookmark',
                    href: '/recipients',
                },
                {
                    id: 'automations',
                    label: 'Automations',
                    icon: 'refresh',
                    href: '/automations',
                },
                {
                    id: 'transactions',
                    label: 'Orders',
                    icon: 'receipt',
                    href: '/transactions',
                },
                {
                    id: 'wallet',
                    label: 'Wallet',
                    icon: 'wallet',
                    href: '/wallet',
                },
                {
                    id: 'ai-activity',
                    label: 'AI Activity',
                    icon: 'sparkles',
                    href: '/ai-activity',
                },
                {
                    id: 'support',
                    label: 'Support',
                    icon: 'headset',
                    href: '/support',
                },
                {
                    id: 'settings',
                    label: 'Profile',
                    icon: 'user',
                    href: '/settings',
                },
            ],
        },
    ],
    admin: [
        {
            section: 'Platform',
            items: [
                {
                    id: 'dashboard',
                    label: 'Overview',
                    icon: 'dashboard',
                    href: '/dashboard',
                },
                {
                    id: 'admin-users',
                    label: 'Users',
                    icon: 'users',
                    href: '/admin/users',
                },
                {
                    id: 'admin-kyc',
                    label: 'KYC Reviews',
                    icon: 'shieldcheck',
                    href: '/admin/kyc',
                },
            ],
        },
        {
            section: 'Money',
            items: [
                {
                    id: 'transactions',
                    label: 'Transactions',
                    icon: 'receipt',
                    href: '/transactions',
                },
                {
                    id: 'wallet',
                    label: 'Wallet Ledger',
                    icon: 'wallet',
                    href: '/wallet',
                },
                {
                    id: 'admin-commissions',
                    label: 'Commissions',
                    icon: 'percent',
                    href: '/admin/commissions',
                },
            ],
        },
        {
            section: 'Operations',
            items: [
                {
                    id: 'api',
                    label: 'API Logs',
                    icon: 'code',
                    href: '/developers',
                },
                {
                    id: 'admin-catalog',
                    label: 'Countries & Operators',
                    icon: 'globe',
                    href: '/admin/catalog',
                },
                {
                    id: 'bulk',
                    label: 'Bulk Jobs',
                    icon: 'layers',
                    href: '/bulk',
                },
                {
                    id: 'support',
                    label: 'Support Tickets',
                    icon: 'ticket',
                    href: '/support',
                },
            ],
        },
        {
            section: 'Insight & Trust',
            items: [
                {
                    id: 'reports',
                    label: 'Reports',
                    icon: 'chart',
                    href: '/reports',
                },
                {
                    id: 'ai-activity',
                    label: 'AI Activity',
                    icon: 'sparkles',
                    href: '/ai-activity',
                },
                {
                    id: 'admin-risk',
                    label: 'Risk & Fraud',
                    icon: 'flag',
                    href: '/admin/risk',
                },
                {
                    id: 'admin-audit',
                    label: 'Audit Logs',
                    icon: 'audit',
                    href: '/admin/audit',
                },
                {
                    id: 'admin-settings',
                    label: 'System Settings',
                    icon: 'settings',
                    href: '/admin/settings',
                },
            ],
        },
    ],
};
