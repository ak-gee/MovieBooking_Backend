const JWT = require("jsonwebtoken");
const secret = "abcd";

const createJwt = async({id}) => {
return await(JWT.sign({id},secret,{expiresIn:"1h"}))

}
const authenticate = async(req,res,next) => {

    try{

        const bearer = await req.headers["authorization"]
        if(!bearer) return res.json({message:"access Failure"})
        JWT.verify(bearer,secret,(err,decode) => {
            if  (res) {
                req.body.auth = decode;
                next();
            }
            else res.json({message:"Authentication Failure"})
        })

    }
    catch(error){
        return res.json({
            message: "Error"
        })
    }
}


const permit = (...roles) => {
    return (req,res,next) => {
        const {role} = req.body.auth;
        if (roles.includes(role)){
            next();
        }else{
            res.json({
                message:"No access to this route"
            })
        }
    }

}
module.exports = {createJwt, authenticate, permit}
