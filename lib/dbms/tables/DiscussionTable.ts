import {Discussion} from "../../data-collection/types";
import {AbstractDbTable} from "./AbstractDbTable";
import {Idbconnection} from "../interfaces/Idbconnection";
import {isEqual} from "../util";
import {IGithubDB} from "../interfaces/IGithubDB";

export class DiscussionTable extends AbstractDbTable implements IGithubDB {

    public async update(discussions: Discussion[]) {
        const table = await this.selectTable('discussions');

        if (table.length == 0) {
            console.log('table is empty, insert all discussions');
            await this.insertRows(discussions);
            return;
        }
        const allNumbers = table.map(r => r.id);
        // filter discussions that already exist
        const discussionsToInsert = discussions.filter(dis => !allNumbers.includes(dis.number));
        await this.insertRows(discussionsToInsert);

        // check and update rows that exist
        const discussionsToUpdate = discussions.filter(dis => allNumbers.includes(dis.number));
        await this.updateRows(discussionsToUpdate, table);
    }

    async insertRows(discussions: Discussion[]) {
        if (!discussions.length) {
            return;
        }
        let sql = `INSERT INTO discussions VALUES `;
        let values = ``;
        for (const dis of discussions) {
            const disValues = this.convertToArr(dis).join(`','`);
            values = values.concat(`('${disValues}'),`);
        }
        // remove trailing comma
        sql = sql.concat(values.substring(0, values.length - 1));
        try {
            await this.conn.exec(sql);
        } catch (err) {
            console.log(err);
        }
    }

    async updateRow(id: number, dis: Discussion) {
        const disValues = this.convertToObj(dis);
        const sql = `UPDATE discussions SET id=${disValues.id}, title='${disValues.title}', createdAt='${disValues.createdAt}', updatedAt='${disValues.updatedAt}', author='${disValues.author}', comments='${disValues.comments}', firstCommentDate='${disValues.firstCommentDate}', firstCommentAuthor='${disValues.firstCommentAuthor}', lastCommentDate='${disValues.lastCommentDate}',lastCommentAuthor='${disValues.lastCommentAuthor}',answeredBy='${disValues.answeredBy}' where id = ${id}`;
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

    convertToArr(dis: Discussion): any {
        return [
            dis.number,
            dis.title,
            dis.createdAt.toDateString(), dis.updatedAt.toDateString(),
            dis.author ?? '',
            dis.comments ? JSON.stringify(dis.comments) : '',
            dis.firstCommentDate ? dis.firstCommentDate.toDateString() : '',
            dis.firstCommentAuthor ?? '',
            dis.lastCommentDate ? dis.lastCommentDate.toDateString() : '',
            dis.lastCommentAuthor ?? '',
            dis.answerAuthor ?? ''
        ];
    }

    convertToObj(dis: Discussion): any {
        return {
            id: dis.number,
            title: dis.title,
            createdAt: dis.createdAt.toDateString(),
            updatedAt: dis.updatedAt.toDateString(),
            author: dis.author ?? '',
            comments: dis.comments ? JSON.stringify(dis.comments) : '',
            firstCommentDate: dis.firstCommentDate ? dis.firstCommentDate.toDateString() : '',
            firstCommentAuthor: dis.firstCommentAuthor ?? '',
            lastCommentDate: dis.lastCommentDate ? dis.lastCommentDate.toDateString() : '',
            lastCommentAuthor: dis.lastCommentAuthor ?? '',
            answeredBy: dis.answerAuthor ?? ''
        };
    }

    public async extractTableToObj(): Promise<Discussion[]> {
        const table =  await this.selectTable('discussions');

        let res :Discussion[] = [];
        table.forEach(row => {
            const discussion: Discussion = {
                number: row.id,
                title: row.title,
                createdAt: new Date(row.createdAt),
                updatedAt: new Date(row.updatedAt),
                author: row.author,
                comments: this.convertComment(row.comments),
                firstCommentDate: new Date(row.firstCommentDate),
                firstCommentAuthor: row.firstCommentAuthor,
                lastCommentDate: new Date(row.lastCommentDate),
                lastCommentAuthor: row.lastCommentAuthor,
                answerAuthor: row.author
            };
            res.push(discussion);
        });
        return res;
    }
}

