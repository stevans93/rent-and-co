import { Response, Request } from "express";
import User from "../../models/user";
import { hashPassword } from "../../utils/bcrypt";

const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("body " + req.body);

  let user = await User.findOne({ email });

  if (user) {
    return res.status(400).json({ message: "Korisnik već postoji!" });
  }

  const hashedPassword = await hashPassword(password);

  user = new User({
    email,
    password: hashedPassword,
  });

  await user.save();

  return res.status(201).json({ message: "Korisnik uspešno registrovan!" });
};

export default register;
