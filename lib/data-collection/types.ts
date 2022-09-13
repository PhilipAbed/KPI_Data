export const enum ReviewState {
    COMMENTED = 'COMMENTED',
    CHANGES_REQUESTED = 'CHANGES_REQUESTED',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    DISMISSED = 'DISMISSED',
    PR_COMMENT = 'PR_COMMENT',
}

export interface Review extends Comment {
    state: ReviewState;
}

export interface Comment {
    author: string;
    submittedAt: Date;
}

export interface GithubData {
    number: number;
    title: string
    createdAt: Date;
    updatedAt: Date;
    comments?: Comment[];
    author?: string;
    firstCommentDate?: Date;
    firstCommentAuthor?: string;
    lastCommentDate?: Date;
    lastCommentAuthor?: string;
}

export interface PrInfo extends GithubData {
    isDraft?: boolean;
    reviewsAndComments?: Review[];
    participants?: string[];
    lastCommitDate?: Date;
    state?: string;
    requiresReview?: boolean;
}

export interface Label {
    name?: string,
    updatedAt?: Date,
}

export interface Issue extends GithubData {
    labels?: Label[];
    state?: string;
}

export interface Discussion extends GithubData {
    answerAuthor?: string;
    answerChosenAt?: Date;
}

export interface Stats {
    prsRequireAttention?: string;
    pendingNewPrs?: string;
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
    statsDate?: string;
}
