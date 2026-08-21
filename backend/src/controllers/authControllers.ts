import  type {Request, Response} from "express"
import bcrypt from "bcrypt"
import pool  from "../config/Database.js"
import jwt from "jsonwebtoken"

export const register =async(req: Request,res: Response)=>{
        try{
            const{name, email, password, role}=req.body
            if(!name || !email || !password  || !role){
                return res.status(400).json({
                    message:"All fields are required",
})          
  }
  if(role!=="admin" && role!== "user"){
    return res.status(400).json({
        message: "Invalid role",
    })
  }
  const [existingUsers]=await pool.query(
    "SELECT id FROM users WHERE email= ?",
    [email]
  )
  if((existingUsers as any[]).length >0){
    return res.status(409).json({
        message:"Email already exists",
})  
}
const hashedPassword = await bcrypt.hash(password, 10)

await pool.query(
    "INSERT INTO users(name, email, password, role)VALUES(?,?,?,?)",
    [name,email,hashedPassword,role]
)
res.status(201).json({
    message:"User resgistered successfully",
})        
}catch(error){
    console.error("Resigtration error :",error)
    res.status(500).json({
        message:"Server error",
    })
}

    }
 export const login=async(req:Request, res:Response)=>{
        try{
            const{email,password}=req.body
            if(!email || !password){
                return res.status(400).json
({
    message:"Email and password are required",
})           
 }
 const[rows]=await pool.query
(
    "SELECT id,name,email,password,role FROM users WHERE email =?",
    [email]

)   
const users =rows as{
    id:number
    name:string
    email:string
    password:string
    role:"admin"|"user"
}[]

const user =users[0]
if(!user){
    return res.status(401).json({
        message:"invalid email or password",
    })
}

const passwordMatch= await bcrypt.compare(
    password, user.password)
    if(!passwordMatch){
        return res.status(401).json({
            message:"Invalid email or password",
        })
    }
    const token =jwt.sign({
        id:user.id,
        role:user.role,
    },
    process.env.JWT_SECRET!,
    {
        expiresIn:"1h",
    }
    )
    return res.status(200).json({
        message:"Login successful",
        token,
        user:{
            id:user.id,
            name:user.name,
            email:user.email,
            role:user.role,
        },
    })
        } catch(error){
            console.log("Login error :",error)

            return res.status(500).json({
                message:"Server error",
            })
        }
    }