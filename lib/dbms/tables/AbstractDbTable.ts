import type {Idbconnection} from "../interfaces/Idbconnection";
import type {Comment} from "../../data-collection/types";


export abstract class AbstractDbTable {
    protected readonly conn: Idbconnection;
    constructor(conn: any) {
        this.conn = conn;
    }

    protected async selectTable(tableName: string) {
        const [rows] = await this.conn.exec(`SELECT * FROM ${tableName}`);
        const sqlRes = [rows];
        let table;
        if (!sqlRes || sqlRes.length < 1) {
            console.log('unable to connect');
            return;
        }

        table = sqlRes[0];
        if (!table) {
            return [];
        }
        return table;
    };

    protected convertComment(commentsStr: string): Comment[] {
        if(!commentsStr){
            return [];
        }
        const res: Comment[]= [];
        const commentsObj = JSON.parse(commentsStr);
        for(const comment of commentsObj){
            const com :Comment = {author: comment.author, submittedAt: new Date(comment.submittedAt)}
            res.push(com);
        }
        return res;
    }
}