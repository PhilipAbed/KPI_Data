import {GithubData} from "../../data-collection/types";


export interface IgithubDB {
    update();
    selectTable(): any;
    insertRows(data: GithubData[]);
    updateRows(data: GithubData[], table: any)
    updateRow(id: number, data: GithubData);
    convertToArr(data: GithubData) : any;
    convertToObj(data: GithubData) : any ;
}