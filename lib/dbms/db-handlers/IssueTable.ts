import {Issue} from "../../data-collection/types";
import {IgithubDB} from "../interfaces/IgithubDB";
import {isEqual} from "../util";


export class IssueTable implements IgithubDB {
    private issues: Issue[];
    private conn: any;
    private res;

    constructor(issues: Issue[], conn: any) {
        this.issues = issues;
        this.conn = conn;
    }

    public async update() {
        const sqlRes = await this.selectTable();
        let table;
        if(sqlRes && sqlRes.length>0){
            table = sqlRes[0];
        } else {
            return;
        }

        if(!table) {
            console.log('table is empty, insert all Issues');
            await this.insertRows(this.issues);
            return;
        }

        const allNumbers = table.map(r => r.id);
        const issuesToInsert = this.issues.filter(dis => !allNumbers.includes(dis.number));
        await this.insertRows(issuesToInsert)
        const issuesToUpdate = this.issues.filter(dis => allNumbers.includes(dis.number));
        await this.updateRows(issuesToUpdate, table);
    }

    async selectTable() {
        const [rows] = await this.conn.exec('SELECT * FROM issue');
        return [rows];
    }

    async insertRows(issues: Issue[]) {
        if(!issues.length){
            return;
        }
        let sql = `INSERT INTO issue VALUES `;
        let values = ``;
        for (const iss of issues) {
            const issValues = this.convertToArr(iss).join('","');
            values = values.concat(`("${issValues}"),`);
        }
        // remove trailing comma
        sql = sql.concat(values.substring(0, values.length - 1));
        this.conn.exec(sql);
    }

    async updateRow(id: number, is: Issue) {
        const iss = this.convertToObj(is);
        const sql = `UPDATE issue SET id=${iss.id}, title="${iss.title}", createdAt="${iss.createdAt}", updatedAt="${iss.updatedAt}", author="${iss.author}", comments="${iss.comments}", firstCommentDate="${iss.firstCommentDate}", firstCommentAuthor="${iss.firstCommentAuthor}", lastCommentDate="${iss.lastCommentDate}",lastCommentAuthor="${iss.lastCommentAuthor}",labels="${iss.labels}",issueState="${iss.state}" where id = ${id}`;
        await this.conn.exec(sql);
    }

    async updateRows(issues: Issue[], table: any) {
        let map = new Map<number, any>();
        table.forEach(row => map[row.id] = row);
        for (const iss of issues) {
            const issRow = this.convertToObj(iss);
            let row = map[iss.number];
            if (row && isEqual(row,issRow)) {
                await this.updateRow(row.id, iss);
            }
        }
    }

    convertToArr(iss: Issue) : any {
        return [
            iss.number,
            iss.title.replace(/\"/g, "'"),
            iss.createdAt.toDateString(), iss.updatedAt.toDateString(),
            iss.author ?? '',
            iss.comments ? JSON.stringify(iss.comments).replace(/\"/g, "'") : '',
            iss.firstCommentDate ? iss.firstCommentDate.toDateString() : '',
            iss.firstCommentAuthor ?? '',
            iss.lastCommentDate ? iss.lastCommentDate.toDateString() : '',
            iss.lastCommentDateAuthor ?? '',
            iss.labels ? JSON.stringify(iss.labels).replace(/\"/g, "'") : '',
            iss.state,
        ];
    }

    convertToObj(iss: Issue) : any {
        return {
            id: iss.number,
            title: iss.title.replace(/\"/g, "'"),
            createdAt: iss.createdAt.toDateString(),
            updatedAt: iss.updatedAt.toDateString(),
            author: iss.author ?? '',
            comments: iss.comments ? JSON.stringify(iss.comments).replace(/\"/g, "'") : '',
            firstCommentDate: iss.firstCommentDate ? iss.firstCommentDate.toDateString() : '',
            firstCommentAuthor: iss.firstCommentAuthor ?? '',
            lastCommentDate: iss.lastCommentDate ? iss.lastCommentDate.toDateString() : '',
            lastCommentAuthor: iss.lastCommentDateAuthor ?? '',
            labels: iss.labels ? JSON.stringify(iss.labels).replace(/\"/g, "'") : '',
            issueState: iss.state,
        };
    }
}