import type {GithubData} from "../../data-collection/types";

export interface IGithubDB {
    insertRows(data: GithubData[]): void;

    updateRows(data: GithubData[], table: any): void;

    updateRow(id: number, data: GithubData): void;

    convertToObj(data: GithubData): any;

    update(data: GithubData[]): void;

    extractTableToObj(): Promise<GithubData[]>;

    convertToArr(data: GithubData): any;
}