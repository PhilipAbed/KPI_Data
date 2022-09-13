import {GithubData} from "../../data-collection/types";

export interface IGithubDB {
    insertRows(data: GithubData[]);

    updateRows(data: GithubData[], table: any)

    updateRow(id: number, data: GithubData);

    convertToObj(data: GithubData): any;

    update(data: GithubData[]);

    extractTableToObj(): Promise<GithubData[]>;

    convertToArr(data: GithubData): any;
}