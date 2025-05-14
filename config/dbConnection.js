import mysql2 from "mysql2/promise";

const db = mysql2.createPool({
  host: "localhost",
  user: "root",
  password: "neh59",
  database: "uber_new",
});

const connection = db.getConnection();
connection.then((con) => {
  console.log("connected");
  con.release();
});

export default db;
