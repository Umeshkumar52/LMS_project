import jwt from 'jsonwebtoken'
import cookies from 'cookie-parser'
const isLogined=async(req,res,next)=>{
    // const token =localStorage.getItem("token") || ""
    const token=req.cookies.token
    console.log("token",token);
    if(!token){
       return res.status(401).json({
          success:false,
          message:"!OPPS, unauthenticated, kindly Login again"
      })
    }
    const userDetails=await jwt.decode(token,process.env.JWT_SECRET_KEY)
    console.log("userDetail",userDetails);
    if(!userDetails){
        return res.status(401).json({
           success:false,
           message:"!OPPS, unauthenticated"
       })
     }
     
    req.user=userDetails;
    next()
}
export default isLogined; 