import {Comment, Discussion, GithubData} from "./types";
import {GithubExtractor, stopExtractionDate} from "./GithubExtractor";

export class Discussions extends GithubExtractor {

    protected getQuery(): string {
        return `
    {
     repository(owner: "renovatebot", name: "renovate") {
        discussions(first:100, orderBy: {field: UPDATED_AT, direction: DESC}) {
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
            (new Date(data.discussions.nodes[data.discussions.nodes.length - 1].updatedAt) > stopExtractionDate)
    }

    protected getNextQuery(data: any): string {
        const endCursor = data.discussions.pageInfo.endCursor;
        return this.getQuery()
            .replace('discussions(first:100, orderBy: {field: UPDATED_AT, direction: DESC})',
                `discussions(first:100, orderBy: {field: UPDATED_AT, direction: DESC}, after: "${endCursor}")`);
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
            const author = dis.author ? dis.author.login : '';
            let discussion: Discussion = {
                title: dis.title.replace(/[\"\']/g, ""),
                number: dis.number,
                createdAt: new Date(dis.createdAt),
                updatedAt: new Date(dis.updatedAt),
                answerChosenAt: new Date(dis.answerChosenAt),
                author: author.replace(/[\"\']/g, ""),
            };

            if (dis.answer?.author) {
                discussion.answerAuthor = dis.answer.author.login.replace(/[\"\']/g, "");
            }

            if (dis.comments?.nodes?.length > 0) {
                discussion.comments = [];
                for (const comment of dis.comments.nodes) {
                    const authorName = comment.author?.login ?? '';
                    const cmt: Comment = {author: authorName.replace(/[\"\']/g, ""), submittedAt: new Date(comment.createdAt)}
                    discussion.comments.push(cmt);
                }
            }

            discussionInfo.push(discussion);
        }
        return discussionInfo;
    }
}