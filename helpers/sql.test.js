const { sqlForPartialUpdate, sqlForSearch } = require("./sql");
const { BadRequestError } = require('../expressError');

describe("sqlForPartialUpdate", function () {
    test("works: with single value", function () {
        const result = sqlForPartialUpdate({ firstName: "leo"})
        expect(result).toEqual({ 
            setCols: '"firstName"=$1', 
            values: ["leo"] });
    });

    test("works: with multiple values", function () {
        const result = sqlForPartialUpdate({ firstName: "leo", age: 6 })
        expect(result).toEqual({
            setCols: '"firstName"=$1, "age"=$2',
            values: ["leo", 6]
        });
    });

    test("works: when using second arg", function () {
        const result = sqlForPartialUpdate({ firstName: "leo"}, { firstName: "first_name" })
        expect(result).toEqual({
            setCols: '"first_name"=$1',
            values: ["leo"]
        });
    });
    test("errors: when first arg is empty", function () {
        expect(() => {
            sqlForPartialUpdate({})
        }).toThrow(BadRequestError)
    });
});



describe("sqlForSearch", function () {
    test("works: multiple search criteria", function () {
        let result = sqlForSearch({ name: { like: 'ham' }, age: {min: 5, max: 6}, quilts: 0 })
        expect(result).toEqual({
            whereClause: '"name" ILIKE $1 AND "age">=$2 AND "age"<=$3 AND "quilts"=$4',
            values: ['%ham%', 5, 6, 0]
        });
    });
    test("works: single value to search for exact match", function () {
        const result = sqlForSearch({ name: "leo" })
        expect(result).toEqual({
            whereClause: '"name"=$1',
            values: ["leo"]
        });
    });

    test("works: with multiple values", function () {
        const result = sqlForSearch({ firstName: "leo", age: 6 })
        expect(result).toEqual({
            whereClause: '"firstName"=$1 AND "age"=$2',
            values: ["leo", 6]
        });
    });

    test("works: min and max functionality", function () {
        let result = sqlForSearch({ age: {min: 6} })
        expect(result).toEqual({
            whereClause: '"age">=$1',
            values: [6]
        });

        result = sqlForSearch({ age: { max: 6 } })
        expect(result).toEqual({
            whereClause: '"age"<=$1',
            values: [6]
        });
        //both together
        result = sqlForSearch({ age: { max: 6 , min: 1} })
        expect(result).toEqual({
            whereClause: '"age">=$1 AND "age"<=$2',
            values: [1, 6]
        });

    });

    test("works: minExclusive and maxExclusive functionality", function () {
        let result = sqlForSearch({ age: { minExclusive: 6 } })
        expect(result).toEqual({
            whereClause: '"age">$1',
            values: [6]
        });

        result = sqlForSearch({ age: { maxExclusive: 6 } })
        expect(result).toEqual({
            whereClause: '"age"<$1',
            values: [6]
        });
        //both together
        result = sqlForSearch({ age: { maxExclusive: 6, minExclusive: 1 } })
        expect(result).toEqual({
            whereClause: '"age">$1 AND "age"<$2',
            values: [1, 6]
        });

    });

    test("works: like functionality", function () {
        let result = sqlForSearch({ name: { like: 'h' } })
        expect(result).toEqual({
            whereClause: '"name" ILIKE $1',
            values: ['%h%']
        });
    });

    test("works: skips undefined criteria", function () {
        let result = sqlForSearch({ name: { like: undefined }, age: { min: undefined, max: undefined }, quilts: undefined })
        expect(result).toEqual({
            whereClause: '',
            values: []
        });
    });
    test("errors: when first arg is empty", function () {
        expect(() => {
            sqlForSearch({})
        }).toThrow(BadRequestError)
    });
    test("errors: when any min is greater than any max", function () {
        expect(() => {
            sqlForSearch({age: {min:10, max: 5}})
        }).toThrow(BadRequestError)
        
        expect(() => {
            sqlForSearch({ age: { minExclusive: 10, maxExclusive: 10 } })
        }).toThrow(BadRequestError)

        expect(() => {
            sqlForSearch({ age: { min: 10, maxExclusive: 10 } })
        }).toThrow(BadRequestError)

        expect(() => {
            sqlForSearch({ age: { minExclusive: 10, max: 10 } })
        }).toThrow(BadRequestError)

        expect(sqlForSearch({ age: { min: 10, max: 10 } })).toEqual({
            whereClause: '"age">=$1 AND "age"<=$2',
            values: [10,10]
        });
    });
});
