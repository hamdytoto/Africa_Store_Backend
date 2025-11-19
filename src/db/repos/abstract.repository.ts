import { FilterQuery, Model } from "mongoose";
export interface IPaginate {
    page?: number,
    limit?: number
}

export type finderOneArg<TDocument> = {
    filter?: FilterQuery<TDocument>,
    populate?: any,
    select?: string,
    projection?: any
}
export type findersArgs<TDocument> =
    finderOneArg<TDocument> & {
        paginate?: IPaginate,
        sort?: any
    }
export type UpdateArgs<TDocument> = {
    filter?: FilterQuery<TDocument>,
    update?: any,
    populate?: any,
    select?: string
}




export abstract class AbstractRepository<TDocument> {
    protected constructor(protected readonly model: Model<TDocument>) { }
    async findAll({ filter = {}, populate, select, paginate, sort, projection }: findersArgs<TDocument>): Promise<TDocument[] | any> {
        let query = this.model.find(filter)
        if (select) query = query.select(select)
        if (populate) query = query.populate(populate)
        if (sort) query = query.sort(sort)
        if (projection) query = query.select(projection)
        const page = paginate?.page ? paginate.page : 1;
        const limit = paginate?.limit || 10;
        const skip = (page - 1) * limit;
        const totalSize = await query.model.countDocuments(query.getQuery());
        const data = await query.skip(skip).limit(limit).exec();
        return {
            data,
            pagination: {
                totalSize,
                totalPages: Math.ceil(totalSize / limit),
                pageNumber: page,
                pageSize: data.length,
            },

        }
    }
    async findOne({ filter = {}, populate, select, projection }: finderOneArg<TDocument>): Promise<TDocument | null> {
        let query = this.model.findOne(filter)
        if (select) query = query.select(select)
        if (populate) query = query.populate(populate)
        if (projection) query = query.select(projection)

        return query.exec();
    }

    async create(document: Partial<TDocument>): Promise<TDocument> {
        const doc = await this.model.create(document);
        return doc;
    }

    async update({
        filter,
        update,
        populate,
        select
    }: UpdateArgs<TDocument>): Promise<TDocument | null> {
        let query = this.model.findOneAndUpdate(filter, update, { new: true, runValidators: true })
        if (select) query = query.select(select)
        if (populate) query = query.populate(populate)
        return query.exec();
    }

    async delete(
        filter: FilterQuery<TDocument>,
    ): Promise<TDocument | null> {
        let query = this.model.findOneAndDelete(filter)
        return query.exec();
    }
    async deleteMany(
        filter: FilterQuery<TDocument>,
    ): Promise<{ deletedCount: number; deletedDocs: any[] }> {
        const docs = await this.model.find(filter); // Lean objects
        const result = await this.model.deleteMany(filter);
        return {
            deletedCount: result.deletedCount ?? 0,
            deletedDocs: docs,
        };
    }

    async findOneAndUpdate({
        filter,
        update,
        populate,
        select
    }: UpdateArgs<TDocument>): Promise<TDocument | null> {
        let query = this.model.findOneAndUpdate(filter, update, { new: true, runValidators: true })
        if (select) query = query.select(select)
        if (populate) query = query.populate(populate)
        return query.exec();
    }
    async findOneAndDelete({
        filter = {},
        populate,
        select,
    }: finderOneArg<TDocument>): Promise<TDocument | null> {
        let query = this.model.findOneAndDelete(filter);
        if (select) query = query.select(select);
        if (populate) query = query.populate(populate);
        return query.exec();
    }

}