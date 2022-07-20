import {Discussion, Issue, PrInfo} from "../DataCollection/types";
import {stopExtractionDate} from "../DataCollection/GithubExtractor";

export interface Stats {
    prAverageTimeResponse?: number,
    discussionsAverageTimeResponse?: number,
    issuesAverageTimeResponse?: number,
    numberOfOssContributors?: number,
    numberOfOpenedPrsByContributors?: number,
    numberOfOpenedPrsByMaintainers?: number,
    numberOfGithubIssuesByCommunity?: number,
    numberOfGithubDiscussionsByCommunity?: number;
}

export async function responseTimes(issues: Issue[], discussions: Discussion[], prs: PrInfo[]) {

    const listOfPaidAuthors = ['PhilipAbed', 'hasanawad94','hasanwhitesource','JamieMagee', 'MaronHatoum', 'Gabriel-Ladzaretti', 'betterPeleg', 'nabeelsaabna', 'rarkins', 'viceice', 'renovateBot', 'renovate'];
    let checkedPrs = [];
    let pendingPrs = [];
    let prsOpenedByMaintainers = [];
    let prsOpenedByOssContributors = [];
    let acknowledgementDaysArr = [];
    let ossPrAuthors = [];

    console.log("maintainers list: " + listOfPaidAuthors);

    for (const pr of prs) {
        if (new Date(pr.createdAt) < stopExtractionDate || listOfPaidAuthors.includes(pr.author)) {
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
            acknowledgementDaysArr.push(acknowledgementDays);
        } else {
            pendingPrs.push(pr);
            acknowledgementDaysArr.push(Math.abs(new Date().getDate() - pr.createdAt.getDate()));
        }

        if (pr.author) {
            if (listOfPaidAuthors.includes(pr.author)) {
                prsOpenedByMaintainers.push(pr.title)
            } else {
                prsOpenedByOssContributors.push(pr.title);
                ossPrAuthors.push(pr.author)
            }
        } else {
            console.log("pr without author : " + pr.number);
        }
    }
    let sumWaitingTimePrs = 0;
    for (const number of acknowledgementDaysArr) {
        sumWaitingTimePrs += number;
    }

    const stats: Stats = {};
    stats.prAverageTimeResponse = sumWaitingTimePrs / acknowledgementDaysArr.length;
    stats.numberOfOpenedPrsByMaintainers = prsOpenedByOssContributors.length;
    stats.numberOfOpenedPrsByContributors = prsOpenedByOssContributors.length;


    console.log(stats);
    // for(const is of issues){
    //     let acknowledgementDays = null;
    //     let authorOfFirstComment = null;
    //     for (const comment of is.comments) {
    //         if (comment.author != 'renovateBot' && comment.author != is.author) {
    //             acknowledgementDays = Math.abs(comment.submittedAt.getTime() - is.createdAt.getTime());
    //             comment.author = authorOfFirstComment;
    //         }
    //     }
    // }

    // for(const dis of discussions){
    //     let acknowledgementDays = null;
    //     let authorOfFirstComment = null;
    //     for (const comment of dis.comments) {
    //         if (comment.author != 'renovateBot' && comment.author != dis.author) {
    //             acknowledgementDays = Math.abs(comment.submittedAt.getTime() - dis.createdAt.getTime());
    //             comment.author = authorOfFirstComment;
    //         }
    //     }
    // }


}

