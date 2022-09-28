import type {Discussion, GithubData, Issue, PrInfo, Stats} from "../data-collection/types";
import {calculateDiscussions, calculateIssues, calculatePrs} from "./calculations";
import type {Idbconnection} from "../dbms/interfaces/Idbconnection";
import {StatsTable} from "../dbms/tables/StatsTable";

function get7daysAgo(oldDate: Date) {
    return new Date(oldDate.getTime() - 7 * 24 * 60 * 60 * 1000);
}

interface StatsRecord {
    statsDate: Date,
    stats: Stats
}

export async function updateHistoryStats(discussions: Discussion[], issues: Issue[], prs: PrInfo[], listOfPaidAuthors: string[], dbconn: Idbconnection, stopExtractionDate: Date) {
    let allStats: StatsRecord[] = [];
    let date = new Date();
    let olderDate = get7daysAgo(date);
    while (date > stopExtractionDate) {
        const stats: Stats = {};

        let thisWeekPrs: PrInfo[] = getThisWeekData(prs, olderDate, date);
        calculatePrs(thisWeekPrs, listOfPaidAuthors, stats);

        let thisWeekIssues: Issue[] = getThisWeekData(issues, olderDate, date);
        calculateIssues(thisWeekIssues, listOfPaidAuthors, stats);

        let thisWeekDiscussions: Discussion[] = getThisWeekData(discussions, olderDate, date);
        calculateDiscussions(thisWeekDiscussions, listOfPaidAuthors, stats);

        const statRecord: StatsRecord = {statsDate:date, stats:stats};
        allStats.push(statRecord);
        date = olderDate;
        olderDate = get7daysAgo(date);
    }

    for(const statRecord of allStats) {
         const statsTable = new StatsTable(dbconn, statRecord.statsDate);
         await statsTable.update(statRecord.stats);
    }
}


function getThisWeekData(data: GithubData[], olderDate: Date, date: Date) {
    let thisWeeksData = [];
    for (const d of data) {
        if (d.updatedAt < olderDate || d.updatedAt > date) {
            // pr is not in our calculated week
            continue;
        }
        thisWeeksData.push(d);
    }
    return thisWeeksData;
}