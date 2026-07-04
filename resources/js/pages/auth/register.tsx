import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

const ACCOUNT_TYPES = [
    {
        value: 'business',
        label: 'Business',
        desc: 'Sell airtime, data & gift cards at scale',
    },
    {
        value: 'reseller',
        label: 'Reseller',
        desc: 'Resell to your customers and earn commission',
    },
    {
        value: 'customer',
        label: 'Personal',
        desc: 'Top up your own numbers and buy gift cards',
    },
];

export default function Register({ passwordRules }: Props) {
    const [accountType, setAccountType] = useState('business');
    const needsBusiness = accountType !== 'customer';

    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label>Account type</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {ACCOUNT_TYPES.map((t) => (
                                        <label
                                            key={t.value}
                                            className={cn(
                                                'flex cursor-pointer flex-col gap-1.5 rounded-lg border p-3 transition-colors',
                                                accountType === t.value
                                                    ? 'border-primary bg-primary/5'
                                                    : 'hover:bg-muted/50',
                                            )}
                                        >
                                            <span className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="account_type"
                                                    value={t.value}
                                                    checked={
                                                        accountType === t.value
                                                    }
                                                    onChange={() =>
                                                        setAccountType(t.value)
                                                    }
                                                    className="accent-primary"
                                                />
                                                <span className="text-[13.5px] font-medium">
                                                    {t.label}
                                                </span>
                                            </span>
                                            <span className="text-[11.5px] leading-snug text-muted-foreground">
                                                {t.desc}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.account_type} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {needsBusiness && (
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="business_name">
                                            Business name
                                        </Label>
                                        <Input
                                            id="business_name"
                                            type="text"
                                            required
                                            name="business_name"
                                            placeholder="Acme Ltd"
                                        />
                                        <InputError
                                            message={errors.business_name}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="country">
                                            Country code
                                        </Label>
                                        <Input
                                            id="country"
                                            type="text"
                                            name="country"
                                            maxLength={2}
                                            placeholder="NG"
                                            className="uppercase"
                                        />
                                        <InputError message={errors.country} />
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                    passwordrules={passwordRules}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={6}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create an account',
    description: 'Enter your details below to create your account',
};
