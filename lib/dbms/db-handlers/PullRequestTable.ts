import {PrInfo} from "../../data-collection/types";
import {IgithubDB} from "../interfaces/IgithubDB";
import {isEqual} from "../util";

export class PullRequestTable implements IgithubDB {
    private prs: PrInfo[];
    private conn: any;

    constructor(prs: PrInfo[], conn: any) {
        this.prs = prs;
        this.conn = conn;
    }

    public async update() {
        const sqlRes = await this.selectTable();
        let table;
        if (sqlRes && sqlRes.length > 0) {
            table = sqlRes[0];
        } else {
            return;
        }

        if (!table) {
            console.log('table is empty, insert all Issues');
            await this.insertRows(this.prs);
            return;
        }

        const allNumbers = table.map(r => r.id);
        const pullRequestsToInsert = this.prs.filter(dis => !allNumbers.includes(dis.number));
        await this.insertRows(pullRequestsToInsert)
        const prsToUpdate = this.prs.filter(dis => allNumbers.includes(dis.number));
        await this.updateRows(prsToUpdate, table);
    }

    async selectTable() {
        const [rows] = await this.conn.exec('SELECT * FROM pull_request');
        return [rows];
    }

    async insertRows(prs: PrInfo[]) {
        if (!prs.length) {
            return;
        }
        let sql = `INSERT INTO pull_request VALUES `;
        let values = ``;
        for (const pr of prs) {
            const prValues = this.convertToArr(pr).join('","');
            values = values.concat(`("${prValues}"),`);
        }
        // remove trailing comma
        sql = sql.concat(values.substring(0, values.length - 1));
        this.conn.exec(sql);
    }

    async updateRow(id: number, p: PrInfo) {
        const pr = this.convertToObj(p);
        const sql = `UPDATE pull_request SET id=${pr.id}, title="${pr.title}", createdAt="${pr.createdAt}", updatedAt="${pr.updatedAt}", author="${pr.author}", comments="${pr.comments}", firstCommentDate="${pr.firstCommentDate}", firstCommentAuthor="${pr.firstCommentAuthor}", lastCommentDate="${pr.lastCommentDate}",lastCommentAuthor="${pr.lastCommentAuthor}",prState="${pr.state}",isDraft="${pr.isDraft}", reviewsAndComments="${pr.reviewsAndComments}", participants="${pr.participants}", lastCommitDate="${pr.lastCommitDate}", requiresReview="${pr.requiresReview}" where id = ${id}`;
        await this.conn.exec(sql);
    }

    async updateRows(prs: PrInfo[], table: any) {
        let map = new Map<number, any>();
        table.forEach(row => map[row.id] = row);

        for (const iss of prs) {
            const issRow = this.convertToObj(iss);
            let row = map[iss.number];
            if (row && isEqual(row, issRow)) {
                await this.updateRow(row.id, iss);
            }
        }
    }

    convertToArr(pr: PrInfo): any {
        return [
            pr.number,
            pr.title.replace(/\"/g, "'"),
            pr.createdAt.toDateString(),
            pr.updatedAt.toDateString(),
            pr.author ?? '',
            pr.comments ? JSON.stringify(pr.comments).replace(/\"/g, "'") : '',
            pr.firstCommentDate ? pr.firstCommentDate.toDateString() : '',
            pr.firstCommentAuthor ?? '',
            pr.lastCommentDate ? pr.lastCommentDate.toDateString() : '',
            pr.lastCommentDateAuthor ?? '',
            pr.state,
            pr.isDraft,
            pr.reviewsAndComments ? JSON.stringify(pr.reviewsAndComments).replace(/\"/g, "'") : '',
            pr.participants ? JSON.stringify(pr.participants).replace(/\"/g, "'") : '',
            pr.lastCommitDate.toDateString(),
            pr.requiresReview
        ];
    }

    convertToObj(pr: PrInfo): any {
        return {
            id: pr.number,
            title: pr.title.replace(/\"/g, "'"),
            createdAt: pr.createdAt.toDateString(),
            updatedAt: pr.updatedAt.toDateString(),
            author: pr.author ?? '',
            comments: pr.comments ? JSON.stringify(pr.comments).replace(/\"/g, "'") : '',
            firstCommentDate: pr.firstCommentDate ? pr.firstCommentDate.toDateString() : '',
            firstCommentAuthor: pr.firstCommentAuthor ?? '',
            lastCommentDate: pr.lastCommentDate ? pr.lastCommentDate.toDateString() : '',
            lastCommentAuthor: pr.lastCommentDateAuthor ?? '',
            prState: pr.state,
            isDraft: pr.isDraft,
            reviewsAndComments: pr.reviewsAndComments ? JSON.stringify(pr.reviewsAndComments).replace(/\"/g, "'") : '',
            participants: pr.participants ? JSON.stringify(pr.participants).replace(/\"/g, "'") : '',
            lastCommitDate: pr.lastCommitDate.toDateString(),
            requiresReview: pr.requiresReview,
        };
    }
}