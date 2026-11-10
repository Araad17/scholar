import mysql from "mysql2/promise";

export const pool = mysql.createPool({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT || 4000),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,

	ssl: {
		minVersion: "TLSv1.2",
		ca: process.env.DB_CA_CERT?.replace(/\\n/g, "\n"),
	},

	charset: "utf8mb4",
	timezone: "Z",
	decimalNumbers: true,
	dateStrings: ["DATE"],

	typeCast: (field, next) =>
		field.type === "TINY" && field.length === 1
			? field.string() === "1"
			: next(),
});

pool.pool.on("connection", (c) => {
	c.query("SET time_zone = '+00:00'");
});
