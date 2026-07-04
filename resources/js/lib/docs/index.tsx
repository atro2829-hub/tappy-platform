import { adminPages } from './admin';
import { customerPages } from './customer';
import { gettingStartedPages } from './getting-started';
import { referencePages } from './reference';
import type { DocNavGroup, DocPage } from './types';

export type { DocNavGroup, DocPage } from './types';

/**
 * The full, ordered documentation registry. Pages are grouped into the sidebar
 * by their `group` (in first-appearance order); prev/next follows the same
 * order as the sidebar.
 */
const ALL_PAGES: DocPage[] = [
    ...gettingStartedPages,
    ...customerPages,
    ...adminPages,
    ...referencePages,
];

export const DOC_PAGES: Record<string, DocPage> = Object.fromEntries(
    ALL_PAGES.map((page) => [page.slug, page]),
);

export const DOC_NAV: DocNavGroup[] = (() => {
    const order: string[] = [];
    const groups = new Map<string, DocNavGroup>();

    for (const page of ALL_PAGES) {
        if (!groups.has(page.group)) {
            groups.set(page.group, { group: page.group, pages: [] });
            order.push(page.group);
        }

        groups.get(page.group)!.pages.push({
            slug: page.slug,
            title: page.title,
            icon: page.icon,
        });
    }

    return order.map((group) => groups.get(group)!);
})();

export const DOC_ORDER: string[] = DOC_NAV.flatMap((group) =>
    group.pages.map((page) => page.slug),
);
