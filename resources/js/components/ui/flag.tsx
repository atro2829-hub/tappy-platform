interface FlagProps {
    /** ISO-3166 alpha-2 country code, e.g. "NG". */
    code?: string;
    size?: number;
}

/** Renders an emoji flag from an ISO country code. */
export function Flag({ code, size = 20 }: FlagProps) {
    const emoji = code
        ? code
              .toUpperCase()
              .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
        : '🏳️';

    return (
        <span
            className="inline-flex justify-center leading-none"
            style={{ fontSize: size * 0.95, width: size + 4 }}
        >
            {emoji}
        </span>
    );
}
