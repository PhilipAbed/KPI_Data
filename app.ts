import {Discussions} from "./DataCollection/Discussions";
import {Issues} from "./DataCollection/Issues";
import {PullRequests} from "./DataCollection/PullRequests";
import {GithubExtractor} from "./DataCollection/GithubExtractor";
import {PrInfo, Issue, Discussion} from "./DataCollection/types";
import {responseTimes} from "./logistics/Statistics";

main()

function createInstance<T extends GithubExtractor>(constructor: new (token) => T, token): T {
    return new constructor(token);
}

function extractToken() {
    let token;
    if (process.env.RENOVATE_KPI_TOKEN) {
        token = `token ${process.env.RENOVATE_KPI_TOKEN}`
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
    // const contributors = await createInstance(Contributors, token).getApiData();
    const discussions = await createInstance(Discussions, token).getApiData() as Discussion[];
    const issues = await createInstance(Issues, token).getApiData() as Issue[];
    const pullRequests = await createInstance(PullRequests, token).getApiData() as PrInfo[];
    await responseTimes(issues, discussions, pullRequests);
}





