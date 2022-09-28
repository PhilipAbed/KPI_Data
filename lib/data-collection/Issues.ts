import type {Comment, GithubData, Issue, Label} from "./types";
import {GithubExtractor, stopExtractionDate} from "./GithubExtractor";

export class Issues extends GithubExtractor {
    protected getQuery(): string {
        return `
        {
           repository(owner:"renovatebot", name: "renovate") {
                issues(first:100, orderBy: {field: UPDATED_AT, direction: DESC}) {
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
                            updatedAt
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
            && (new Date(data.issues.nodes[data.issues.nodes.length - 1].updatedAt) > stopExtractionDate)
    }

    protected getNextQuery(data: any): string {
        const endCursor = data.issues.pageInfo.endCursor;
        return this.getQuery()
            .replace('issues(first:100, orderBy: {field: UPDATED_AT, direction: DESC})', `issues(first:100, orderBy: {field: UPDATED_AT, direction: DESC}, after: "${endCursor}")`);
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
                title: is.title.replace(/[\"\']/g, ""),
                number: is.number,
                createdAt: new Date(is.createdAt),
                updatedAt: new Date(is.updatedAt),
                author: author.replace(/[\"\']/g, ""),
                state: is.state,
            };
            if (is.labels?.nodes?.length > 0) {
                issue.labels = [];
                for (const label of is.labels.nodes) {
                    const myLabel: Label = {name: label.name.replace(/[\"\']/g, ""), updatedAt: new Date(label.updatedAt)}
                    issue.labels.push(myLabel);
                }
            }
            if (is.comments?.nodes?.length > 0) {
                issue.comments = [];
                for (const comment of is.comments.nodes) {
                    const authorName = comment.author?.login ?? '';
                    const cmt: Comment = {author: authorName.replace(/[\"\']/g, ""), submittedAt: new Date(comment.createdAt)}
                    issue.comments.push(cmt);
                }
            }
            issuesInfo.push(issue);
        }
        return issuesInfo;
    }
}