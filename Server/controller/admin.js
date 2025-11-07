import Admin from "../models/admin.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";


const generateToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '30d'})
}


//registro admin
export const adminRegister = async(req, res) =>{

    try{
        const {name, lastName, email, password} = req.body;

        const adminExists = await Admin.findOne({email});
        if (adminExists) return res.status(400).json({message: 'Este administrador ya existe'});

        const admin = new Admin({name, lastName, email, password});

        await admin.save();

        res.status(201).json({
            _id: admin._id,
            name: admin.name,
            lastName: admin.lastName,
            email: admin.email,
            token: generateToken(admin._id)
        })

    } catch(error){
        console.error(error)
        res.status(500).json({error: 'Error de registro de administrador'})
    }
}

export const adminLogin = async(req, res) =>{

    try {
        const {email, password} = req.body;

        const admin = await Admin.findOne({email})

        const passwordValid = await bcrypt.compare(password, admin.password)

        if(!passwordValid) return res.status(401).json({error: 'Password is not correct'})

        //create token
        const token = jwt.sign(
            {id: admin._id, isAdmin: true},
            process.env.JWT_SECRET,
            {expiresIn: '1d'}
        )

        res.status(201).json({
            message: 'Login successfull',
            token, 
            admin: {id: admin._id, name: admin.name, email: admin.email}
        })

   
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Issue with login'})
    }
}