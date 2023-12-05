import userSchema from '../models/userSchema.js';
import fs from 'fs'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import AppError from '../utilities/AppError.js';
import multer from 'multer';
import cloudinary from 'cloudinary'
import upload from '../midilewars/multerMiddilerware.js'
import SendMail from '../utilities/sendMail.js'
import { log } from 'console';
const cookieOptions={
    expires:new Date(Date.now()+7*24*60*60*1000),
    httpOnly:true,
    secure:false
 }
const register=async(req,res)=>{
    const {Email,password,FullName}=req.body;   
    if(!FullName,!Email || !password){
        return res.status(400).json({
            success:false,
            message:"Every field is mandetory"
        })
    }
    try{
    const ExistUser= await userSchema.findOne({Email})
        if(ExistUser){
            return res.status(400).json({
                success:false,
                message:`User allready exist `
              })
        }
        const user= await userSchema.create({
            FullName,
            Email,
            password,
            avatar:{
                publice_id:"124e5d4525fdffd",
                secure_URL:"Deme_Url"
            },
            subscription:{
              id:'',
              status:"inactive"
            }
        })     
            if(!user){
                return res.status(400).json({
                    success:false,
                    message:"failed to signUp, please try again"
                })
            }
          if(req.file){
                const options={
                  folder:'colud_img',
                  width:250,
                  hieght:250,
                  gravity:'faces',
                  crop:'fill',
                  overwrite:true
                }
                try{
                const result=await cloudinary.v2.uploader.upload(req.file.path,options)
                console.log("result",result)
                if(result){
                  user.avatar.public_id=result.public_id;
                  user.avatar.secure_URL = result.secure_url;
                  // fs.rm(`uplods/${req.file.filename}`)
                }
                console.log("result",result.public_id);
          }catch(error){
                return res.status(400).json({
                  success:false,
                  message:"failed to upload image",error
                })
              }
              }
              
            await user.save() 
            const token = await user.genJwtToken()
            console.log("token",token);
            user.token=token
            user.password=undefined
            // localStorage.setItem("token",token)
            res.cookie("token",token,cookieOptions) 
            res.status(200).json({
                success:true,
                message:`Signing Successfull`,
                user
              })
        } catch (error) {
            return res.status(400).json({
                success:false,
                message:"Filed to signUp"
              })
            }
     }

// Login
const login=async(req,res)=>{
    try {
      const {Email,password} =req.body
        const user = await userSchema
             .findOne({Email})
             .select('+password');
            
            if(user==null || await user.validator(password,user.password) ==false){
              return res.status(400).json({
                    success:false,
                     message:"Invalide credentials"
                  })
            }
              const token=await user.genJwtToken() 
              user.password=undefined;    
              user.token=token 
            
            res.cookie("token",token,cookieOptions)
             return res.status(200).json({
            success:true,
            message:"Login Successfully",
            user
        })
    } catch (error) {
       return res.status(400).json({
            success:false,
            message:"Failed to login, please try again."
        })
    }
}
// Users Profile
async function getProfile(req,res,next){
  try {
const{token}=req.cookies;
  console.log(token);
  const user=await userSchema.findById(req.user._id)
 return res.status(200).json({
    success:true,
    message:'fetch Profile successfully',user
})
} catch (error) {
 return res.status(400).json({
    success:false,
    message:'Failed to fetch user profile'
}) 
}
    }
    // UPDATE pROFILE
    const updateProfile=async function(req,res,next){
      try {
            const {_id}=req.user;
          await userSchema.findByIdAndUpdate(
               _id,
              {$set:req.body},
              {runValidators:true}
              )
            return res.status(200).json({
              success:true,
              message:'Profile update successfully'
             })
        } catch (error) {
          return res.status(400).json({
              success:false,
              message:' unable to update profile, pleasse try again'
            })
        }
     }
// Logout the user 
async function logout(req,res,next){
 
try {
    res.cookie("token",null,
    {
       maxAge:null,
       httpOnly:true
    })
    return res.status(200).json({
       success:true,
       message:"Logout Successfully "
    })
} catch (error) {
   return res.status(4001).json({
        success:false,
        message:"Failed to Logout, kindly try again "
     }) 
}
}
async function forgetPassword(req,res,next){
  try {
  const {Email}=req.body;
  if(!Email){
    return res.status(400).json({
      success:false,
      message:"Kindly Enter your Email" 
    })
  }
  const user=await userSchema.findOne({Email})
  if(!user){
     return res.status(400).json({
      success:false,
      message:"Kindly enter a valid register Email"
     })
  }
    const resetToken= await user.passwordResetToken()
    await user.save()
    const resetPasswordUrl=`http://localhost:3000/reset-password/?resetToken=${resetToken}`
    console.log(resetPasswordUrl);
   const mail=await SendMail(Email,'Reset your forget password',resetPasswordUrl);
   console.log("here");
  return res.status(200).json({
        success:true,
        message:`Link has been send to reset password to ${Email} successfully`
      })
    } catch (error) {
      return  res.status(400).json({
        success:false,
        message:`Try again after some time`
      })
    }
}
async function resetPassword(req,res,next){
  const {newPassword,confirmPassword}=req.body
 const {token}=req.params;
if(newPassword !=confirmPassword){
  return res.state(400).json({
    success:false,
    message:"Password not matche"
  })
}
try {
 const user=await userSchema.findOne({
   resetpasswordToken:token,
  // forgetPasswordExfire:{$gt:Date.now()}
 })
if(!user){
  return res.status(400).json({
    success:false,
    message:'Token is invalid or Expire'
  })
}
user.password=newPassword
user.save()
return res.status(200).json({
  success:true,
  message:'Password reset successfully'
})
} catch (error) {
  return res.status(400).json({
    success:false,
    message:'Failed to reset password'
  })
}
}
export {register,login,logout,getProfile,updateProfile,forgetPassword,resetPassword} 
