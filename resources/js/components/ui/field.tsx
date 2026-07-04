import { createContext, useContext, useId } from 'react';
import type * as React from 'react';

interface FieldProps {
    label?: React.ReactNode;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    htmlFor?: string;
    children: React.ReactNode;
}

/**
 * Provides the field's input id to descendant form controls so the <label> is
 * programmatically associated without every call site wiring `htmlFor`/`id`.
 */
const FieldIdContext = createContext<string | undefined>(undefined);

/** Resolve the id a form control should use: an explicit prop wins, else the surrounding Field's id. */
export function useFieldId(explicitId?: string): string | undefined {
    const contextId = useContext(FieldIdContext);

    return explicitId ?? contextId;
}

/** Labelled form field with hint / error text. */
export function Field({ label, hint, error, htmlFor, children }: FieldProps) {
    const generatedId = useId();
    const id = htmlFor ?? generatedId;

    return (
        <div>
            {label && (
                <label className="mb-1.5 block text-[12.5px] font-medium" htmlFor={id}>
                    {label}
                </label>
            )}
            <FieldIdContext.Provider value={id}>{children}</FieldIdContext.Provider>
            {error ? (
                <div className="mt-1.5 text-xs text-destructive">{error}</div>
            ) : hint ? (
                <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div>
            ) : null}
        </div>
    );
}
