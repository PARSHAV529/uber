import mysql2 from "mysql2/promise";

const db = mysql2.createPool({
  host: "192.168.22.121",
  user: "parshav",
  password: "Parshav@529",
  database: "uber",
});

const connection = db.getConnection();
connection.then((con) => {
  console.log("connected");
  con.release();
});

export default db;
