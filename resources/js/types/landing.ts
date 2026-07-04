import type { IconName } from '@/components/ui/icon';

/**
 * Shape of the public landing-page content managed by the CMS
 * (app/Support/LandingContent.php). Every field mirrors a default there, so the
 * page renders identically until an admin edits it.
 */

export interface LandingNavLink {
    label: string;
    anchor: string;
}

export interface LandingMetric {
    label: string;
    value: string;
    icon: IconName;
    tone: string;
}

export interface LandingStep {
    title: string;
    desc: string;
    icon: IconName;
}

export interface LandingProduct {
    icon: IconName;
    label: string;
    desc: string;
}

export interface LandingStat {
    value: string;
    label: string;
}

export interface LandingIconLabel {
    icon: IconName;
    label: string;
}

export interface LandingSecurityFeature {
    icon: IconName;
    title: string;
    desc: string;
}

export interface LandingPlan {
    name: string;
    price: string;
    unit: string;
    popular: boolean;
    cta: string;
    features: string[];
}

export interface LandingFaq {
    q: string;
    a: string;
}

export interface LandingFooterLink {
    label: string;
    href: string;
}

export interface LandingFooterColumn {
    heading: string;
    links: LandingFooterLink[];
}

export interface LandingContent {
    seo: {
        title: string;
        description: string;
        image?: string | null;
        image_path?: string | null;
    };
    nav: {
        links: LandingNavLink[];
        docs_label: string;
        sign_in_label: string;
        start_label: string;
        dashboard_label: string;
    };
    hero: {
        badge: string;
        title: string;
        title_highlight: string;
        subheading: string;
        primary_cta: string;
        secondary_cta: string;
        badges: string[];
        preview: {
            enabled: boolean;
            label: string;
            metrics: LandingMetric[];
        };
    };
    copilot: {
        enabled: boolean;
        badge: string;
        title: string;
        description: string;
        description_strong: string;
        tags: string[];
        reassurance: string;
        primary_cta: string;
        secondary_cta: string;
        steps: LandingStep[];
    };
    products: {
        enabled: boolean;
        eyebrow: string;
        title: string;
        desc: string;
        items: LandingProduct[];
    };
    coverage: {
        enabled: boolean;
        eyebrow: string;
        title: string;
        desc: string;
        stats: LandingStat[];
        more_label: string;
    };
    developers: {
        enabled: boolean;
        eyebrow: string;
        title: string;
        desc: string;
        features: LandingIconLabel[];
        code: {
            endpoint: string;
            request: string;
            response: string;
        };
    };
    pricing: {
        enabled: boolean;
        eyebrow: string;
        title: string;
        desc: string;
        plans: LandingPlan[];
    };
    security: {
        enabled: boolean;
        eyebrow: string;
        title: string;
        desc: string;
        features: LandingSecurityFeature[];
    };
    faq: {
        enabled: boolean;
        eyebrow: string;
        title: string;
        items: LandingFaq[];
    };
    cta: {
        enabled: boolean;
        title: string;
        description: string;
        primary_cta: string;
        secondary_cta: string;
    };
    footer: {
        tagline: string;
        columns: LandingFooterColumn[];
        legal: string;
        copyright: string;
    };
}

/** The section keys an admin can show/hide or reset. */
export type LandingSection =
    | 'seo'
    | 'nav'
    | 'hero'
    | 'copilot'
    | 'products'
    | 'coverage'
    | 'developers'
    | 'pricing'
    | 'security'
    | 'faq'
    | 'cta'
    | 'footer';
