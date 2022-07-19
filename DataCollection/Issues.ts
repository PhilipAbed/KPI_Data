import {Comment, GithubData, Issue} from "./types";
import {GithubExtractor} from "./GithubExtractor";

export class Issues extends GithubExtractor {
    protected getQuery(): string {
        return `
        {
           repository(owner:"renovatebot", name: "renovate") {
                issues(last:100) {
                   totalCount 
                    pageInfo {
                      startCursor
                      endCursor
                      hasNextPage
                      hasPreviousPage
                    }
                    nodes {
                        author{login}
                        title
                        createdAt
                        updatedAt
                        labels(first:10){
                        nodes{
                            name
                          }
                        }
                        number
                        comments(first:10){
                            nodes{
                              author {login}
                              createdAt
                            }                        
                        }
                    }
                }
            }
        }
  `;
    }

    protected paginate(data: any) {
        return data.issues?.pageInfo?.hasNextPage
    }

    protected getNextQuery(data: any): string {
        const endCursor = data.issues.pageInfo.endCursor;
        return this.getQuery()
            .replace('issues(last:100)', `issues(last:100, after: "${endCursor}")`)
    }

    protected aggregateData(data: any, nextData: any) {
        data.issues.pageInfo = nextData.issues.pageInfo;
        data.issues.nodes.push(...nextData.issues.nodes);
    };

    protected parseData(data: any): GithubData[] {
        let issuesInfo: Issue[] = [];
        if (!data || data.issues?.nodes?.length <= 0) {
            return issuesInfo;
        }
        for (const is of data.issues.nodes) {
            let issue: Issue = {
                title: is.title,
                number: is.number,
                createdAt: new Date(is.createdAt),
                updatedAt: new Date(is.updatedAt),
                author: is.author.login,
            };
            if (is.labels?.nodes?.length > 0) {
                issue.labels = [];
                for (const label of is.labels.nodes) {
                    issue.labels.push(label);
                }
            }
            if (is.comments?.nodes?.length > 0) {
                issue.comments = [];
                for (const comment of is.comments.nodes) {
                    const cmt: Comment = {author: comment.author.login, submittedAt: comment.createdAt}
                    issue.comments.push(cmt);
                }
            }
            issuesInfo.push(issue);
        }
        return issuesInfo;
    }
}