import {Comment, GithubData} from "../data-collection/types";

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

    if (comments.length > 1 && comments[comments.length - 1]) {
        const lastComment = comments[comments.length - 1];
        data.lastCommentDate = lastComment.submittedAt;
        data.lastCommentDateAuthor = lastComment.author;
    }
    return acknowledgementDays;
}


