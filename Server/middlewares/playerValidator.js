import { body, validationResult } from "express-validator";
import Player from "../models/player.js";

export const validatePlayer = [
    body("name").notEmpty().isString(),
    body("lastName").notEmpty().isString(),
    body("email")
        .notEmpty()
        .isEmail()
        .isString()
        .withMessage("Debe introducir un email válido")
        
        .custom(async(email)=>{
            const exists = await Player.findOne({email})
            if (exists){
                throw new Error ("This email is already in use")
            }
            return true
        }),
    body("age").isInt({min: 10, max: 79}),
    body("gender").isIn(["F", "M"]),
    body("contactNumber").matches(/^[0-9+\-\s()]{6,20}$/),
    body("utrLevel").isFloat({ min: 1.0, max: 16.5 }),

(req, res, next) => {
    const errors  = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    next();
},
]

export const validateLogin = [
  body("email")
    .notEmpty()
    .isEmail()
    .withMessage("Debe introducir un email con formato válido"),
 

  body("password")
    .notEmpty()
    .withMessage("Debe introducir un password"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg
      });
    }

    next();
  }
];
