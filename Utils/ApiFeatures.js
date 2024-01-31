// const Movie = require("./../Models/movieModel");

class ApiFeatures {
  constructor(query, queryStr, count) {
    (this.query = query), (this.queryStr = queryStr);
    this.count = count;
  }

  sortUrl() {
    let exclusion = ["sort", "page", "limit", "fields"];
    let stringQuery = { ...this.queryStr };
    exclusion.forEach((el) => {
      delete stringQuery[el];
    });

    const strQuery = JSON.stringify(stringQuery);
    const stringQueryObj = JSON.parse(
      strQuery.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    );

    this.query = this.query.find(stringQueryObj);
    return this;
  }

  sortResultSet() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query.sort(sortBy);
    } else {
      this.query.sort("-createdAt");
    }
    return this;
  }

  limitByFileds() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query.select(fields);
    } else {
      // this.query.select("-__v"); //to exclude __v default mongodb fieldcls
    }

    return this;
  }

  paginate() {
    if (this.queryStr.page || this.queryStr.limit) {
      let page = this.queryStr.page * 1 || 1;
      let limit = this.queryStr.limit * 1 || 10;

      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);

      if (skip >= this.count) {
        throw new Error("The page is not found");
      }
    }
    return this;
  }
}

module.exports = ApiFeatures;
