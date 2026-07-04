/** Build a CSV from rows and trigger a client-side download. */
function esc(value: unknown): string {
    let str = String(value ?? '');

    // Neutralise spreadsheet formula injection: a leading =, +, -, @ (or tab/CR)
    // can execute as a formula in Excel/Sheets, so prefix such cells with a quote.
    if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
    }

    return '"' + str.replace(/"/g, '""') + '"';
}

export function downloadCsv(
    filename: string,
    headers: string[],
    rows: (string | number | null | undefined)[][],
): void {
    const lines = [headers.map(esc).join(',')].concat(
        rows.map((row) => row.map(esc).join(',')),
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}
