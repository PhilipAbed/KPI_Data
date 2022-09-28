import type {Issue, Label} from "../../data-collection/types";
import {AbstractDbTable} from "./AbstractDbTable";
import {isEqual} from "../util";
import type {IGithubDB} from "../interfaces/IGithubDB";


export class IssueTable extends AbstractDbTable implements IGithubDB  {

    public async update(issues: Issue[]) {
        const table = await this.selectTable('issues');

        if (table.length == 0) {
            console.log('table is empty, insert all issues');
            await this.insertRows(issues);
            return;
        }
        // @ts-ignore
        const allNumbers = table.map(r => r.id);
        const issuesToInsert = issues.filter(dis => !allNumbers.includes(dis.number));
        await this.insertRows(issuesToInsert)
        const issuesToUpdate = issues.filter(dis => allNumbers.includes(dis.number));
        await this.updateRows(issuesToUpdate, table);
    }



    async insertRows(issues: Issue[]) {
        if (!issues.length) {
            return;
        }
        let sql = `INSERT INTO issues VALUES `;
        let values = ``;
        for (const iss of issues) {
            const issValues = this.convertToArr(iss).join(`','`);
            values = values.concat(`('${issValues}'),`);
        }
        // remove trailing comma
        sql = sql.concat(values.substring(0, values.length - 1));
        this.conn.exec(sql);
    }

    async updateRow(id: number, is: Issue) {
        const iss = this.convertToObj(is);
        const sql = `UPDATE issues SET id=${iss.id}, title='${iss.title}', createdAt='${iss.createdAt}', updatedAt='${iss.updatedAt}', author='${iss.author}', comments='${iss.comments}', firstCommentDate='${iss.firstCommentDate}', firstCommentAuthor='${iss.firstCommentAuthor}', lastCommentDate='${iss.lastCommentDate}',lastCommentAuthor='${iss.lastCommentAuthor}',labels='${iss.labels}',issueState='${iss.state}' where id = ${id}`;
        await this.conn.exec(sql);
    }

    async updateRows(issues: Issue[], table: any) {
        let map = new Map<number, any>();
        // @ts-ignore
        table.forEach(row => map[row.id] = row);
        for (const iss of issues) {
            const issRow = this.convertToObj(iss);
            // @ts-ignore
            let row = map[iss.number];
            if (row && isEqual(row, issRow)) {
                await this.updateRow(row.id, iss);
            }
        }
    }

    convertToArr(iss: Issue): any {
        return [
            iss.number,
            iss.title,
            iss.createdAt.toDateString(), iss.updatedAt.toDateString(),
            iss.author ?? '',
            iss.comments ? JSON.stringify(iss.comments) : '',
            iss.firstCommentDate ? iss.firstCommentDate.toDateString() : '',
            iss.firstCommentAuthor ?? '',
            iss.lastCommentDate ? iss.lastCommentDate.toDateString() : '',
            iss.lastCommentAuthor ?? '',
            iss.labels ? JSON.stringify(iss.labels) : '',
            iss.state,
        ];
    }

    convertToObj(iss: Issue): any {
        return {
            id: iss.number,
            title: iss.title,
            createdAt: iss.createdAt.toDateString(),
            updatedAt: iss.updatedAt.toDateString(),
            author: iss.author ?? '',
            comments: iss.comments ? JSON.stringify(iss.comments) : '',
            firstCommentDate: iss.firstCommentDate ? iss.firstCommentDate.toDateString() : '',
            firstCommentAuthor: iss.firstCommentAuthor ?? '',
            lastCommentDate: iss.lastCommentDate ? iss.lastCommentDate.toDateString() : '',
            lastCommentAuthor: iss.lastCommentAuthor ?? '',
            labels: iss.labels ? JSON.stringify(iss.labels) : '',
            issueState: iss.state,
        };
    }

    public async extractTableToObj(): Promise<Issue[]> {
        const table = await this.selectTable('issues');

        let res :Issue[] = [];
        // @ts-ignore
        table.forEach(row => {
            const issue: Issue = {
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
                labels: this.convertLabels(row.labels),
                state: row.issueState,
            };
            res.push(issue);

        });
        return res;
    }
    protected convertLabels(labels: string): Label[] {
        if(!labels){
            return [];
        }
        const res: Label[]= [];
        const labelsObj = JSON.parse(labels);
        for(const label of labelsObj){
            const l :Label = {name: label.name, updatedAt: new Date(label.updatedAt)}
            res.push(l);
        }
        return res;
    }
}