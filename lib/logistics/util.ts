import {Comment, Discussion, GithubData, Issue, PrInfo} from "../data-collection/types";
import {calculateDiscussions, calculateIssues, calculatePrs} from "./Statistics";

export interface Stats {
    pendingPrs?: string;
    pendingDiscussions?: string;
    pendingIssues?: string;

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

export function firstAndLastComments(data: GithubData, comments: Comment[]) {
    let acknowledgementDays;
    for (const review of comments) {
        if (review.author != 'renovateBot' && review.author != 'renovate' && review.author != data.author) {
            acknowledgementDays = Math.abs(review.submittedAt.getDate() - data.createdAt.getDate());
            data.firstCommentAuthor = review.author;
            data.firstCommentDate = review.submittedAt;
            break;
        }
    }

    if(comments.length> 1 && comments[comments.length-1]){
        const lastComment = comments[comments.length-1];
        data.lastCommentDate = lastComment.submittedAt;
        data.lastCommentDateAuthor = lastComment.author;
    }
    return acknowledgementDays;
}

export async function calculateStatistics(issues: Issue[], discussions: Discussion[], prs: PrInfo[]) {

    const listOfPaidAuthors = ['PhilipAbed', 'hasanawad94', 'hasanwhitesource', 'JamieMagee', 'MaronHatoum', 'Gabriel-Ladzaretti', 'betterPeleg', 'nabeelsaabna', 'rarkins', 'viceice', 'renovateBot', 'renovate'];
    const stats: Stats = {};
    calculatePrs(prs, listOfPaidAuthors, stats);
    calculateIssues(issues, listOfPaidAuthors, stats);
    calculateDiscussions(discussions, issues, listOfPaidAuthors, stats);

    console.log(JSON.stringify(stats));
}

