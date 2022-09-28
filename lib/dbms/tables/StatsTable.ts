import type {Stats} from "../../data-collection/types";
import {AbstractDbTable} from "./AbstractDbTable";


export class StatsTable extends AbstractDbTable {
    private readonly date: Date;

    constructor(conn: any, recordDate: Date = new Date()) {
        super(conn);
        this.date = recordDate;
    }

    public async update(stats: Stats) {
        let sql = `INSERT INTO stats (statsDate,numberOfGithubIssuesByMaintainers,numberOfGithubIssuesByCommunity,numberOfGithubDiscussionsByMaintainers,numberOfGithubDiscussionsByCommunity,numberOfOpenedPrsByMaintainers,numberOfOpenedPrsByCommunity,prAverageTimeResponse,discussionsAverageTimeResponse,issuesAverageTimeResponse,pendingDiscussions,pendingIssues,pendingNewPrs,prsRequireAttention) VALUES `;
        const statsValues = this.convertToArr(stats).join('","');
        sql = sql.concat(`("${statsValues}")`);
        this.conn.exec(sql);
    }

    convertToArr(st: Stats): any {
        return [
            this.date.toLocaleDateString("en-US"),
            st.numberOfGithubIssuesByMaintainers,
            st.numberOfGithubIssuesByCommunity,
            st.numberOfGithubDiscussionsByMaintainers,
            st.numberOfGithubDiscussionsByCommunity,
            st.numberOfOpenedPrsByMaintainers,
            st.numberOfOpenedPrsByCommunity,
            st.prAverageTimeResponse,
            st.discussionsAverageTimeResponse,
            st.issuesAverageTimeResponse,
            st.pendingDiscussions,
            st.pendingIssues,
            st.pendingNewPrs,
            st.prsRequireAttention,
        ];
    }

    public async extractTableToObj(weeks: number): Promise<Stats[]> {
        let table = await this.selectTable('stats');
        if (!table) {
            return [];
        }
        const filterDatesUntil = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);
        // @ts-ignore
        table = table.filter(row => new Date(row.statsDate) >= filterDatesUntil);
        let res :Stats[] = [];
        // @ts-ignore
        table.forEach(row => {
            const stat: Stats = {
                prsRequireAttention: row.prsRequireAttention? JSON.parse(row.prsRequireAttention) : [],
                pendingNewPrs: row.pendingNewPrs? JSON.parse(row.pendingNewPrs) : [],
                pendingDiscussions: row.pendingDiscussions? JSON.parse(row.pendingDiscussions) : [],
                pendingIssues: row.pendingIssues? JSON.parse(row.pendingIssues) : [],
                prAverageTimeResponse: row.prAverageTimeResponse,
                discussionsAverageTimeResponse: row.discussionsAverageTimeResponse,
                issuesAverageTimeResponse: row.issuesAverageTimeResponse,
                numberOfOpenedPrsByCommunity: row.numberOfOpenedPrsByCommunity,
                numberOfGithubIssuesByCommunity: row.numberOfGithubIssuesByCommunity,
                numberOfGithubDiscussionsByCommunity: row.numberOfGithubDiscussionsByCommunity,
                numberOfOpenedPrsByMaintainers: row.numberOfOpenedPrsByMaintainers,
                numberOfGithubIssuesByMaintainers: row.numberOfGithubIssuesByMaintainers,
                numberOfGithubDiscussionsByMaintainers: row.numberOfGithubDiscussionsByMaintainers,
                statsDate: row.statsDate,
            };
            res.push(stat);
        });
        return res;
    }
}