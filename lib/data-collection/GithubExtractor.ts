import {graphql} from "@octokit/graphql";
import {Repository} from "github-graphql-schema";
import {GithubData} from "./types";

//7 days ago
export const stopExtractionDate: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
// export const stopExtractionDate: Date = new Date('2022-02-01');

export abstract class GithubExtractor {
    protected abstract parseData(data: any): GithubData[]

    protected abstract paginate(data: any): boolean;

    protected abstract getQuery(): string;

    protected abstract getNextQuery(data: any): string;

    protected abstract aggregateData(data: any, nextData: any);

    private readonly token: string;

    constructor(token: string) {
        this.token = token;
    }

    /**
     * This method will extract all data from the given API until from `stopExtractionDate` until today
     */
    public async getApiData() {
        const query = this.getQuery();
        let data = await this.callGithubApi(query);
        while (this.paginate(data)) {
            const nextQuery = this.getNextQuery(data);
            const nextData = await this.callGithubApi(nextQuery);
            this.aggregateData(data, nextData);
        }
        return this.parseData(data);
    }

    protected async callGithubApi(query: string) {
        const {repository} = await graphql<{ repository: Repository }>(query,
            {
                headers: {
                    authorization: this.token,
                },
            });
        return repository;
    }
}

