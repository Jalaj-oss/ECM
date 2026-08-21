import type {Request, Response, NextFunction} from "express"

export const authorize =(role:"admin"|"user")=>{
    return(req:Request,res:Response,next:NextFunction)=>{

        if(!req.user){
            return res.status(401).json({
                message:"Authentication required",
            })
    }
    if(req.user.role!==role){
        return res.status(403).json({
            message:"Accesss denied",
        })
    }
    next()
    }
}