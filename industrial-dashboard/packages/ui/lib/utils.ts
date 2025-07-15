export function formatUptime(uptimeMinutos: number): string {
    const hours = Math.floor(uptimeMinutos / 60);
    const minutes = Math.floor(uptimeMinutos % 60);

    if (hours === 0) {
        return `${minutes}min`;
    }
    return `${hours}h ${minutes}min`;
}