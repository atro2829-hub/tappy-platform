import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'tappy_sandbox';
const listeners = new Set<() => void>();

const read = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
};

let sandbox = read();

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const setSandbox = (value: boolean): void => {
    sandbox = value;

    try {
        localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
        // ignore
    }

    listeners.forEach((listener) => listener());
};

/** Global "Production vs Sandbox" API mode toggle, persisted to localStorage. */
export function useSandbox() {
    const value = useSyncExternalStore(
        subscribe,
        () => sandbox,
        () => false,
    );

    return {
        sandbox: value,
        setSandbox,
        toggleSandbox: () => setSandbox(!sandbox),
    } as const;
}
