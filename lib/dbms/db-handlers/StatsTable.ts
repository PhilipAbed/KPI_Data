import {Stats} from "../../data-collection/types";


export class StatsTable {
    private stats: Stats;
    private conn: any;
    private date: Date;

    constructor(stats: Stats, conn: any, date: Date) {
        this.stats = stats;
        this.conn = conn;
        this.date = date;
    }

    public update() {
        let sql = `INSERT INTO stats (statsDate,numberOfGithubIssuesByMaintainers,numberOfGithubIssuesByCommunity,numberOfGithubDiscussionsByMaintainers,numberOfGithubDiscussionsByCommunity,numberOfOpenedPrsByMaintainers,numberOfOpenedPrsByCommunity,prAverageTimeResponse,discussionsAverageTimeResponse,issuesAverageTimeResponse,pendingDiscussions,pendingIssues,pendingNewPrs,prsRequireAttention) VALUES `;
        const statsValues = this.prepareData(this.stats).join('","');
        sql = sql.concat(`("${statsValues}")`);
        this.conn.exec(sql);
    }

    prepareData(st: Stats): any {
        return [
            this.date,
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
}