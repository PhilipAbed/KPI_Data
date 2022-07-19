import {Discussion, Issue, PrInfo} from "../DataCollection/types";

export function responseTimes(issues: Issue[], discussions: Discussion[], prs: PrInfo[]) {
    for (const pr of prs) {
        let acknowledgementDays = null;
        let authorOfFirstComment = null
        for (const review of pr.reviewsAndComments) {
            if (review.author != 'renovateBot' && review.author != pr.author) {
                acknowledgementDays = Math.abs(review.submittedAt.getTime() - pr.createdAt.getTime());
                review.author = authorOfFirstComment;
            }
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

/*

Community Responsiveness (North Star) - The average amount of time taken to respond to the community.
  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx OSS PRs - Acknowledge newly created PRs to the OSS repo.
  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxIssues / Discussions - Response time to GitHub Issues and Discussions created in the OSS repo.
Community Health
  Number of OSS Contributors - The number of contributors to the OSS repository.
  Number of Contributor PRs Opened - The number of PRs opened by contributors to the OSS repo.
  Number of GitHub Issues / Discussions Opened - The number of Issues / Discussions created by the OSS community.

 */