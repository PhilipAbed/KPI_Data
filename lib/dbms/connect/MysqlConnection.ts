import type {Idbconnection} from "../interfaces/Idbconnection";

export class MysqlConnection implements Idbconnection {
    private conn: any;

    public async connectToDB() {
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection({
            host: process.env.RENOVATE_KPI_HOST,
            user: process.env.RENOVATE_KPI_HOST_USER,
            password: process.env.RENOVATE_KPI_PASSWORD,
            database: 'sql8511743',
            port: 3306
        });
        await connection.connect(function (err: any) {
            if (err) throw err;
            console.log("Connected to DB!");
        });
        return connection;
    }

    async close() {
        if(this.conn){
            await this.conn.end();
        }
    }

    async exec(query: string): Promise<any> {
        let res: any;
        try {
            res = await this.conn.exec(query);
        } catch (err) {
            console.log(err);
        }
        return res;
    }
}