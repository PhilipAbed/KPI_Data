import {Discussions} from "./data-collection/Discussions";
import type {GithubExtractor} from "./data-collection/GithubExtractor";
import type {Discussion, Issue, PrInfo, Stats} from "./data-collection/types";
import {DiscussionTable} from "./dbms/tables/DiscussionTable";
import {calculateDiscussions, calculateIssues, calculatePrs} from "./logistics/calculations";
import {Issues} from "./data-collection/Issues";
import {PullRequests} from "./data-collection/PullRequests";
import type {Idbconnection} from "./dbms/interfaces/Idbconnection";
import {SqlLite} from "./dbms/connect/SqlLite";
import {MysqlConnection} from "./dbms/connect/MysqlConnection";
import {PullRequestTable} from "./dbms/tables/PullRequestTable";
import {IssueTable} from "./dbms/tables/IssueTable";
import {StatsTable} from "./dbms/tables/StatsTable";
import {updateHistoryStats} from "./logistics/history";
import {prepareData} from "./logistics/chart/ChartData";

main();

function createInstance<T extends GithubExtractor>(constructor: new (token: string) => T, token: string): T {
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
        console.log("need github token in environment variable: GITHUB_COM_TOKEN=YourGithubToken");
        return;
    }
    let dbconn: Idbconnection;
    if (process.env.KPI_SQLITE_DB_FILE) {
        console.log("sql lite DB ");
        dbconn = new SqlLite();
    } else {
        console.log("sql connection  ");
        dbconn = new MysqlConnection();
    }
    if(!dbconn){
        console.log("set DB connection with environment variable: KPI_SQLITE_DB_FILE=YOUR FILE");
        return;
    }

    try {
        console.log("connecting to db");
        await dbconn.connectToDB();

        const listOfPaidAuthors = [
            'PhilipAbed',
            'StinkyLord',
            'JamieMagee',
            'MaronHatoum',
            'Gabriel-Ladzaretti',
            'betterPeleg',
            'nabeelsaabna',
            'rarkins',
            'HonkingGoose',
            'viceice'];

        if (process.argv.includes("extractd")) {
            console.log("extract discussions - start");
            const discussions = await createInstance(Discussions, token).getApiData() as Discussion[];
            const stats: Stats = {};
            const relevantDiscussions = calculateDiscussions(discussions, listOfPaidAuthors, stats);
            const discTable = new DiscussionTable(dbconn);
            await discTable.update(relevantDiscussions);
            console.log("extract discussions - end");
        }
        if (process.argv.includes("extracti")) {
            console.log("extract issues - start");
            const issues = await createInstance(Issues, token).getApiData() as Issue[];
            const stats: Stats = {};
            const relevantIssues = calculateIssues(issues, listOfPaidAuthors, stats);
            const issueTable = new IssueTable(dbconn);
            await issueTable.update(relevantIssues);
            console.log("extract issues - end");
        }
        if (process.argv.includes("extractp")) {
            console.log("extract pull requests - start");
            const pullRequests = await createInstance(PullRequests, token).getApiData() as PrInfo[];
            const stats: Stats = {};
            const relevantPrs = calculatePrs(pullRequests, listOfPaidAuthors, stats);
            const prTable = new PullRequestTable(dbconn);
            await prTable.update(relevantPrs);
            console.log("extract pull requests - end");
        }

        for (const arg of process.argv) {
            if(arg.startsWith("sync=")){
                let weeks: number = 0;
                weeks = Number(arg.replace('sync=', ''));

                if(!weeks) {
                    console.log(`update stats table fail - weeks: ${weeks}`);
                    break;
                }

                console.log("update stats from " + weeks + " weeks ago - start");
                const discTable = new DiscussionTable(dbconn);
                const issueTable = new IssueTable(dbconn);
                const prTable = new PullRequestTable(dbconn);
                const discussions = await discTable.extractTableToObj();
                const issues = await issueTable.extractTableToObj();
                const pullRequests = await prTable.extractTableToObj();
                const weeksAgo: Date = new Date(Date.now() - weeks * 24 * 60 * 60 * 1000);
                await updateHistoryStats(discussions, issues, pullRequests, listOfPaidAuthors, dbconn, weeksAgo);
                console.log("update stats 7 days ago - end");
                break;
            }

            if (arg.startsWith("export=")) {
                console.log("create data chart - start");
                let weeks: number = 0;
                weeks = Number(arg.replace('export=', ' '));

                if(!weeks) {
                    console.log(`create data chart - weeks: ${weeks}`);
                    break;
                }

                const statsTable = new StatsTable(dbconn);
                const stats: Stats[] = await statsTable.extractTableToObj(weeks);
                await prepareData(stats)
                console.log("create data chart - end");
                break;
            }
        }
    } catch (err) {
        console.log(err);
    } finally {
        await dbconn.close();
    }
}





