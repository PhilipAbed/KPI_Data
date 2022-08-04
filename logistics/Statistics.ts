import {Discussion, Issue, PrInfo} from "../DataCollection/types";
import {stopExtractionDate} from "../DataCollection/GithubExtractor";

export interface Stats {
    prAverageTimeResponse?: number,
    discussionsAverageTimeResponse?: number,
    issuesAverageTimeResponse?: number,

    numberOfOpenedPrsByCommunity?: number,
    numberOfOpenedPrsByMaintainers?: number,

    numberOfGithubIssuesByCommunity?: number,
    numberOfGithubIssuesByMaintainers?: number,

    numberOfGithubDiscussionsByCommunity?: number;
    numberOfGithubDiscussionsByMaintainers?: number;
}

function calculatePrs(prs: PrInfo[], listOfPaidAuthors: string[], stats: Stats) {
    let checkedPrs = [];
    let pendingPrs = [];
    let prsOpenedByMaintainers = [];
    let prsOpenedByOssContributors = [];
    let waitingDaysArrPR = [];
    let ossPrAuthors = [];

    console.log("maintainers list: " + listOfPaidAuthors);
    for (const pr of prs) {
        if (new Date(pr.createdAt) < stopExtractionDate) {
            continue;
        }
        let acknowledgementDays = null;
        let authorOfFirstComment = null;
        if (pr.reviewsAndComments) {
            for (const review of pr.reviewsAndComments) {
                if (review.author != 'renovateBot' && review.author != 'renovate' && review.author != pr.author) {
                    acknowledgementDays = Math.abs(review.submittedAt.getDate() - pr.createdAt.getDate());
                    review.author = authorOfFirstComment;
                }
            }
        }

        if (acknowledgementDays) {
            checkedPrs.push(pr);
            waitingDaysArrPR.push(acknowledgementDays);
        } else {
            pendingPrs.push(pr);
            waitingDaysArrPR.push(Math.abs(new Date().getDate() - pr.createdAt.getDate()));
        }

        if (!pr.author) {
            continue;
        }
        if (listOfPaidAuthors.includes(pr.author)) {
            prsOpenedByMaintainers.push(pr.title)
        } else {
            prsOpenedByOssContributors.push(pr.title);
            ossPrAuthors.push(pr.author)
        }
    }

    let sumWaitingTimePrs = 0;
    for (const number of waitingDaysArrPR) {
        sumWaitingTimePrs += number;
    }

    stats.prAverageTimeResponse = sumWaitingTimePrs / waitingDaysArrPR.length;
    stats.numberOfOpenedPrsByMaintainers = prsOpenedByMaintainers.length;
    stats.numberOfOpenedPrsByCommunity = prsOpenedByOssContributors.length;
}

function calculateIssues(issues: Issue[], listOfPaidAuthors: string[], stats: Stats) {
    let checkedIssues = [];
    let pendingIssues = [];
    let acknowledgementDays = null;
    let authorOfFirstComment = null;
    let issuesOpenedByMaintainers = [];
    let issuesOpenedByOssContributors = [];
    let waitingDaysArrIssues = [];
    let ossIssueAuthors = [];

    for (const is of issues) {
        if (new Date(is.createdAt) < stopExtractionDate) {
            continue;
        }

        if (is.comments) {
            for (const comment of is.comments) {
                if (comment.author != is.author) {
                    acknowledgementDays = Math.abs(comment.submittedAt.getDate() - is.createdAt.getDate());
                    comment.author = authorOfFirstComment;
                }
            }
        }

        if (acknowledgementDays) {
            checkedIssues.push(is);
            waitingDaysArrIssues.push(acknowledgementDays);
        } else {
            pendingIssues.push(is);
            waitingDaysArrIssues.push(Math.abs(new Date().getDate() - is.createdAt.getDate()));
        }

        if (!is.author) {
            continue;
        }

        if (listOfPaidAuthors.includes(is.author)) {
            issuesOpenedByMaintainers.push(is.title)
        } else {
            issuesOpenedByOssContributors.push(is.title);
            ossIssueAuthors.push(is.author)
        }
    }

    let sumWaitingTimeIssues = 0;
    for (const number of waitingDaysArrIssues) {
        sumWaitingTimeIssues += number;
    }
    stats.issuesAverageTimeResponse = sumWaitingTimeIssues / waitingDaysArrIssues.length;
    stats.numberOfGithubIssuesByCommunity = issuesOpenedByOssContributors.length;
    stats.numberOfGithubIssuesByMaintainers = issuesOpenedByMaintainers.length;
}

function calculateDiscussions(discussions: Discussion[], issues: Issue[], listOfPaidAuthors: string[], stats: Stats) {
    let checkedDiscussions = [];
    let pendingDiscussions = [];
    let acknowledgementDays = null;
    let authorOfFirstComment = null;
    let discussionsOpenedByMaintainers = [];
    let discussionsOpenedByOssContributors = [];
    let waitingDaysArrDiscussions = [];
    let ossIscussionsAuthors = [];


    for (const dis of discussions) {
        if (new Date(dis.createdAt) < stopExtractionDate) {
            continue;
        }

        if (dis.comments) {
            for (const comment of dis.comments) {
                if (comment.author != 'renovateBot' && comment.author != 'renovate' && comment.author != dis.author) {
                    acknowledgementDays = Math.abs(comment.submittedAt.getDate() - dis.createdAt.getDate());
                    comment.author = authorOfFirstComment;
                }
            }
        }
        if (acknowledgementDays) {
            checkedDiscussions.push(dis);
            waitingDaysArrDiscussions.push(acknowledgementDays);
        } else {
            pendingDiscussions.push(dis);
            waitingDaysArrDiscussions.push(Math.abs(new Date().getDate() - dis.createdAt.getDate()));
        }
        if (!dis.author) {
            continue;
        }

        if (listOfPaidAuthors.includes(dis.author)) {
            discussionsOpenedByMaintainers.push(dis.title)
        } else {
            discussionsOpenedByOssContributors.push(dis.title);
            ossIscussionsAuthors.push(dis.author)
        }
    }

    let sumWaitingTimeDiscussions = 0;
    for (const number of waitingDaysArrDiscussions) {
        sumWaitingTimeDiscussions += number;
    }

    stats.discussionsAverageTimeResponse = sumWaitingTimeDiscussions / waitingDaysArrDiscussions.length;
    stats.numberOfGithubDiscussionsByCommunity = discussionsOpenedByOssContributors.length;
    stats.numberOfGithubDiscussionsByMaintainers = discussionsOpenedByMaintainers.length;
}

export async function calculateStatistics(issues: Issue[], discussions: Discussion[], prs: PrInfo[]) {

    const listOfPaidAuthors = ['PhilipAbed', 'hasanawad94', 'hasanwhitesource', 'JamieMagee', 'MaronHatoum', 'Gabriel-Ladzaretti', 'betterPeleg', 'nabeelsaabna', 'rarkins', 'viceice', 'renovateBot', 'renovate'];
    const stats: Stats = {};
    calculatePrs(prs, listOfPaidAuthors, stats);
    calculateIssues(issues, listOfPaidAuthors, stats);
    calculateDiscussions(discussions, issues, listOfPaidAuthors, stats);

    console.log(JSON.stringify(stats));
}

