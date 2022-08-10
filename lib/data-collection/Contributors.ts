// import {GithubData} from "./types";
// import {GithubExtractor} from "./GithubExtractor";
//
// export class Contributors extends GithubExtractor {
//
//     protected getQuery(): string {
//         return `
//            {
//              repository(owner: "renovatebot", name: "renovate") {
//
//                 collaborators {
//                     nodes {
//                         name
//                     }
//                 }
//              }
//            }
//    `;
//     }
//
//     protected parseData(data: any): GithubData[] {
//         return data;
//     }
// }

