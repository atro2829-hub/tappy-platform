/**
 * Lightweight, dependency-free SVG charts ported from the Tappy design system.
 * Used across dashboards and reports.
 */

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    fill?: boolean;
}

export function Sparkline({ data, width = 120, height = 38, color, fill }: SparklineProps) {
    if (data.length === 0) {
        return null;
    }

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const pts = data.map(
        (v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 6) - 3}`,
    );
    const c = color || 'hsl(var(--primary))';

    return (
        <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
            {fill && <polygon points={`0,${height} ${pts.join(' ')} ${width},${height}`} fill={c} opacity="0.1" />}
            <polyline
                points={pts.join(' ')}
                fill="none"
                stroke={c}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

interface BarDatum {
    label: string;
    value: number;
    dim?: boolean;
}

interface BarChartProps {
    data: BarDatum[];
    height?: number;
    color?: string;
}

export function BarChart({ data, height = 150, color }: BarChartProps) {
    const max = Math.max(...data.map((d) => d.value), 1);

    return (
        <div className="flex items-end gap-2" style={{ height }}>
            {data.map((d, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <div
                        className="w-full max-w-[34px] rounded-t-[5px] rounded-b-[2px] transition-[height] duration-500"
                        style={{
                            height: `${(d.value / max) * 100}%`,
                            minHeight: 4,
                            background: color || 'hsl(var(--primary))',
                            opacity: d.dim ? 0.35 : 1,
                        }}
                        title={`${d.label}: ${d.value}`}
                    />
                    <span className="text-[11px] text-muted-foreground">{d.label}</span>
                </div>
            ))}
        </div>
    );
}

interface DonutSegment {
    value: number;
    color: string;
}

interface DonutProps {
    segments: DonutSegment[];
    size?: number;
    thickness?: number;
}

export function Donut({ segments, size = 132, thickness = 16 }: DonutProps) {
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    const r = (size - thickness) / 2;
    const c = 2 * Math.PI * r;
    let offset = 0;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={thickness} />
            {segments.map((s, i) => {
                const len = (s.value / total) * c;
                const el = (
                    <circle
                        key={i}
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={thickness}
                        strokeDasharray={`${len} ${c - len}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="butt"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        style={{ transition: 'stroke-dasharray .5s' }}
                    />
                );
                offset += len;

                return el;
            })}
        </svg>
    );
}
