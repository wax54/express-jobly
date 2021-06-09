"use strict";
const {
    ExpressError,
    NotFoundError,
    UnauthorizedError,
    BadRequestError,
    ForbiddenError,
} = require('./expressError');

describe("errors", function () {
    test("ExpressError", function () {
        const e = new ExpressError('message', 999);
        expect(e.message).toEqual('message');
        expect(e.status).toBe(999);
        expect(e instanceof Error).toBeTruthy();
    });

    test("NotFoundError", function () {
       let e = new NotFoundError();
        expect(e.message).toEqual("Not Found");
        expect(e.status).toBe(404);

        e = new NotFoundError('message', 999);
        expect(e.message).toEqual('message');
        //note status will always be 404
        expect(e.status).toBe(404);

        expect(e instanceof ExpressError).toBeTruthy();
    });

    test("UnauthorizedError", function () {
        let e = new UnauthorizedError();
        expect(e.message).toEqual("Unauthorized");
        expect(e.status).toBe(401);

        e = new UnauthorizedError('message', 999);
        expect(e.message).toEqual('message');
        //note status will always be 401
        expect(e.status).toBe(401);

        expect(e instanceof ExpressError).toBeTruthy();
    });

    test("BadRequestError", function () {
        let e = new BadRequestError();
        expect(e.message).toEqual("Bad Request");
        expect(e.status).toBe(400);

        e = new BadRequestError('message', 999);
        expect(e.message).toEqual('message');
        //note status will always be 400
        expect(e.status).toBe(400);

        expect(e instanceof ExpressError).toBeTruthy();
    });

    test("ForbiddenError", function () {
        let e = new ForbiddenError();
        expect(e.message).toEqual("Forbidden");
        expect(e.status).toBe(403);

        e = new ForbiddenError('message', 999);
        expect(e.message).toEqual('message');
        //note status will always be 403
        expect(e.status).toBe(403);

        expect(e instanceof ExpressError).toBeTruthy();
    });

});