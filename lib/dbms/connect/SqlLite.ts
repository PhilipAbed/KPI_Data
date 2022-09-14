import * as sqlite from 'sqlite3';
import {open} from 'sqlite';
import type {Idbconnection} from "../interfaces/Idbconnection";

export class SqlLite implements Idbconnection {
    private conn: any;

    public async connectToDB() {
        this.conn = await open({
            filename: process.env.KPI_SQLITE_DB_FILE!,
            mode: sqlite.OPEN_READWRITE,
            driver: sqlite.Database
        });
    }

    close() {
        // it's a file no actual connection to close
    }

    async exec(query: string): Promise<any> {
        let rows: any;
        try {
            rows = await this.conn.all(query);
        } catch (err) {
            console.log(err);
        }
        return [rows];
    }
}