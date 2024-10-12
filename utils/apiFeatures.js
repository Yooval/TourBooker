class APIFeatures {
    constructor(query, queryString) {
        this.query = query; // outcome will be returned here
        this.queryString = queryString; // the request is specify here. which tour we want?
    }

    filter() {
        const queryObj = { ...this.queryString }; //querObj is a hard copy of the req.qurey object. hard copy meaning that if we to stud in one it doesnt affect other.
        const excludedFields = ['page', 'sort', 'limit', 'fields']; //we need to remove all those fields from our query object. we will implement the values of those fields seperately
        excludedFields.forEach(el => delete queryObj[el]);//now removing all existing from 'page', 'sort', 'limit', 'fields'
        //console.log(req.query, queryObj);// so we can specify objects in postmanwhen we use get all tours.
        // this console.log(req.query, queryObj) gives: { difficulty: 'easy', page: '2', sort: '1', limit: '10' } { difficulty: 'easy' }.important. now we can use in line below qureyobj

        //1B. ADVANCED FILTERING
        let queryStr = JSON.stringify(queryObj); // it's let becaus ewe changing it
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // editing to be the correct queryset meaning with gte|gt|lte|lt
        //{ difficulty: 'easy', duration: { $gte: '5/' } }
        //{ difficulty: 'easy', duration: { gte: '5/' } }
        this.query = this.query.find(JSON.parse(queryStr)); // now this query has the new find method on it and it's store on this.query meaning the final outcome is here.
        //let query = Tour.find(JSON.parse(queryStr)); // Tour.find() means return all tours. returns array
        //const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
        return this;// return so ew could chain
    }

    sort() {
        if (this.queryString.sort) { //if there is a sort propery. if a sort requset exist. query hold all parts of the request.
            const sortBy = this.queryString.sort.split(',').join(' '); // split all what you sort by you can have few for inner sort
            this.query = this.query.sort(sortBy);
        } else { // if there is no sorting we decide default wat to shot data
            this.query = this.query.sort('-createdAt'); // oldest first newst last
        }
        return this;
    }
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');//dont iclude what's inside
        }
        return this;
    }
    paginate() {
        const page = this.queryString.page * 1 || 1; // *1 to be int. igf not givven default 1
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = APIFeatures