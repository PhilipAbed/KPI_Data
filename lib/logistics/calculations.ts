import {Discussion, Issue, PrInfo, Stats} from "../data-collection/types";
import {stopExtractionDate} from "../data-collection/GithubExtractor";
import {firstAndLastComments} from "./util";


export function calculatePrs(prs: PrInfo[], listOfPaidAuthors: string[], stats: Stats) {
    let checkedPrs = [];
    let pendingPrs = [];
    let prsOpenedByMaintainers = [];
    let prsOpenedByOssContributors = [];
    let waitingDaysArrPR = [];
    let ossPrAuthors = [];
    let openNonDraftPrs = [];

    let relevantPRs: PrInfo[] = [];
    prs.forEach(pr => {
        if (new Date(pr.createdAt) < stopExtractionDate) {
            return;
        }
        pr.requiresReview = [];
        if (pr.state === 'OPEN' && !pr.isDraft) {
            openNonDraftPrs.push(pr.number);
            pr.requiresReview.push(pr.number);
        }

        let acknowledgementDays = undefined;
        if (pr.reviewsAndComments) {
            acknowledgementDays = firstAndLastComments(pr, pr.reviewsAndComments);
        }

        if (acknowledgementDays != null) {
            checkedPrs.push(pr);
            waitingDaysArrPR.push(acknowledgementDays);
        } else {
            if (pr.state === 'OPEN' && !pr.isDraft) {
                pendingPrs.push(pr.number);
            }
            // waitingDaysArrPR.push(Math.abs(new Date().getDate() - pr.createdAt.getDate()));
        }

        relevantPRs.push(pr);
        if (!pr.author) {
            return;
        }

        if (listOfPaidAuthors.includes(pr.author)) {
            prsOpenedByMaintainers.push(pr.title)
        } else {
            prsOpenedByOssContributors.push(pr.title);
            ossPrAuthors.push(pr.author)
        }
    });

    let sumWaitingTimePrs = 0;
    for (const number of waitingDaysArrPR) {
        sumWaitingTimePrs += number;
    }

    stats.prAverageTimeResponse = sumWaitingTimePrs / waitingDaysArrPR.length;
    stats.numberOfOpenedPrsByMaintainers = prsOpenedByMaintainers.length;
    stats.numberOfOpenedPrsByCommunity = prsOpenedByOssContributors.length;
    stats.pendingNewPrs = JSON.stringify(pendingPrs);
    stats.prsRequireAttention = JSON.stringify(openNonDraftPrs);
    return relevantPRs;
}

export function calculateIssues(issues: Issue[], listOfPaidAuthors: string[], stats: Stats) {
    let checkedIssues = [];
    let pendingIssues = [];

    let issuesOpenedByMaintainers = [];
    let issuesOpenedByOssContributors = [];
    let waitingDaysArrIssues = [];
    let ossIssueAuthors = [];

    let relevantIssues: Issue[] = [];
    issues.forEach(is => {
        if (new Date(is.createdAt) < stopExtractionDate) {
            return;
        }
        let acknowledgementDays = null;
        if (is.comments) {
            acknowledgementDays = firstAndLastComments(is, is.comments);
        }

        if (acknowledgementDays != null) {
            checkedIssues.push(is);
            waitingDaysArrIssues.push(acknowledgementDays);
        } else {
            if (is.state === 'OPEN') {
                pendingIssues.push(is.number);
            }
            // waitingDaysArrIssues.push(Math.abs(new Date().getDate() - is.createdAt.getDate()));
        }

        relevantIssues.push(is);
        if (!is.author) {
            return;
        }

        if (listOfPaidAuthors.includes(is.author)) {
            issuesOpenedByMaintainers.push(is.title)
        } else {
            issuesOpenedByOssContributors.push(is.title);
            ossIssueAuthors.push(is.author)
        }
    });

    let sumWaitingTimeIssues = 0;
    for (const number of waitingDaysArrIssues) {
        sumWaitingTimeIssues += number;
    }
    stats.issuesAverageTimeResponse = sumWaitingTimeIssues / waitingDaysArrIssues.length;
    stats.numberOfGithubIssuesByCommunity = issuesOpenedByOssContributors.length;
    stats.numberOfGithubIssuesByMaintainers = issuesOpenedByMaintainers.length;
    stats.pendingIssues = JSON.stringify(pendingIssues);
    return relevantIssues;
}

export function calculateDiscussions(discussions: Discussion[],  listOfPaidAuthors: string[], stats: Stats) {
    let checkedDiscussions = [];
    let pendingDiscussions = [];

    let discussionsOpenedByMaintainers = [];
    let discussionsOpenedByOssContributors = [];
    let waitingDaysArrDiscussions = [];
    let ossDiscussionsAuthors = [];

    let relevantDiscussions: Discussion[] = [];
    discussions.forEach(dis => {
        if (new Date(dis.createdAt) < stopExtractionDate) {
            return;
        }
        let acknowledgementDays = null;
        if (dis.comments) {
            acknowledgementDays = firstAndLastComments(dis, dis.comments);
        }
        if (acknowledgementDays != null) {
            checkedDiscussions.push(dis);
            waitingDaysArrDiscussions.push(acknowledgementDays);
        } else {
            pendingDiscussions.push(dis.number);
            // waitingDaysArrDiscussions.push(Math.abs(new Date().getDate() - dis.createdAt.getDate()));
        }

        relevantDiscussions.push(dis);

        if (!dis.author) {
            return;
        }

        if (listOfPaidAuthors.includes(dis.author)) {
            discussionsOpenedByMaintainers.push(dis.title)
        } else {
            discussionsOpenedByOssContributors.push(dis.title);
            ossDiscussionsAuthors.push(dis.author)
        }
    });

    let sumWaitingTimeDiscussions = 0;
    for (const number of waitingDaysArrDiscussions) {
        sumWaitingTimeDiscussions += number;
    }

    stats.discussionsAverageTimeResponse = sumWaitingTimeDiscussions / waitingDaysArrDiscussions.length;
    stats.numberOfGithubDiscussionsByCommunity = discussionsOpenedByOssContributors.length;
    stats.numberOfGithubDiscussionsByMaintainers = discussionsOpenedByMaintainers.length;
    stats.pendingDiscussions = JSON.stringify(pendingDiscussions);

    return relevantDiscussions;
}

