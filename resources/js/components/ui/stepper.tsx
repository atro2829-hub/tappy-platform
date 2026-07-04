import { Fragment } from 'react';

import { Icon } from '@/components/ui/icon';

interface StepperProps {
    steps: string[];
    current: number;
}

export function Stepper({ steps, current }: StepperProps) {
    return (
        <div className="flex items-center">
            {steps.map((s, i) => {
                const done = i < current;
                const active = i === current;

                return (
                    <Fragment key={i}>
                        {i > 0 && (
                            <div
                                className="mx-2.5 h-[1.5px] w-9"
                                style={{ background: i <= current ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
                            />
                        )}
                        <div className="flex items-center gap-2.5">
                            <div
                                className="flex size-7 shrink-0 items-center justify-center rounded-full border-[1.5px] text-xs font-semibold transition"
                                style={{
                                    borderColor: done || active ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                                    background: done ? 'hsl(var(--primary))' : 'hsl(var(--background))',
                                    color: done
                                        ? 'hsl(var(--primary-foreground))'
                                        : active
                                          ? 'hsl(var(--primary))'
                                          : 'hsl(var(--muted-foreground))',
                                }}
                            >
                                {done ? <Icon name="check" className="size-3.5" /> : i + 1}
                            </div>
                            <span
                                className="hidden text-[12.5px] font-medium sm:inline"
                                style={{
                                    color: done || active ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                                }}
                            >
                                {s}
                            </span>
                        </div>
                    </Fragment>
                );
            })}
        </div>
    );
}
