import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import User from "../models/user.model";

export const protect = async (req: any, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded: any = jwt.verify(token, ENV.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized" });
    }
  }
  res.status(401).json({ message: "No token provided" });
};
