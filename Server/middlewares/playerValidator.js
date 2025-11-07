import { body, validationResult } from "express-validator";

export const validatePlayer = [
    body("name").notEmpty().isString(),
    body("lastName").notEmpty().isString(),
    body("email").notEmpty().isEmail().isString(),
    body("age").isInt({min: 10, max: 79}),
    body("gender").isIn(["F", "M"]),
    body("contactNumber").matches(/^[0-9+\-\s()]{6,20}$/),
    body("utrLevel").isFloat({ min: 1.0, max: 16.5 }),

(res, req, next) => {
    const errors  = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    next();
},
]