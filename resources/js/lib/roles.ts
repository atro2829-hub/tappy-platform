import type { IconName } from '@/components/ui/icon';
import type { UserRole } from '@/types';

interface RoleMeta {
    label: string;
    sub: string;
    icon: IconName;
}

export const ROLE_META: Record<UserRole, RoleMeta> = {
    business: { label: 'Business', sub: 'Business account', icon: 'building' },
    reseller: { label: 'Reseller', sub: 'Agent network', icon: 'users' },
    customer: { label: 'Customer', sub: 'Personal account', icon: 'user' },
    admin: { label: 'Super Admin', sub: 'Platform operator', icon: 'shield' },
};
