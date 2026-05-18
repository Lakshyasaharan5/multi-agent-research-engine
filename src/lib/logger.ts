import chalk from "chalk";

type LogLevel = "INFO" | "ERROR" | "METRIC";

export class Logger {
    constructor(
        private readonly source = "app",
        private readonly logs: string[] = [],
    ) {}

    private timestamp(): string {
        return new Date().toISOString();
    }

    private formatData(data: unknown[]): string {
        if (data.length === 0) return "";

        return ` ${data
            .map((item) => (typeof item === "string" ? item : JSON.stringify(item, null, 2)))
            .join(" ")}`;
    }

    private log(level: LogLevel, coloredLevel: string, message: string, ...data: unknown[]): void {
        const timestamp = this.timestamp();

        const plainLine = `[${timestamp}] ${level} [${this.source}]: ${message}${this.formatData(data)}`;
        const consoleLine = `[${timestamp}] ${coloredLevel} [${this.source}]: ${message}`;

        console.log(consoleLine, ...data);
        this.logs.push(plainLine);
    }

    info(message: string, ...data: unknown[]) {
        this.log("INFO", chalk.green("INFO"), message, ...data);
    }

    error(message: string, ...data: unknown[]) {
        this.log("ERROR", chalk.red("ERROR"), message, ...data);
    }

    metric(message: string, ...data: unknown[]) {
        this.log("METRIC", chalk.cyanBright("METRIC"), message, ...data);
    }

    child(source: string): Logger {
        return new Logger(`${this.source}:${source}`, this.logs);
    }

    getLogs(): string {
        return this.logs.join("\n");
    }

    clearLogs(): void {
        this.logs.length = 0;
    }
}
