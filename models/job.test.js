"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

const newJob = {
  title: "New",
  salary: 4000,
  equity: '0',
  companyHandle: 'c1'
};


/************************************** create */

describe("create", function () {

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({id: expect.any(Number) ,...newJob});

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle 
           FROM jobs
           WHERE id = ${job.id}`);
    expect(result.rows).toEqual([
      {
        id: job.id,
        title: "New",
        salary: 4000,
        equity: "0",
        company_handle: 'c1'},
    ]);
  });

});


// /************************************** search */

// describe("search", function () {
//   test("works: filters by name", async function () {
//     let companies = await Job.search({
//                                 name: {
//                                   like: 'c1'
//                                 }
//                               });
//     expect(companies).toEqual([
//       {
//         id: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     ]);
//   });

//   test("works: filters by partial name", async function () {
//     let companies = await Job.search({
//       name: {
//         like: 'c'
//       }
//     });
//     expect(companies).toEqual([
//       {
//         id: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//       {
//         id: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       },
//       {
//         id: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 3,
//         logoUrl: "http://c3.img",
//       },
//     ]);
//   });

//   test("works: filters by employee min inclusively", async function () {
//     let companies = await Job.search({
//       numEmployees: {
//         min: 1
//       }
//     });
//     expect(companies).toEqual([
//       {
//         id: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//       {
//         id: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       },
//       {
//         id: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 3,
//         logoUrl: "http://c3.img",
//       },
//     ]);
//   });
//   test("works: filters by employee max inclusively", async function () {
//     let companies = await Job.search({
//       numEmployees: {
//         max: 1
//       }
//     });
//     expect(companies).toEqual([
//       {
//         id: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     ]);
//   });

//   test("works: filters by all at once", async function () {
//     let companies = await Job.search({
//       numEmployees: {
//         min: 1,
//         max: 1
//       },
//       name:{ like: 'c2'}
//     });
//     expect(companies).toEqual([
//     ]);
//   });
// });


/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "job1",
        salary: 1000,
        equity: "1.0",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "job2",
        salary: 2000,
        equity: "0.5",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "job3",
        salary: 3000,
        equity: "0",
        companyHandle: "c3",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let newJobId = (await Job.create(newJob)).id;
    let job = await Job.get(newJobId);
    expect(job).toEqual({
      id: newJobId,...newJob
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {

      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  let newJobId;
  const updateData = {
    title: "Updated"
  };
  beforeEach( async function() {
    newJobId = (await Job.create(newJob)).id;
  });

  test("works", async function () {
    let job = await Job.update(newJobId, updateData);
    expect(job).toEqual({
      id: newJobId,
      ...newJob,
      ...updateData,
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${newJobId}`);

    expect(result.rows).toEqual([{
      id: newJobId,
      ...newJob,
      ...updateData,
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "updated",
      salary: null,
    };

    let job = await Job.update(newJobId, updateDataSetNulls);
    expect(job).toEqual({
      id: newJobId,
      ...newJob,
      ...updateDataSetNulls,
    });


    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${newJobId}`);

    expect(result.rows).toEqual([{
      id: newJobId,
      ...newJob,
      ...updateDataSetNulls,
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(newJobId, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {

  test("works", async function () {
    const newJobId = (await Job.create(newJob)).id;
    await Job.remove(newJobId);
    
    const res = await db.query(
        `SELECT id FROM jobs WHERE id=${newJobId}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
