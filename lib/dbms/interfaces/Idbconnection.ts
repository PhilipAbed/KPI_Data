export interface Idbconnection {
    connectToDB();

    close();

    exec(query: string);
}