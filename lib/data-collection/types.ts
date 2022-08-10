import * as querystring from "querystring";

export const enum ReviewState {
    COMMENTED = 'COMMENTED',
    CHANGES_REQUESTED = 'CHANGES_REQUESTED',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    DISMISSED = 'DISMISSED',
    PR_COMMENT = 'PR_COMMENT',
}

export interface Review extends Comment{
    state: ReviewState;
}

export interface Comment {
    author: string;
    submittedAt: Date;
}

export interface GithubData {
    number: number;
    title: string
    author?: string;
    createdAt: Date;
    updatedAt: Date;
    comments?: Comment[];
    firstCommentDate?: Date;
    firstCommentAuthor?: string;
    lastCommentDate?: Date;
    lastCommentDateAuthor?: string;
}

export interface PrInfo extends GithubData {
    isDraft: boolean;
    reviewsAndComments?: Review[];
    participants?: string[];
    lastCommitDate?: Date;
    state?: string;
}
export interface Issue extends GithubData{
    labels?: string[];
    state?: string;
}

export interface Discussion extends GithubData{
    answerAuthor?: string;
    answerChosenAt?: Date;
}

