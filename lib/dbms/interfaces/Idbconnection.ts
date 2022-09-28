export interface Idbconnection {
    connectToDB(): void;

    close(): void;

    exec(query: string): Promise<any>;
}