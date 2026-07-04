import { Head, useForm } from '@inertiajs/react';
import { useRef } from 'react';

import {
    edit as verificationRoute,
    update as updateKyc,
} from '@/actions/App/Http/Controllers/Settings/KycController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon';

interface DocType {
    key: string;
    label: string;
    hint: string;
    required: boolean;
}

interface UploadedDoc {
    name: string;
    size: number;
    uploadedAt: string | null;
}

interface Props {
    kycStatus: string;
    documentTypes: DocType[];
    documents: Record<string, UploadedDoc>;
    locked: boolean;
}

const STATUS: Record<
    string,
    { icon: IconName; tone: string; title: string; desc: string }
> = {
    pending: {
        icon: 'file',
        tone: 'muted-foreground',
        title: 'Verification required',
        desc: 'Upload the documents below to verify your account and lift transaction limits.',
    },
    review: {
        icon: 'clock',
        tone: 'warning',
        title: 'Under review',
        desc: 'Your documents have been submitted. We’ll notify you once they’ve been reviewed.',
    },
    approved: {
        icon: 'shieldcheck',
        tone: 'success',
        title: 'Verified',
        desc: 'Your account is verified — you can transact at full limits.',
    },
    rejected: {
        icon: 'xcircle',
        tone: 'destructive',
        title: 'Verification rejected',
        desc: 'Your documents were not approved. Please re-upload and resubmit.',
    },
};

function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const kb = bytes / 1024;

    return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

function DocUploader({
    type,
    current,
    file,
    error,
    onPick,
}: {
    type: DocType;
    current?: UploadedDoc;
    file: File | null;
    error?: string;
    onPick: (file: File | null) => void;
}) {
    const ref = useRef<HTMLInputElement>(null);

    return (
        <div className="rounded-lg border p-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium">
                            {type.label}
                        </span>
                        <Badge variant={type.required ? 'outline' : 'muted'}>
                            {type.required ? 'Required' : 'Optional'}
                        </Badge>
                    </div>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                        {type.hint}
                    </p>
                    {current && !file && (
                        <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
                            <Icon
                                name="filecheck"
                                className="size-3.5 text-success"
                            />
                            {current.name}
                            {current.uploadedAt
                                ? ` · uploaded ${current.uploadedAt}`
                                : ''}
                        </p>
                    )}
                    {file && (
                        <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12px]">
                            <Icon
                                name="file"
                                className="size-3.5 text-primary"
                            />
                            {file.name} · {formatBytes(file.size)}
                        </p>
                    )}
                    {error && (
                        <p className="mt-1 text-[11px] text-destructive">
                            {error}
                        </p>
                    )}
                </div>
                <div className="flex-none">
                    <input
                        ref={ref}
                        type="file"
                        accept="application/pdf,image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => ref.current?.click()}
                    >
                        <Icon name="upload" className="size-3.5" />
                        {current || file ? 'Replace' : 'Upload'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function Verification({
    kycStatus,
    documentTypes,
    documents,
    locked,
}: Props) {
    const form = useForm<Record<string, File | null>>(
        Object.fromEntries(documentTypes.map((t) => [t.key, null])),
    );

    const status = STATUS[kycStatus] ?? STATUS.pending;
    const hasFiles = documentTypes.some((t) => form.data[t.key]);

    const submit = () => {
        form.post(updateKyc().url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <>
            <Head title="Verification" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Verification"
                    description="Verify your identity to unlock full transaction limits."
                />

                <div
                    className="flex items-start gap-3 rounded-lg p-3.5"
                    style={{ background: `hsl(var(--${status.tone}) / 0.08)` }}
                >
                    <Icon
                        name={status.icon}
                        className="mt-0.5 size-[18px] shrink-0"
                        style={{ color: `hsl(var(--${status.tone}))` }}
                    />
                    <div>
                        <p className="text-[13px] font-semibold">
                            {status.title}
                        </p>
                        <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                            {status.desc}
                        </p>
                    </div>
                </div>

                {locked ? (
                    <div className="space-y-2.5">
                        {documentTypes.map((type) => {
                            const doc = documents[type.key];

                            return (
                                <div
                                    key={type.key}
                                    className="flex items-center gap-2.5 rounded-lg border p-3"
                                >
                                    <Icon
                                        name="filecheck"
                                        className="size-4 text-success"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[13px] font-medium">
                                            {type.label}
                                        </div>
                                        <div className="text-[12px] text-muted-foreground">
                                            {doc
                                                ? doc.name
                                                : 'No document on file'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <>
                        <div className="space-y-2.5">
                            {documentTypes.map((type) => (
                                <DocUploader
                                    key={type.key}
                                    type={type}
                                    current={documents[type.key]}
                                    file={form.data[type.key]}
                                    error={form.errors[type.key]}
                                    onPick={(file) =>
                                        form.setData(type.key, file)
                                    }
                                />
                            ))}
                        </div>

                        <p className="text-[12px] text-muted-foreground">
                            Accepted formats: PDF, JPG, PNG or WebP, up to
                            5&nbsp;MB each. Documents are stored privately and
                            only used for verification.
                        </p>

                        <div className="flex">
                            <Button
                                onClick={submit}
                                disabled={form.processing || !hasFiles}
                            >
                                {form.processing
                                    ? 'Submitting…'
                                    : 'Submit for review'}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

Verification.layout = {
    breadcrumbs: [{ title: 'Verification', href: verificationRoute() }],
};
