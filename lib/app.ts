import {Discussions} from "./data-collection/Discussions";
import {GithubExtractor} from "./data-collection/GithubExtractor";
import {Discussion, Issue, PrInfo, Stats} from "./data-collection/types";
import {DiscussionTable} from "./dbms/db-handlers/DiscussionTable";
import {calculateDiscussions, calculateIssues, calculatePrs} from "./logistics/calculations";
import {Issues} from "./data-collection/Issues";
import {PullRequests} from "./data-collection/PullRequests";
import {Idbconnection} from "./dbms/interfaces/Idbconnection";
import {SqlLite} from "./dbms/connect/SqlLite";
import {MysqlConnection} from "./dbms/connect/MysqlConnection";
import {PullRequestTable} from "./dbms/db-handlers/PullRequestTable";
import {IssueTable} from "./dbms/db-handlers/IssueTable";
import {StatsTable} from "./dbms/db-handlers/StatsTable";

main();

function createInstance<T extends GithubExtractor>(constructor: new (token) => T, token): T {
    return new constructor(token);
}

function extractToken() {
    let token;
    if (process.env.GITHUB_COM_TOKEN) {
        token = `token ${process.env.GITHUB_COM_TOKEN}`
    }

    for (const arg of process.argv) {
        if (arg.startsWith("token=")) {
            token = arg.replace('=', ' ');
        }
    }
    return token;
}

export async function main() {
    let token = extractToken();
    if (!token) {
        return;
    }

    const discussions = await createInstance(Discussions, token).getApiData() as Discussion[];
    const issues = await createInstance(Issues, token).getApiData() as Issue[];
    const pullRequests = await createInstance(PullRequests, token).getApiData() as PrInfo[];
    const listOfPaidAuthors = ['PhilipAbed', 'hasanawad94', 'hasanwhitesource', 'JamieMagee', 'MaronHatoum', 'Gabriel-Ladzaretti', 'betterPeleg', 'nabeelsaabna', 'rarkins', 'viceice', 'renovateBot', 'renovate'];
    const stats: Stats = {};
    const relevantDiscussions = calculateDiscussions(discussions, listOfPaidAuthors, stats);
    const relevantIssues = calculateIssues(issues, listOfPaidAuthors, stats);
    const relevantPrs = calculatePrs(pullRequests, listOfPaidAuthors, stats);

    let dbconn: Idbconnection;
    if (process.env.KPI_SQLITE_DB_FILE) {
        dbconn = new SqlLite();
    } else {
        dbconn = new MysqlConnection();
    }

    await dbconn.connectToDB();
    try {
        const discTable = new DiscussionTable(relevantDiscussions, dbconn);
        const issueTable = new IssueTable(relevantIssues, dbconn);
        const prTable = new PullRequestTable(relevantPrs, dbconn);
        const statsTable = new StatsTable(stats, dbconn);
        await discTable.update();
        await issueTable.update();
        await prTable.update();
        await statsTable.update();
    } catch (err) {
        console.log(err);
    } finally {
        await dbconn.close();
    }
}





