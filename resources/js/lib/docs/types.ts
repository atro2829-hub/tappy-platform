import type { ReactNode } from 'react';

import type { IconName } from '@/components/ui/icon';

/** A single documentation page in the registry. */
export type DocPage = {
    slug: string;
    title: string;
    description: string;
    group: string;
    icon: IconName;
    body: ReactNode;
};

/** A sidebar nav group (derived from the page order). */
export type DocNavGroup = {
    group: string;
    pages: { slug: string; title: string; icon: IconName }[];
};
