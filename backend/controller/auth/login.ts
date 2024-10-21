import { Request, Response } from "express";

const login = (req: Request, res: Response) => {
  console.log("Radi");
  res.status(200).send("Login radi!");
};

export default login;
