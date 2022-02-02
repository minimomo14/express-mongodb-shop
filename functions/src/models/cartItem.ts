import { ObjectId } from "mongodb";

export default interface cartItem {
    _id?: ObjectId;
    product: string;
    price: number;
    quantity: number;
}

