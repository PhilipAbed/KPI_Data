
import {Discussion} from "../../data-collection/types";
import {IgithubDB} from "../interfaces/IgithubDB";
import {Idbconnection} from "../interfaces/Idbconnection";
import {isEqual} from "../util";

export class DiscussionTable implements IgithubDB {
    private readonly discussions: Discussion[];
    private readonly conn: Idbconnection;

    constructor(discussions: Discussion[], conn: Idbconnection) {
        this.discussions = discussions;
        this.conn = conn;
    }

    public async update() {
        const sqlRes = await this.selectTable();
        let table;
        if(sqlRes && sqlRes.length>0){
            table = sqlRes[0];
        } else {
            console.log('unable to connect');
            return;
        }

        if(!table) {
            console.log('table is empty, insert all discussions');
            await this.insertRows(this.discussions);
            return;
        }
        const allNumbers = table.map(r => r.id);
        // filter discussions that already exist
        const discussionsToInsert = this.discussions.filter(dis => !allNumbers.includes(dis.number));
        await this.insertRows(discussionsToInsert);

        // check and update rows that exist
        const discussionsToUpdate = this.discussions.filter(dis => allNumbers.includes(dis.number));
        await this.updateRows(discussionsToUpdate, table);
    }

    async selectTable() {
        const [rows] = await this.conn.exec('SELECT * FROM discussion');
        return [rows];
    }

    async insertRows(discussions: Discussion[]) {
        if(!discussions.length){
            return;
        }
        let sql = `INSERT INTO discussion VALUES `;
        let values = ``;
        for (const dis of discussions) {
            const disValues = this.convertToArr(dis).join('","');
            values = values.concat(`("${disValues}"),`);
        }
        // remove trailing comma
        sql = sql.concat(values.substring(0, values.length - 1));
        try {
            await this.conn.exec(sql);
        } catch (err){
            console.log(err);
        }
    }

    async updateRow(id: number, dis: Discussion) {
        const disValues = this.convertToObj(dis);
        const sql = `UPDATE discussion SET id=${disValues.id}, title="${disValues.title}", createdAt="${disValues.createdAt}", updatedAt="${disValues.updatedAt}", author="${disValues.author}", comments="${disValues.comments}", firstCommentDate="${disValues.firstCommentDate}", firstCommentAuthor="${disValues.firstCommentAuthor}", lastCommentDate="${disValues.lastCommentDate}",lastCommentAuthor="${disValues.lastCommentAuthor}",answeredBy="${disValues.answeredBy}" where id = ${id}`;
        await this.conn.exec(sql);
    }

    async updateRows(discussions: Discussion[], table: any) {
        let map = new Map<number, any>();
        table.forEach(row => map[row.id] = row);

        for (const dis of discussions) {
            const disRow = this.convertToObj(dis);
            let row = map[dis.number];
            if (row && !isEqual(row, disRow)) {
                await this.updateRow(row.id, dis);
            }
        }
    }

    convertToArr(dis: Discussion) : any {
        return [
            dis.number,
            dis.title.replace(/\"/g, "'"),
            dis.createdAt.toDateString(), dis.updatedAt.toDateString(),
            dis.author ?? '',
            dis.comments ? JSON.stringify(dis.comments).replace(/\"/g, "'") : '',
            dis.firstCommentDate ? dis.firstCommentDate.toDateString() : '',
            dis.firstCommentAuthor ?? '',
            dis.lastCommentDate ? dis.lastCommentDate.toDateString() : '',
            dis.lastCommentDateAuthor ?? '',
            dis.answerAuthor ?? ''
        ];
    }

    convertToObj(dis: Discussion) : any {
        return {
            id: dis.number,
            title: dis.title.replace(/\"/g, "'"),
            createdAt: dis.createdAt.toDateString(),
            updatedAt: dis.updatedAt.toDateString(),
            author: dis.author ?? '',
            comments: dis.comments ? JSON.stringify(dis.comments).replace(/\"/g, "'") : '',
            firstCommentDate: dis.firstCommentDate ? dis.firstCommentDate.toDateString() : '',
            firstCommentAuthor: dis.firstCommentAuthor ?? '',
            lastCommentDate: dis.lastCommentDate ? dis.lastCommentDate.toDateString() : '',
            lastCommentAuthor: dis.lastCommentDateAuthor ?? '',
            answeredBy: dis.answerAuthor ?? ''
        };
    }
}