const { BadRequestError } = require("../expressError");

const isObject = (variable) => typeof variable === 'object' && variable !== null

/** Helper Function: Creates the updating part of SQL using a JS Object
 * sqlForPartialUpdate({'firstName':"leo", age: 6}, {firstName: "first_name"})
 * would return {setCols: '"first_name"=$1, "age"=$2', values: ["leo", 6]}
 * 
 * Throws error if input empty 
 *
 * @param { Object } dataToUpdate an object with the data to be updated ex. {"propertyName" : "updated value"}
 * @param { Object } jsToSql an optional object that can be supplied to translate the js 
 *       property name into the actual column name in the DB ex.{"PropertyName" : "property_name"}
 *
 * @returns { setCols: String, values: Array} the setCols property is a SQL string that sets the specified columns to new values,
 *              the values property is the array of values that should be passed to pg with the given command
 * 
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql={}) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/** Helper Function: Creates the updating part of SQL using a JS Object
 * sqlForPartialUpdate({'firstName':"leo", age: 6}, {firstName: "first_name"})
 * would return {setCols: '"first_name"=$1, "age"=$2', values: ["leo", 6]}
 * 
 * Throws error if input empty 
 *
 * @param { Object } criteria an object containing the search criteria ex. {"propertyName" : "search value"}
 * @param { Object } jsToSql an optional object that can be supplied to translate the js 
 *       property name into the actual column name in the DB ex.{"PropertyName" : "property_name"}
 *
 * @returns { whereClause: String, values: Array} the whereClause property is a SQL string that filters the query by the inputted object,
 *              the values property is the array of values that should be passed to pg with the given command
 * 
 */
function sqlForSearch(criteria, jsToSql = {}) {
  if (Object.keys(criteria).length === 0) throw new BadRequestError("No data");

  let idx = 1;
  const queries = [];
  const values = [];

  // {firstName: 'Aliya', age:{min: 12} => ['"first_name"=$1', '"age">$2']
  //for every prop on the object...
  for(colName in criteria) {
    const value = criteria[colName];
    //check if it exists
    if (value !== undefined) {
      //if it's an object it will have a special comparer
      if(isObject(value)) {
        if(value.min !== undefined) {
          queries.push(`"${jsToSql[colName] || colName}">=$${idx}`);
          values.push(value.min);
          idx++;
        }else if (value.minExclusive !== undefined) {
          queries.push(`"${jsToSql[colName] || colName}">$${idx}`);
          values.push(value.minExclusive);
          idx++;
        }
        if (value.max !== undefined) {
          if (value.min > value.max || value.minExclusive >= value.max) throw new BadRequestError(`${colName} min cannot be greater than max`);
          queries.push(`"${jsToSql[colName] || colName}"<=$${idx}`);
          values.push(value.max);
          idx++;
        }
        if (value.maxExclusive !== undefined) {
          if (value.min >= value.maxExclusive || value.minExclusive >= value.maxExclusive) throw new BadRequestError(`${colName} min cannot be greater than max`);
          queries.push(`"${jsToSql[colName] || colName}"<$${idx}`);
          values.push(value.maxExclusive);
          idx++;
        }
        if (value.like !== undefined) {
          queries.push(`"${jsToSql[colName] || colName}" ILIKE $${idx}`);
          value.like = `%${value.like}%`;
          values.push(value.like);
          idx++;
        }
      } else {
        queries.push(`"${jsToSql[colName] || colName}"=$${idx}`);
        values.push(value);
        idx++;
      }
    }
  }

  return {
    whereClause: queries.join(" AND "),
    values: Object.values(values),
  };
}

module.exports = { sqlForPartialUpdate, sqlForSearch };
