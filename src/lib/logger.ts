import chalk from "chalk";

export class Logger {
    constructor(private readonly source = "app") {}

    private timestamp(): string {
        return new Date().toISOString();
    }

    private log(level: string, message: string, ...data: unknown[]): void {
        console.log(`[${this.timestamp()}] ${level} [${this.source}]: ${message}`, ...data);
    }

    info(message: string, ...data: unknown[]) {
        this.log(chalk.green("INFO"), message, ...data);
    }

    error(message: string, ...data: unknown[]) {
        this.log(chalk.red("ERROR"), message, ...data);
    }

    metric(message: string, ...data: unknown[]) {
        this.log(chalk.cyanBright("METRIC"), message, ...data);
    }

    child(source: string): Logger {
        return new Logger(`${this.source}:${source}`);
    }
}
