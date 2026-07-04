interface OperatorMarkProps {
    op: { name: string; color: string; txt: string };
    size?: number;
}

/** Square operator/brand logo chip with initials. */
export function OperatorMark({ op, size = 36 }: OperatorMarkProps) {
    return (
        <div
            className="flex flex-none items-center justify-center rounded-[9px] font-bold tracking-[-0.02em]"
            style={{ width: size, height: size, background: op.color, color: op.txt, fontSize: size * 0.32 }}
        >
            {op.name.split(' ')[0].slice(0, 3)}
        </div>
    );
}
