"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  jobs,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "New", 
    salary: 4000, 
    equity: 0,
    companyHandle: 'c1',
  };

  test("works for admin user", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {...newJob, equity: '0', id: expect.any(Number)},
    });
  });

  test("throw 401 error for non admin users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("throw 401 error for anon", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob);

    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "new",
          equity: 0,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          ...newJob,
          salary: "not-a-number",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: jobs,
    });
  });

  // test("nameLike param filters results to jobs with a name that has the passed string anywhere in it", async function () {
  //   let resp = await request(app).get("/jobs").query({nameLike:'c1'});
  //   expect(resp.body).toEqual({
  //     jobs:
  //       [
  //         {
  //           handle: "c1",
  //           name: "C1",
  //           description: "Desc1",
  //           numEmployees: 1,
  //           logoUrl: "http://c1.img",
  //         }
  //       ],
  //   });

  //   resp = await request(app).get("/jobs").query({ nameLike: 'c' });
  //   expect(resp.body).toEqual({
  //     jobs:
  //       [
  //         {
  //           handle: "c1",
  //           name: "C1",
  //           description: "Desc1",
  //           numEmployees: 1,
  //           logoUrl: "http://c1.img",
  //         },
  //         {
  //           handle: "c2",
  //           name: "C2",
  //           description: "Desc2",
  //           numEmployees: 2,
  //           logoUrl: "http://c2.img",
  //         },
  //         {
  //           handle: "c3",
  //           name: "C3",
  //           description: "Desc3",
  //           numEmployees: 3,
  //           logoUrl: "http://c3.img",
  //         },
  //       ],
  //   });

  // });

  // test("minEmployee/maxEmployee param filters results", async function () {
  //   let resp = await request(app).get("/jobs").query({ minEmployees: 2 });
  //   expect(resp.body).toEqual({
  //     jobs:
  //       [
  //         {
  //           handle: "c2",
  //           name: "C2",
  //           description: "Desc2",
  //           numEmployees: 2,
  //           logoUrl: "http://c2.img",
  //         },
  //         {
  //           handle: "c3",
  //           name: "C3",
  //           description: "Desc3",
  //           numEmployees: 3,
  //           logoUrl: "http://c3.img",
  //         },
  //       ],
  //   });

  //   resp = await request(app).get("/jobs").query({ maxEmployees: 2 });
  //   expect(resp.body).toEqual({
  //     jobs:
  //       [
  //         {
  //           handle: "c1",
  //           name: "C1",
  //           description: "Desc1",
  //           numEmployees: 1,
  //           logoUrl: "http://c1.img",
  //         },
  //         {
  //           handle: "c2",
  //           name: "C2",
  //           description: "Desc2",
  //           numEmployees: 2,
  //           logoUrl: "http://c2.img",
  //         }
  //       ],
  //   });


  //   resp = await request(app).get("/jobs").query({ minEmployees: 2, maxEmployees: 2 });
  //   expect(resp.body).toEqual({
  //     jobs:
  //       [
  //         {
  //           handle: "c2",
  //           name: "C2",
  //           description: "Desc2",
  //           numEmployees: 2,
  //           logoUrl: "http://c2.img",
  //         }
  //       ],
  //   });
  // });


  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:handle */

describe("GET /jobs/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${jobs[0].id}`);
    expect(resp.body).toEqual({
      job: jobs[0],
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin user", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobs[0].id}`)
        .send({
          title: "Brand New",
          salary: 8000,
          equity: 0.8,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {...jobs[0], title: "Brand New", salary: 8000, equity: '0.8'},
    });
  });

  test("works with partial update", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobs[0].id}`)
      .send({
        title: "Brand New",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: { ...jobs[0], title: "Brand New" },
    });
  });
  
  test("unauth non admin users", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobs[0].id}`)
      .send({
        title: "Brand New",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobs[0].id}`)
      .send({
        title: "Brand New",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          title: "new nope",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobs[0].id}`)
        .send({
          id: 10001,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobs[0].id}`)
        .send({
          salary: "not-a-number",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin users", async function () {
    const resp = await request(app)
        .delete(`/jobs/${jobs[0].id}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: `${jobs[0].id}` });
  });

  test("unauth for default user", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobs[0].id}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
  test("unauth for anon", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobs[0].id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
