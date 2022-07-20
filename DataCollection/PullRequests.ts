import {Comment, GithubData, PrInfo, Review, ReviewState} from "./types";
import {GithubExtractor, stopExtractionDate} from "./GithubExtractor";

export class PullRequests extends GithubExtractor {

  /*  protected getQuery(): string {
        return `
        {
           repository(owner:"renovatebot", name: "renovate") {
              pullRequests(last:100, states:OPEN) {
                 totalCount
                    pageInfo {
                      startCursor
                      endCursor
                      hasNextPage
                      hasPreviousPage
                    }
                 nodes {
                    isDraft
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
    }*/
    protected getQuery(): string {
        return `
        {
           repository(owner:"renovatebot", name: "renovate") {
              pullRequests(last:100) {
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
        return data.pullRequests?.pageInfo?.hasPreviousPage &&
            (new Date(data.pullRequests.nodes[0].createdAt) > stopExtractionDate)
    }

    protected getNextQuery(data: any): string {
        const startCursor = data.pullRequests.pageInfo.startCursor;
        return this.getQuery()
            .replace('pullRequests(last:100)', `pullRequests(last:100, before: "${startCursor}")`)
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
            let prInfo: PrInfo = {
                title: pr.title,
                number: pr.number,
                createdAt: new Date(pr.createdAt),
                updatedAt: new Date(pr.updatedAt),
                author: pr.author.login,
                isDraft: pr.isDraft
            };
            if(pr.state){
                prInfo.state = pr.state;
            }
            if (pr.reviews?.nodes?.length > 0) {
                prInfo.reviewsAndComments = [];
                for (const revObj of pr.reviews.nodes) {
                    const review: Review = {
                        author: revObj.author.login,
                        state: revObj.state,
                        submittedAt: new Date(revObj.submittedAt)
                    }
                    prInfo.reviewsAndComments.push(review);
                }
            }
            if (pr.participants?.nodes?.length > 0) {
                prInfo.participants = []
                for (const participant of pr.participants.nodes) {
                    prInfo.participants.push(participant.login)
                }
            }
            if (pr.comments?.nodes?.length > 0) {
                prInfo.reviewsAndComments = [];
                prInfo.comments = [];
                for (const comment of pr.comments.nodes) {
                    const review: Review = {
                        author: comment.author.login,
                        state: ReviewState.PR_COMMENT,
                        submittedAt: new Date(comment.createdAt)
                    }
                    prInfo.reviewsAndComments.push(review);
                    const cmt: Comment = {author: comment.author.login, submittedAt: new Date(comment.createdAt)}
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
