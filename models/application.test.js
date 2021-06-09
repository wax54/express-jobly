"use strict";
const { application } = require("express");
const db = require("../db");
const { BadRequestError } = require("../expressError");
const Application = require("./application");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    jobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GetAll */
describe("getAll", function () {
    let application1;
    let application2;
    beforeEach(async () => {
        application1 = { username: 'u1', jobId: jobIds[0] };
        application2 = { username: 'u1', jobId: jobIds[1] };

        await db.query(`INSERT INTO applications(username, job_id)
            VALUES($1, $2),($3, $4)`,
            [application1.username,
            application1.jobId,
            application2.username,
            application2.jobId]);
    });
    test("works: gets all apps", async ()=>{
        const applications = await Application.getAll();
        expect(applications).toEqual({u1:[application1.jobId, application2.jobId]});
    });
    test("Empty object if no apps in DB", async () => {
        await db.query(`DELETE FROM applications`)
        const applications = await Application.getAll();
        expect(applications).toEqual({});
    });
});


/************************************** create */

describe("create", function () {

    let testApplication
    beforeEach(()=>{
        testApplication = { username: 'u1', jobId: jobIds[0] };
    });

    test("works", async function () {

        let apps = await db.query(`SELECT username, job_id FROM applications`);
        expect(apps.rows.length).toBe(0);

        await Application.create(testApplication);

        apps = await db.query(`SELECT username, job_id AS "jobId"
                FROM applications 
                WHERE username=$1 AND job_id=$2`, [testApplication.username, testApplication.jobId]);
        expect(apps.rows.length).toBe(1);
        expect(apps.rows[0]).toEqual(testApplication)
    });

    test("bad request with dupe", async function () {
        try{
            await Application.create(testApplication);
            //second application
            await Application.create(testApplication);
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
    test("bad request with nonexistent jobid", async function () {
        try {
            await Application.create({ ...testApplication, jobId: 0 });
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
    test("bad request with nonexistent username", async function () {
        try {
            await Application.create({ ...testApplication, username: 'trash' });
            fail();
        } catch (err) {

            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

