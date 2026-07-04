/**
 * Types + a tiny message factory for the Copilot drawer. The Copilot is driven
 * entirely by the real backend (`/copilot/ask` + `/copilot/execute`), which only
 * produces `text` and `confirm` messages — so this file holds just the shared
 * message shapes, no scripted/mock logic.
 */
import type { IconName } from '@/components/ui/icon';

export interface AiTx {
    id: string;
    type?: string;
    operatorId?: string;
    action: string;
    icon: IconName;
    recipientName?: string | null;
    recipientNumber?: string;
    recipientMask: string;
    country: string | null;
    countryName: string;
    operator: string | null;
    product: string;
    localAmount: number;
    cur: string;
    usd: number;
    fee: number;
    discount: number;
    total: number;
    eta: string;
    highValue: boolean;
    status: string;
    brandColor?: string;
    validated?: boolean;
    // Gift-card drafts carry a few extra descriptors.
    brand?: string;
    denom?: number;
    quantity?: number;
    deliverVia?: string;
}

export interface AiMessage {
    id: string;
    who: 'ai' | 'user';
    kind: string;
    text?: string;
    tx?: AiTx;
    status?: string;
    examples?: boolean;
}

const uid = () => 'm' + Math.random().toString(36).slice(2, 9);

export function ai(kind: string, extra: Partial<AiMessage> = {}): AiMessage {
    return { id: uid(), who: 'ai', kind, ...extra };
}
