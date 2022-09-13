import {Comment, GithubData, PrInfo, Review, ReviewState} from "./types";
import {GithubExtractor, stopExtractionDate} from "./GithubExtractor";

export class PullRequests extends GithubExtractor {

    protected getQuery(): string {
        return `
        {
           repository(owner:"renovatebot", name: "renovate") {
              pullRequests(first:100, orderBy: {field: UPDATED_AT, direction: DESC}) {
                 totalCount 
                    pageInfo {
                      startCursor
                      endCursor
                      hasNextPage
                      hasPreviousPage
                    }
                 nodes {       
                    isDraft
                    state
                    author {
                          login
                    }
                    participants(first:10) {
                             nodes {
                                     login
                             }
                    }
                    commits(last:1){
                      nodes {
                        commit {
                          pushedDate
                        }
                      }
                    }
                    comments(last:100){
                      nodes{
                        author{ login}
                        createdAt
                      }
                    }  
                    number
                    title
                    createdAt
                    updatedAt
                    reviews(last:100) {
                        nodes {
                           author {
                              login
                           }
                           state
                           submittedAt
                        }
                    }              
                 }  
              }
           }   
        }
  `;
    }

    protected paginate(data: any) {
        return data.pullRequests?.pageInfo?.hasNextPage &&
            (new Date(data.pullRequests.nodes[data.pullRequests.nodes.length - 1].updatedAt) > stopExtractionDate)
    }
    protected getNextQuery(data: any): string {
        const endCursor = data.pullRequests.pageInfo.endCursor;
        return this.getQuery()
            .replace('pullRequests(first:100, orderBy: {field: UPDATED_AT, direction: DESC})',
                `pullRequests(first:100, orderBy: {field: UPDATED_AT, direction: DESC}, after: "${endCursor}")`);
    }

    protected aggregateData(data: any, nextData: any): boolean {
        data.pullRequests.pageInfo = nextData.pullRequests.pageInfo;
        data.pullRequests.nodes.push(...nextData.pullRequests.nodes);
        return true;
    };

    protected parseData(data: any): GithubData[] {
        let prsInfos: PrInfo[] = [];
        if (!data || data.pullRequests?.nodes?.length <= 0) {
            return prsInfos;
        }
        for (const pr of data.pullRequests.nodes) {
            const author = pr.author ? pr.author.login : '';
            let prInfo: PrInfo = {
                title: pr.title.replace(/[\"\']/g, ""),
                number: pr.number,
                createdAt: new Date(pr.createdAt),
                updatedAt: new Date(pr.updatedAt),
                author: author.replace(/[\"\']/g, ""),
                isDraft: pr.isDraft,
            };
            prInfo.reviewsAndComments = [];
            if (pr.state) {
                prInfo.state = pr.state;
            }
            if (pr.reviews?.nodes?.length > 0) {
                for (const revObj of pr.reviews.nodes) {
                    const authorName = revObj.author?.login ?? '';
                    const review: Review = {
                        author: authorName.replace(/[\"\']/g, ""),
                        state: revObj.state,
                        submittedAt: new Date(revObj.submittedAt)
                    }
                    prInfo.reviewsAndComments.push(review);
                }
            }
            if (pr.participants?.nodes?.length > 0) {
                prInfo.participants = []
                for (const participant of pr.participants.nodes) {
                    prInfo.participants.push(participant.login.replace(/[\"\']/g, ""))
                }
            }
            if (pr.comments?.nodes?.length > 0) {
                prInfo.comments = [];
                for (const comment of pr.comments.nodes) {
                    const authorNameReviewComment = comment.author?.login ?? '';
                    const review: Review = {
                        author: authorNameReviewComment.replace(/[\"\']/g, ""),
                        state: ReviewState.PR_COMMENT,
                        submittedAt: new Date(comment.createdAt)
                    }
                    prInfo.reviewsAndComments.push(review);
                    const authorName = comment.author?.login ?? '';
                    const cmt: Comment = {author: authorName.replace(/[\"\']/g, ""), submittedAt: new Date(comment.createdAt)}
                    prInfo.comments.push(cmt);
                }
                prInfo.reviewsAndComments = prInfo.reviewsAndComments.sort(
                    (objA, objB) => objA.submittedAt.getTime() - objB.submittedAt.getTime(),
                );
            }
            if (pr.commits?.nodes?.length > 0) {
                for (const commitNode of pr.commits.nodes) {
                    prInfo.lastCommitDate = new Date(commitNode.commit.pushedDate);
                }
            }

            prsInfos.push(prInfo);
        }
        return prsInfos;
    }
}
