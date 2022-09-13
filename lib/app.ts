import {Discussions} from "./data-collection/Discussions";
import {GithubExtractor, stopExtractionDate} from "./data-collection/GithubExtractor";
import {Discussion, Issue, PrInfo, Stats} from "./data-collection/types";
import {DiscussionTable} from "./dbms/tables/DiscussionTable";
import {calculateDiscussions, calculateIssues, calculatePrs} from "./logistics/calculations";
import {Issues} from "./data-collection/Issues";
import {PullRequests} from "./data-collection/PullRequests";
import {Idbconnection} from "./dbms/interfaces/Idbconnection";
import {SqlLite} from "./dbms/connect/SqlLite";
import {MysqlConnection} from "./dbms/connect/MysqlConnection";
import {PullRequestTable} from "./dbms/tables/PullRequestTable";
import {IssueTable} from "./dbms/tables/IssueTable";
import {StatsTable} from "./dbms/tables/StatsTable";
import {updateHistoryStats} from "./logistics/history";
import {prepareData} from "./logistics/chart/ChartData";

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
    let dbconn: Idbconnection;
    if (process.env.KPI_SQLITE_DB_FILE) {
        dbconn = new SqlLite();
    } else {
        dbconn = new MysqlConnection();
    }
    try {

        await dbconn.connectToDB();

        const listOfPaidAuthors = [
            'PhilipAbed',
            'StinkyLord',
            'hasanawad94',
            'hasanwhitesource',
            'JamieMagee',
            'MaronHatoum',
            'Gabriel-Ladzaretti',
            'betterPeleg',
            'nabeelsaabna',
            'rarkins',
            'HonkingGoose',
            'viceice'];

        if (process.argv.includes("-ed")) {
            const discussions = await createInstance(Discussions, token).getApiData() as Discussion[];
            const stats: Stats = {};
            const relevantDiscussions = calculateDiscussions(discussions, listOfPaidAuthors, stats);
            const discTable = new DiscussionTable(dbconn);
            await discTable.update(relevantDiscussions);
        }
        if (process.argv.includes("-ei")) {
            const issues = await createInstance(Issues, token).getApiData() as Issue[];
            const stats: Stats = {};
            const relevantIssues = calculateIssues(issues, listOfPaidAuthors, stats);
            const issueTable = new IssueTable(dbconn);
            await issueTable.update(relevantIssues);
        }
        if (process.argv.includes("-ep")) {
            const pullRequests = await createInstance(PullRequests, token).getApiData() as PrInfo[];
            const stats: Stats = {};
            const relevantPrs = calculatePrs(pullRequests, listOfPaidAuthors, stats);
            const prTable = new PullRequestTable(dbconn);
            await prTable.update(relevantPrs);
        }

        if (process.argv.includes("-u")) {
            const discTable = new DiscussionTable(dbconn);
            const issueTable = new IssueTable(dbconn);
            const prTable = new PullRequestTable(dbconn);
            const discussions = await discTable.extractTableToObj();
            const issues = await issueTable.extractTableToObj();
            const pullRequests = await prTable.extractTableToObj();

            await updateHistoryStats(discussions, issues, pullRequests, listOfPaidAuthors, dbconn, stopExtractionDate);
            return;
        }
        if (process.argv.includes("-d")) {
            const statsTable = new StatsTable(dbconn);
            const stats: Stats[] = await statsTable.extractTableToObj();
            await prepareData(stats)
            return;
        }
    } catch (err) {
        console.log(err);
    } finally {
        await dbconn.close();
    }
}





