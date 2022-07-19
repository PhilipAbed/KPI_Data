import {Discussion, Issue, PrInfo} from "../DataCollection/types";

export interface Stats {
    prAverageTimeResponse: number,
    discussionsAverageTimeResponse: number,
    issuesAverageTimeResponse: number,
    numberOfOssContributors: number,
    numberOfOpenedPrsByContributors: number,
    numberOfGithubIssuesByCommunity: number,
    numberOfGithubDiscussionsByCommunity: number;
}

export function responseTimes(issues: Issue[], discussions: Discussion[], prs: PrInfo[]) {

    let checkedPrs = []
    let pendingPrs = []
    for (const pr of prs) {
        let acknowledgementDays = null;
        let authorOfFirstComment = null
        for (const review of pr.reviewsAndComments) {
            if (review.author != 'renovateBot' && review.author != 'renovate' && review.author != pr.author) {
                acknowledgementDays = Math.abs(review.submittedAt.getTime() - pr.createdAt.getTime());
                review.author = authorOfFirstComment;
            }
        }
        if(acknowledgementDays) {
            checkedPrs.push(acknowledgementDays);
        } else {
            pendingPrs.push(pr)
        }
    }


    for(const is of issues){
        let acknowledgementDays = null;
        let authorOfFirstComment = null;
        for (const comment of is.comments) {
            if (comment.author != 'renovateBot' && comment.author != is.author) {
                acknowledgementDays = Math.abs(comment.submittedAt.getTime() - is.createdAt.getTime());
                comment.author = authorOfFirstComment;
            }
        }
    }

    for(const dis of discussions){
        let acknowledgementDays = null;
        let authorOfFirstComment = null;
        for (const comment of dis.comments) {
            if (comment.author != 'renovateBot' && comment.author != dis.author) {
                acknowledgementDays = Math.abs(comment.submittedAt.getTime() - dis.createdAt.getTime());
                comment.author = authorOfFirstComment;
            }
        }
    }


}

