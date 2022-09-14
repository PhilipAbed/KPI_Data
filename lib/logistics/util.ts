import type {Comment, GithubData} from "../data-collection/types";

export function firstAndLastComments(data: GithubData, comments: Comment[]) {
    let acknowledgmentInHours;
    for (const comment of comments) {
        if (comment.author != data.author) {
            // acknowledgmentInHours = Math.abs(review.submittedAt.getDate() - data.createdAt.getDate());
            // minutes * seconds * milliseconds 60*60*1000 = 3600000
            try {
            acknowledgmentInHours = Math.abs(comment.submittedAt.getTime() - data.createdAt.getTime()) / 3600000;
            data.firstCommentAuthor = comment.author;
            data.firstCommentDate = comment.submittedAt;
            } catch (err){
                console.log(err);
            }
            break;
        }
    }

    if (comments.length > 1 && comments[comments.length - 1]) {
        const lastComment = comments[comments.length - 1];
        data.lastCommentDate = lastComment.submittedAt;
        data.lastCommentAuthor = lastComment.author;
    }
    return acknowledgmentInHours;
}

