
export async function connectToDB() {
    const mysql = require('mysql');
    const connection = await mysql.createConnection({
        host: process.env.RENOVATE_KPI_HOST,
        user: process.env.RENOVATE_KPI_HOST_USER,
        password: process.env.RENOVATE_KPI_PASSWORD,
        database: 'sql8511743',
        port: 3306
    });

    await connection.connect(function (err) {
        if (err) throw err;
        console.log("Connected to DB!");
    });
    return connection;
}
