import {Discussion, Issue, PrInfo, Stats} from "../data-collection/types";
import {stopExtractionDate} from "../data-collection/GithubExtractor";
import {firstAndLastComments} from "./util";


export function calculatePrs(prs: PrInfo[], listOfPaidAuthors: string[], stats: Stats) {
    let checkedPrs = [];
    let pendingPrs = [];
    let prsOpenedByMaintainers = [];
    let prsOpenedByOssContributors = [];
    let waitingHoursArrPR = [];
    let ossPrAuthors = [];
    let openNonDraftPrs = [];

    let relevantPRs: PrInfo[] = [];
    prs.forEach(pr => {
        if (pr.updatedAt < stopExtractionDate) {
            return;
        }
        if (pr.state === 'OPEN' && !pr.isDraft) {
            openNonDraftPrs.push(pr.number);
            pr.requiresReview = true;
        }

        let waitingTimeInHours = undefined;
        if (pr.reviewsAndComments) {
            waitingTimeInHours = firstAndLastComments(pr, pr.reviewsAndComments);
        }

        if (waitingTimeInHours != null) {
            checkedPrs.push(pr);
            waitingHoursArrPR.push(waitingTimeInHours);
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
    for (const number of waitingHoursArrPR) {
        sumWaitingTimePrs += number;
    }

    stats.prAverageTimeResponse = sumWaitingTimePrs / waitingHoursArrPR.length;
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
    let waitingHoursArrIssues = [];
    let ossIssueAuthors = [];

    let relevantIssues: Issue[] = [];
    issues.forEach(is => {
        if (is.updatedAt < stopExtractionDate) {
            return;
        }
        let waitingTimeInHours = null;
        if (is.comments) {
            waitingTimeInHours = firstAndLastComments(is, is.comments);
        }

        if (waitingTimeInHours != null) {
            checkedIssues.push(is);
            waitingHoursArrIssues.push(waitingTimeInHours);
        } else {
            if (is.state === 'OPEN') {
                pendingIssues.push(is.number);
            }
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
    for (const number of waitingHoursArrIssues) {
        sumWaitingTimeIssues += number;
    }
    stats.issuesAverageTimeResponse = sumWaitingTimeIssues / waitingHoursArrIssues.length;
    stats.numberOfGithubIssuesByCommunity = issuesOpenedByOssContributors.length;
    stats.numberOfGithubIssuesByMaintainers = issuesOpenedByMaintainers.length;
    stats.pendingIssues = JSON.stringify(pendingIssues);
    return relevantIssues;
}

export function calculateDiscussions(discussions: Discussion[], listOfPaidAuthors: string[], stats: Stats) {
    let checkedDiscussions = [];
    let pendingDiscussions = [];

    let discussionsOpenedByMaintainers = [];
    let discussionsOpenedByOssContributors = [];
    let waitingHoursArrDiscussions = [];
    let ossDiscussionsAuthors = [];

    let relevantDiscussions: Discussion[] = [];
    discussions.forEach(dis => {
        if (dis.updatedAt < stopExtractionDate) {
            return;
        }
        let waitingTimeInHours = null;
        if (dis.comments) {
            waitingTimeInHours = firstAndLastComments(dis, dis.comments);
        }
        if (waitingTimeInHours != null) {
            checkedDiscussions.push(dis);
            waitingHoursArrDiscussions.push(waitingTimeInHours);
        } else {
            pendingDiscussions.push(dis.number);
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
    for (const number of waitingHoursArrDiscussions) {
        sumWaitingTimeDiscussions += number;
    }

    stats.discussionsAverageTimeResponse = sumWaitingTimeDiscussions / waitingHoursArrDiscussions.length;
    stats.numberOfGithubDiscussionsByCommunity = discussionsOpenedByOssContributors.length;
    stats.numberOfGithubDiscussionsByMaintainers = discussionsOpenedByMaintainers.length;
    stats.pendingDiscussions = JSON.stringify(pendingDiscussions);

    return relevantDiscussions;
}

