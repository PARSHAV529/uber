import mysql2 from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const db = mysql2.createPool({
  host: process.env.HOST,
  user: 'parshav',
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
});

const connection = db.getConnection();
connection.then((con) => {
  console.log("connected");
  con.release();
});

export default db;
