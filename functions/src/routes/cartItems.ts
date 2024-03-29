import express from "express";
import { ObjectId } from "mongodb";
import { getClient } from "../db";
import cartItem from "../models/cartItem";

const cartRoutes = express.Router();

//query string maxPrice, product, pageSize
cartRoutes.get("/cart-items", async (req, res) => {
  try {
    const maxPrice: number = Number(req.query.maxPrice as string);
    const product: string = req.query.product as string;
    const pageSize: number = Number(req.query.pageSize as string) || 0;
    if (maxPrice) {
      const client = await getClient();
      const results = await client.db().collection<cartItem>("cartItems").find({ price: { $lte: maxPrice } }).toArray();
      console.log(results);
      res.status(200).json(results);
    } else if (product) {
      const client = await getClient();
      const results = await client.db().collection<cartItem>("cartItems").find({ product: product }).toArray();
      console.log(results);
      res.status(200).json(results);
    } else if (pageSize) {
      const client = await getClient();
      const results = await client.db().collection<cartItem>("cartItems").find().limit(pageSize).toArray();
      console.log(results);
      res.status(200).json(results);
    } else {
      const client = await getClient();
      const results = await client.db().collection<cartItem>("cartItems").find().toArray();
      console.log(results);
      res.status(200).json(results);
    }
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

//GET by id
cartRoutes.get("/cart-items/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const client = await getClient();
    const results = await client
      .db()
      .collection<cartItem>("cartItems")
      .findOne({ _id: new ObjectId(id) });
    if (results) {
      res.status(200).json(results);
    } else {
      res.status(404).json({ message: "ID Not Found" });
    }
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//POST
cartRoutes.post("/cart-items", async (req, res) => {
  const cart = req.body as cartItem;
  try {
    const client = await getClient();
    await client.db().collection<cartItem>("cartItems").insertOne(cart);
    //CREATED
    res.status(201).json(cart);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//PUT
cartRoutes.put("/cart-items/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body as cartItem;
  delete data._id; //remove _id from body so we only have one.
  try {
    const client = await getClient();
    const results = await client
      .db()
      .collection<cartItem>("cartItems")
      .replaceOne({ _id: new ObjectId(id) }, data);
    if (results.modifiedCount === 0) {
      res.status(400).json({ message: "ID Not Found" });
    } else {
      data._id = new ObjectId(id);
      res.json(data);
    }
  } catch (err) {
    console.log("Error ", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//DELETE BY ID
cartRoutes.delete("/cart-items/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const client = await getClient();
    const results = await client
      .db()
      .collection<cartItem>("cartItems")
      .deleteOne({ _id: new ObjectId(id) });
    if (results.deletedCount === 0) {
      res.status(404).json({ message: "Not Found" });
    } else {
      res.status(204).end();
    }
  } catch (err) {
    console.log("Error ", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default cartRoutes;
