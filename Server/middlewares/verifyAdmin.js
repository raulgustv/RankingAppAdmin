import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";

export const verifyAdmin = async(req, res, next) =>{
    const token = req.header("Authorization")?.split(" ")[1]

    if(!token) return res.status(401).json({error: 'Not authorized, no token provided'})

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded || !decoded.isAdmin){
            return res.status(401).json({error: 'Not authorized, admin required'})
        }
        
       const admin = await Admin.findById(decoded.id).select("-password") 

       if(!admin){
        return res.status(404).json({error: "Admin not found"})
       }else{
        req.admin = admin
       }

        next();

    } catch (error) {
        if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    console.error("Unexpected error verifying admin:", error);
    res.status(500).json({ error: "Internal error verifying admin" });
    }
}


export const verifyPlayer = async(req, res, next) =>{
  const token = req.header("Authorization")?.split(" ")[1]

  if(!token) return res.status(401).json({error: 'Not authorized, no token provided'})

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;      
      next()
  } catch (error) {
    console.log(error)
    res.status(500).json({error: 'Internal server error verifying player'})
  }
}