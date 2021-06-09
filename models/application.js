"use strict";

const { application } = require("express");
const db = require("../db");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");


/** Related functions for applications. */

class Application {

    /** get all the applications in the DB
     * returns [{username: [jobId, ...], ...}]
     **/

    static async getAll() {
        const result = await db.query(
            `SELECT username, job_id AS "jobId"
            FROM applications
            ORDER BY username`,
        );
        const applications = result.rows.reduce((apps, nextApp) => {
            if(apps[nextApp.username])
                apps[nextApp.username].push(nextApp.jobId);
            else apps[nextApp.username] = [nextApp.jobId];
            return apps;
        },{});
        return applications;
    }

    /** creates an application in the DB based on the inputted object
     * returns undefined, or throws error on failiure
     **/

    static async create({ username, jobId }) {
        try {
            await db.query(
                `INSERT INTO applications(username, job_id)
                VALUES($1, $2)`,
                [username, jobId],
                );
        } catch(e) {
            if (e.code === '23505') {
                throw new BadRequestError(`application already exists`);
            } else if (e.code === '23503') {
                throw new BadRequestError(`JobId or username does not exist`);
            }
            throw e;
        }
    }

}
module.exports = Application;