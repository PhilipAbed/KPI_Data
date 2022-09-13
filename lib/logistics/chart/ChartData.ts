import {Stats} from "../../data-collection/types";
import {promises as fsPromises} from "fs";

export interface JsonData {
    dates: string[],
    prAvg: number[],
    issueAvg: number[],
    discAvg: number[],
    communityPrs: number[],
    communityIssues: number[],
    communityDiscs: number[],
    mainPrs: number[],
    mainIssues: number[],
    mainDiscs: number[],
    prNeedRev: string[],
    prNew: string[],
    discsNew: string[];
    issuesNew: string[];
}

export async function prepareData(stats: Stats[]) {
    const dates: string[] = [];
    const prAvg: number[] = [];
    const issueAvg: number[] = [];
    const discAvg: number[] = [];
    const communityPrs: number[] = [];
    const communityIssues: number[] = [];
    const communityDiscs: number[] = [];
    const mainPrs: number[] = [];
    const mainIssues: number[] = [];
    const mainDiscs: number[] = [];
    const prNeedRev: string[] = [];
    const prNew: string[] = [];
    const issuesNew: string[] = [];
    const discsNew: string[] = [];

    stats.sort((a: Stats, b: Stats) => {
        return new Date(a.statsDate).getTime() - new Date(b.statsDate).getTime();
    });

    for (const st of stats) {
        dates.push(st.statsDate);
        prAvg.push(st.prAverageTimeResponse);
        issueAvg.push(st.issuesAverageTimeResponse);
        discAvg.push(st.discussionsAverageTimeResponse);
        communityPrs.push(st.numberOfOpenedPrsByCommunity);
        communityIssues.push(st.numberOfGithubIssuesByCommunity);
        communityDiscs.push(st.numberOfGithubDiscussionsByCommunity);
        mainPrs.push(st.numberOfOpenedPrsByMaintainers);
        mainIssues.push(st.numberOfGithubIssuesByMaintainers);
        mainDiscs.push(st.numberOfGithubDiscussionsByMaintainers);
        prNeedRev.concat(st.prsRequireAttention);
        prNew.concat(st.pendingNewPrs);
        issuesNew.concat(st.pendingIssues);
        discsNew.concat(st.pendingDiscussions);
    }
    const data: JsonData = {
        dates,
        prAvg, issueAvg, discAvg,
        communityPrs, communityIssues, communityDiscs,
        mainPrs, mainIssues, mainDiscs,
        prNeedRev, prNew, issuesNew, discsNew
    };
    await writeToFile('var data = ' + JSON.stringify(data));
}

async function writeToFile(data: string) {
    try {
        await fsPromises.writeFile('./lib/logistics/chart/json-data.js', data, {flag: 'w',});
    } catch (err) {
        console.log(err);
        return 'Failed to write to file';
    }
}
