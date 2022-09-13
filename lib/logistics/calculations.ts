import {Discussion, Issue, PrInfo, Stats} from "../data-collection/types";
import {stopExtractionDate} from "../data-collection/GithubExtractor";
import {firstAndLastComments} from "./util";


export function calculatePrs(prs: PrInfo[], listOfPaidAuthors: string[], stats: Stats) {
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
        if (!pr.author) {
            return;
        }
        relevantPRs.push(pr);

        if (pr.state === 'OPEN' && !pr.isDraft) {
            openNonDraftPrs.push(pr.number);
            pr.requiresReview = true;
        } else {
            pr.requiresReview = false;
        }
        let waitingTimeInHours = undefined;
        if (pr.reviewsAndComments) {
            waitingTimeInHours = firstAndLastComments(pr, pr.reviewsAndComments);
        }

        if (listOfPaidAuthors.includes(pr.author)) {
            prsOpenedByMaintainers.push(pr.title)
        } else {
            prsOpenedByOssContributors.push(pr.title);
            ossPrAuthors.push(pr.author)
            if (waitingTimeInHours != null) {
                waitingHoursArrPR.push(waitingTimeInHours);
            } else {
                if (pr.state === 'OPEN' && !pr.isDraft) {
                    pendingPrs.push(pr.number);
                }
            }
        }
    });

    let sumWaitingTimePrs = 0;
    for (const number of waitingHoursArrPR) {
        sumWaitingTimePrs += number;
    }

    stats.prAverageTimeResponse = (sumWaitingTimePrs/ 24) / waitingHoursArrPR.length;
    stats.numberOfOpenedPrsByMaintainers = prsOpenedByMaintainers.length;
    stats.numberOfOpenedPrsByCommunity = prsOpenedByOssContributors.length;
    stats.pendingNewPrs = JSON.stringify(pendingPrs);
    stats.prsRequireAttention = JSON.stringify(openNonDraftPrs);
    return relevantPRs;
}

export function calculateIssues(issues: Issue[], listOfPaidAuthors: string[], stats: Stats) {
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
        if (!is.author) {
            return;
        }

        relevantIssues.push(is);

        let waitingTimeInHours = null;
        if (is.comments) {
            waitingTimeInHours = firstAndLastComments(is, is.comments);
        }
        if(is.labels) {
            let lowestTime;
            for (const label of is.labels) {
                if((label.name.startsWith('status') && !label.name.includes('requirements')) ||
                    (label.name.startsWith('priority') && !label.name.includes('triage')) ||
                    (!label.name.startsWith('priority') && !label.name.startsWith('status') && !label.name.startsWith('type'))
                ){
                    const hours = Math.abs(label.updatedAt.getTime() - is.createdAt.getTime()) / 3600000;
                    if(!lowestTime || hours < lowestTime) {
                        lowestTime = hours;
                    }
                }
            }
            if(!waitingTimeInHours || lowestTime < waitingTimeInHours) {
                waitingTimeInHours = lowestTime;
            }
        }


        if (listOfPaidAuthors.includes(is.author)) {
            issuesOpenedByMaintainers.push(is.title)
        } else {
            issuesOpenedByOssContributors.push(is.title);
            ossIssueAuthors.push(is.author)
            if (waitingTimeInHours != null) {
                waitingHoursArrIssues.push(waitingTimeInHours);
            } else {
                if (is.state === 'OPEN') {
                    pendingIssues.push(is.number);
                }
            }
        }
    });

    let sumWaitingTimeIssues = 0;
    for (const number of waitingHoursArrIssues) {
        sumWaitingTimeIssues += number;
    }
    stats.issuesAverageTimeResponse = (sumWaitingTimeIssues/ 24)  / waitingHoursArrIssues.length;
    stats.numberOfGithubIssuesByCommunity = issuesOpenedByOssContributors.length;
    stats.numberOfGithubIssuesByMaintainers = issuesOpenedByMaintainers.length;
    stats.pendingIssues = JSON.stringify(pendingIssues);
    return relevantIssues;
}

export function calculateDiscussions(discussions: Discussion[], listOfPaidAuthors: string[], stats: Stats) {
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
        if (!dis.author) {
            return;
        }

        relevantDiscussions.push(dis);

        let waitingTimeInHours = null;
        if (dis.comments) {
            waitingTimeInHours = firstAndLastComments(dis, dis.comments);
        }

        if (listOfPaidAuthors.includes(dis.author)) {
            discussionsOpenedByMaintainers.push(dis.title)
        } else {
            discussionsOpenedByOssContributors.push(dis.title);
            ossDiscussionsAuthors.push(dis.author)
            // only community PRs are relevant for response times
            if (waitingTimeInHours != null) {
                waitingHoursArrDiscussions.push(waitingTimeInHours);
            } else {
                pendingDiscussions.push(dis.number);
            }
        }
    });

    let sumWaitingTimeDiscussions = 0;
    for (const number of waitingHoursArrDiscussions) {
        sumWaitingTimeDiscussions += number;
    }

    stats.discussionsAverageTimeResponse = (sumWaitingTimeDiscussions/ 24)  / waitingHoursArrDiscussions.length;
    stats.numberOfGithubDiscussionsByCommunity = discussionsOpenedByOssContributors.length;
    stats.numberOfGithubDiscussionsByMaintainers = discussionsOpenedByMaintainers.length;
    stats.pendingDiscussions = JSON.stringify(pendingDiscussions);
    return relevantDiscussions;
}

