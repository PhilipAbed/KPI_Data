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
}

export interface Discussion extends GithubData{
    totalCount: number;
    answerAuthor?: string;
    answerChosenAt?: Date;
}

