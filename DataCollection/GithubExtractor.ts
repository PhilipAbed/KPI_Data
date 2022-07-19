import {graphql} from "@octokit/graphql";
import {Repository} from "github-graphql-schema";
import {GithubData} from "./types";

export abstract class GithubExtractor {
    protected abstract parseData(data: any): GithubData[]
    protected abstract paginate(data: any): string;
    protected abstract getQuery(): string;
    protected abstract getNextQuery(data: any): string;
    protected abstract aggregateData(data: any, nextData: any);
    private readonly token: string;

    constructor(token: string) {
        this.token = token;
    }
    public async getApiData(){
        const query = this.getQuery();
        let data = await this.callGithubApi(query);
        while(this.paginate(data)){
            const nextQuery = this.getNextQuery(data);
            const nextData = await this.callGithubApi(nextQuery);
            this.aggregateData(data, nextData);
        }
        return this.parseData(data);
    }

    protected async callGithubApi(query: string){
        const {repository} = await graphql<{ repository: Repository }>(query,
            {
                headers: {
                    authorization: this.token,
                },
            });
        return repository;
    }
}

