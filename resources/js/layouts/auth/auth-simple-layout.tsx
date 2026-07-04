import { Link, usePage } from '@inertiajs/react';

import { Brand } from '@/components/brand';
import { home } from '@/routes';
import type { AuthLayoutProps, SharedData } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const appName = usePage<SharedData>().props.branding.appName;

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6 md:p-10">
            <div className="w-full max-w-[420px]">
                <Link href={home()} className="mb-6 flex justify-center">
                    <Brand surface="auth" size="lg" />
                </Link>

                <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
                    {(title || description) && (
                        <div className="mb-6">
                            {title && (
                                <h1 className="text-[19px] font-bold tracking-[-0.01em]">
                                    {title}
                                </h1>
                            )}
                            {description && (
                                <p className="mt-1.5 text-[13px] text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                    )}
                    {children}
                </div>

                <p className="mt-6 text-center text-[12px] text-muted-foreground">
                    Secured by {appName}
                </p>
            </div>
        </div>
    );
}
