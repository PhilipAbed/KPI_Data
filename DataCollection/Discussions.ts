import {Comment, Discussion, GithubData} from "./types";
import {GithubExtractor, stopExtractionDate} from "./GithubExtractor";

export class Discussions extends GithubExtractor {

    protected getQuery(): string {
        return `
    {
     repository(owner: "renovatebot", name: "renovate") {
        discussions(first: 100) {
          totalCount 
          pageInfo {
            startCursor
            endCursor
            hasNextPage
            hasPreviousPage
          }
          nodes {
            title
            answer {
              author{login}
            }
            author{login}
            answerChosenAt
            number
            createdAt
            updatedAt
            comments(first:100) {
              nodes{
                  author{login}
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
        return data.discussions?.pageInfo?.hasNextPage &&
            (new Date(data.discussions.nodes[data.discussions.nodes.length-1].updatedAt) > stopExtractionDate)
    }

    protected getNextQuery(data: any): string {
        const endCursor = data.discussions.pageInfo.endCursor;
        return this.getQuery()
            .replace('discussions(first: 100)', `discussions(first: 100, after: "${endCursor}")`)
    }

    protected aggregateData(data: any, nextData: any) {
        data.discussions.pageInfo = nextData.discussions.pageInfo;
        data.discussions.nodes.push(...nextData.discussions.nodes);
    };

    protected parseData(data: any): GithubData[] {
        let discussionInfo: Discussion[] = [];
        if (!data || data.discussions?.nodes?.length <= 0) {
            return discussionInfo;
        }

        for (const dis of data.discussions.nodes) {
            let discussion: Discussion = {
                title: dis.title,
                number: dis.number,
                createdAt: new Date(dis.createdAt),
                updatedAt: new Date(dis.updatedAt),
                answerChosenAt: new Date(dis.answerChosenAt),
                totalCount: data.totalCount,
            };

            if(dis.author?.login) {
                discussion.author = dis.author.login;
            }

            if (dis.answer?.author) {
                discussion.answerAuthor = dis.answer.author.login;
            }

            if (dis.comments?.nodes?.length > 0) {
                discussion.comments = [];
                for (const comment of dis.comments.nodes) {
                    const cmt: Comment = {author: comment.author.login, submittedAt: comment.createdAt}
                    discussion.comments.push(cmt);
                }
            }

            discussionInfo.push(discussion);
        }
        return discussionInfo;
    }
}