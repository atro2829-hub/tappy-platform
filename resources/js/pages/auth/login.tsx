import { Form, Head, router } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type DemoAccount = {
    role: string;
    email: string;
    description: string;
};

type Props = {
    status?: string;
    canResetPassword: boolean;
    demo?: {
        password: string;
        accounts: DemoAccount[];
    } | null;
};

export default function Login({ status, canResetPassword, demo }: Props) {
    const [demoLoading, setDemoLoading] = useState<string | null>(null);

    const loginAs = (email: string) => {
        if (!demo) {
            return;
        }

        setDemoLoading(email);
        // Reflect the choice in the visible form, then submit the credentials.
        const set = (id: string, value: string) => {
            const el = document.getElementById(id) as HTMLInputElement | null;

            if (el) {
                el.value = value;
            }
        };
        set('email', email);
        set('password', demo.password);
        router.post(
            store.url(),
            { email, password: demo.password, remember: false },
            { onFinish: () => setDemoLoading(null) },
        );
    };

    return (
        <>
            <Head title="Log in" />

            {demo && (
                <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                        <p className="text-sm font-semibold">Demo mode</p>
                        <span className="ml-auto text-xs text-muted-foreground">
                            One-click login
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {demo.accounts.map((a) => (
                            <button
                                key={a.email}
                                type="button"
                                onClick={() => loginAs(a.email)}
                                disabled={demoLoading !== null}
                                className="flex flex-col gap-1.5 rounded-lg border bg-background p-3 text-left transition-colors hover:bg-muted/60 disabled:opacity-60"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                                        {a.role.charAt(0)}
                                    </span>
                                    <span className="truncate text-[13px] font-medium">
                                        {a.role}
                                    </span>
                                    {demoLoading === a.email && (
                                        <Spinner className="ml-auto" />
                                    )}
                                </span>
                                <span className="grid gap-0.5 border-t pt-2">
                                    <span className="truncate font-mono text-[11px] text-foreground">
                                        {a.email}
                                    </span>
                                    <span className="font-mono text-[11px] text-muted-foreground">
                                        <span className="opacity-60">pw:</span>{' '}
                                        {demo.password}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <PasskeyVerify />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot your password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <TextLink href={register()} tabIndex={5}>
                                Sign up
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in',
};
