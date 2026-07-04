import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useRef,
    useState,
} from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmOptions {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Promise-based confirmation. `const confirm = useConfirm()` then
 * `if (!(await confirm({ title, destructive: true }))) return;`.
 */
export function useConfirm(): ConfirmFn {
    const ctx = useContext(ConfirmContext);

    if (!ctx) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }

    return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const resolver = useRef<((value: boolean) => void) | null>(null);

    const confirm = useCallback<ConfirmFn>(
        (opts) =>
            new Promise<boolean>((resolve) => {
                resolver.current = resolve;
                setOptions(opts);
            }),
        [],
    );

    const settle = (result: boolean) => {
        resolver.current?.(result);
        resolver.current = null;
        setOptions(null);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <Dialog
                open={options !== null}
                onOpenChange={(open) => !open && settle(false)}
            >
                <DialogContent className="max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>{options?.title}</DialogTitle>
                    </DialogHeader>
                    {options?.description && (
                        <p className="text-[13px] leading-relaxed text-muted-foreground">
                            {options.description}
                        </p>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => settle(false)}>
                            {options?.cancelLabel ?? 'Cancel'}
                        </Button>
                        <Button
                            variant={
                                options?.destructive ? 'destructive' : 'default'
                            }
                            onClick={() => settle(true)}
                        >
                            {options?.confirmLabel ?? 'Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ConfirmContext.Provider>
    );
}
