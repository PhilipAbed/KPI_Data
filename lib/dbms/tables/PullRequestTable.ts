import {Label, PrInfo, Review} from "../../data-collection/types";
import {AbstractDbTable} from "./AbstractDbTable";
import {isEqual} from "../util";
import {IGithubDB} from "../interfaces/IGithubDB";

export class PullRequestTable extends AbstractDbTable implements IGithubDB {

    public async update(prs: PrInfo[]) {
        const table = await this.selectTable('pull_requests');

        if (table.length == 0) {
            console.log('table is empty, insert all pull requests');
            await this.insertRows(prs);
            return;
        }

        const allNumbers = table.map(r => r.id);
        const pullRequestsToInsert = prs.filter(dis => !allNumbers.includes(dis.number));
        await this.insertRows(pullRequestsToInsert)
        const prsToUpdate = prs.filter(dis => allNumbers.includes(dis.number));
        await this.updateRows(prsToUpdate, table);
    }

    async insertRows(prs: PrInfo[]) {
        if (!prs.length) {
            return;
        }
        let sql = `INSERT INTO pull_requests VALUES `;
        let values = ``;
        for (const pr of prs) {
            const prValues = this.convertToArr(pr).join(`','`);
            values = values.concat(`('${prValues}'),`);
        }
        // remove trailing comma
        sql = sql.concat(values.substring(0, values.length - 1));
        this.conn.exec(sql);
    }

    async updateRow(id: number, p: PrInfo) {
        const pr = this.convertToObj(p);
        const sql = `UPDATE pull_requests SET id=${pr.id}, title='${pr.title}', createdAt='${pr.createdAt}', updatedAt='${pr.updatedAt}', author='${pr.author}', comments='${pr.comments}', firstCommentDate='${pr.firstCommentDate}', firstCommentAuthor='${pr.firstCommentAuthor}', lastCommentDate='${pr.lastCommentDate}',lastCommentAuthor='${pr.lastCommentAuthor}',prState='${pr.state}',isDraft='${pr.isDraft}', reviewsAndComments='${pr.reviewsAndComments}', participants='${pr.participants}', lastCommitDate='${pr.lastCommitDate}', isReviewed='${!pr.requiresReview}' where id = ${id}`;
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
            pr.title,
            pr.createdAt.toDateString(),
            pr.updatedAt.toDateString(),
            pr.author ?? '',
            pr.comments ? JSON.stringify(pr.comments) : '',
            pr.firstCommentDate ? pr.firstCommentDate.toDateString() : '',
            pr.firstCommentAuthor ?? '',
            pr.lastCommentDate ? pr.lastCommentDate.toDateString() : '',
            pr.lastCommentAuthor ?? '',
            pr.reviewsAndComments ? JSON.stringify(pr.reviewsAndComments) : '',
            pr.participants ? JSON.stringify(pr.participants) : '',
            pr.lastCommitDate.toDateString(),
            pr.state,
            pr.isDraft,
            pr.requiresReview
        ];
    }

    convertToObj(pr: PrInfo): any {
        return {
            id: pr.number,
            title: pr.title,
            createdAt: pr.createdAt.toDateString(),
            updatedAt: pr.updatedAt.toDateString(),
            author: pr.author ?? '',
            comments: pr.comments ? JSON.stringify(pr.comments) : '',
            firstCommentDate: pr.firstCommentDate ? pr.firstCommentDate.toDateString() : '',
            firstCommentAuthor: pr.firstCommentAuthor ?? '',
            lastCommentDate: pr.lastCommentDate ? pr.lastCommentDate.toDateString() : '',
            lastCommentAuthor: pr.lastCommentAuthor ?? '',
            reviewsAndComments: pr.reviewsAndComments ? JSON.stringify(pr.reviewsAndComments) : '',
            participants: pr.participants ? JSON.stringify(pr.participants) : '',
            lastCommitDate: pr.lastCommitDate.toDateString(),
            prState: pr.state,
            isDraft: pr.isDraft,
            requiresReview: pr.requiresReview,
        };
    }

    public async extractTableToObj(): Promise<PrInfo[]> {
        const table = await this.selectTable('pull_requests');

        let res: PrInfo[] = [];
        table.forEach(row => {
            const pr: PrInfo = {
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
                reviewsAndComments: this.convertReviews(row.reviewsAndComments),
                participants: row.participants ? JSON.parse(row.participants) : [],
                lastCommitDate: new Date(row.lastCommitDate),
                state: row.prState,
                isDraft: row.isDraft,
                requiresReview: row.requiresReview,
            };
            res.push(pr);
        });
        return res;
    }

    private convertReviews(reviews: string): Review[] {
        if (!reviews) {
            return [];
        }
        const res: Review[] = [];
        const reviewsObj = JSON.parse(reviews);
        for (const review of reviewsObj) {
            const r: Review = {author: review.author, state: review.state, submittedAt: new Date(review.submittedAt)}
            res.push(r);
        }
        return res;
    }
}
