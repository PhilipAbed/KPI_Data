import {Comment, GithubData, Issue} from "./types";
import {GithubExtractor, stopExtractionDate} from "./GithubExtractor";

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
                        state
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
        return data.issues?.pageInfo?.hasPreviousPage
            && (new Date(data.issues.nodes[0].createdAt) > stopExtractionDate)
    }

    protected getNextQuery(data: any): string {
        const startCursor = data.issues.pageInfo.startCursor;
        return this.getQuery()
            .replace('issues(last:100)', `issues(last:100, before: "${startCursor}")`)
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
            const author = is.author ? is.author.login : '';
            let issue: Issue = {
                title: is.title,
                number: is.number,
                createdAt: new Date(is.createdAt),
                updatedAt: new Date(is.updatedAt),
                author: author,
                state: is.state,
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
                    const authorName = comment.author?.login ?? '';
                    const cmt: Comment = {author: authorName, submittedAt: new Date(comment.createdAt)}
                    issue.comments.push(cmt);
                }
            }
            issuesInfo.push(issue);
        }
        return issuesInfo;
    }
}