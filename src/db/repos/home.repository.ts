import { Injectable } from "@nestjs/common";
import { HomeDocument, HomeModelName } from "../models/home.model";
import { AbstractRepository } from "./abstract.repository";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
@Injectable()
export class HomeRepository extends AbstractRepository<HomeDocument> {
    constructor(@InjectModel(HomeModelName) home: Model<HomeDocument>) {
        super(home)
    }
}