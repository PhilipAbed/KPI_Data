import {Discussions} from "./data-collection/Discussions";
import {Issues} from "./data-collection/Issues";
import {PullRequests} from "./data-collection/PullRequests";
import {GithubExtractor} from "./data-collection/GithubExtractor";
import {PrInfo, Issue, Discussion} from "./data-collection/types";
import {connectToDB} from "./db/connection";
import {calculateStatistics} from "./logistics/util";

main()

function createInstance<T extends GithubExtractor>(constructor: new (token) => T, token): T {
    return new constructor(token);
}

function extractToken() {
    let token;
    if (process.env.GITHUB_COM_TOKEN) {
        token = `token ${process.env.GITHUB_COM_TOKEN}`
    }

    for (const arg of process.argv) {
        if (arg.startsWith("token=")) {
            token = arg.replace('=', ' ');
        }
    }
    return token;
}

export async function main() {
    let token = extractToken();
    if (!token) {
        return;
    }

    const discussions = await createInstance(Discussions, token).getApiData() as Discussion[];
    const issues = await createInstance(Issues, token).getApiData() as Issue[];
    const pullRequests = await createInstance(PullRequests, token).getApiData() as PrInfo[];
    await calculateStatistics(issues, discussions, pullRequests);

    const conn = await connectToDB();
    // insertIntoDiscussions(discussions);
    await conn.end();
    // const query = `INSERT INTO discussion (id, title, createdAt, updatedAt, author, comments, firstCommentDate, firstCommentAuthor, lastCommentDate,lastCommentAuthor, answeredBy) VALUES (1, 'aa','123','123','me','1,2,3','f','f','l','l','by')`
    // await conn.query(query, function (err, result) {
    //     if (err) throw err;
    //     console.log(result);
    // });
    //
    // await conn.query("SELECT * FROM discussion", function (err, result) {
    //     if (err) throw err;
    //     console.log(result);// an array of rows
    // });



}





