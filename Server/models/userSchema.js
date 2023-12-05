import mongoose from 'mongoose'
import dbconnect from '../app/mogoose.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
dbconnect()
const userSchema=new mongoose.Schema({
    
    FullName:{
        type:"String",
        required:[true,'Mandatory'],
        trim:true
    },
    Email:{
       type: "String",
        required:[true,'Mandatory'],
        unique:[true,'Email allready register '],
        trim:true
    },
    password:{
        type: "String",
        required:[true,'Mandatory'],
        trim:true
    },
    avatar:{
     public_id:"String",
     secure_URL:"String"
    },
    token:{
        type:"String"
},
role:{
    type:"String",
    enam:['ADMIN','USER'],
    default:'USER'
},
forgetPassword:"String",
forgetPasswordExfire:Date,
resetpasswordToken:'String',
subscription:{
    id:'String',
    status:'String' || ''
}
},{
timestamps:true
})
userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return next()
    }
    this.password=await bcrypt.hash(this.password,10)
    return next()
})
userSchema.methods={
    validator: async function(password,hashPasswor){
        console.log("call");
        console.log(await bcrypt.compare(password,hashPasswor));
        return await bcrypt.compare(password,hashPasswor)
      },
     genJwtToken:function(){
     return jwt.sign(
            {_id:this._id,Email:this.Email,role:this.role,subscription:this.subscription,avatar:this.avatar},
             process.env.JWT_SECRET_KEY,
            {
                algorithm:'HS256',
                // HS512
              expiresIn:process.env.EXFIRE,
            },
          );
    } ,
    passwordResetToken:async function(){
       const resetToken=crypto.randomBytes(20).toString('hex')
       console.log("userSchemaResetToken",resetToken);
       this.resetpasswordToken=crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
         this.forgetPasswordExfire=Date.now()+15*60*1000
          return this.resetpasswordToken
        },
    resetPasswordHandller:async function(req,res){
      const {token}=req.params;
      const tokenExist=await userSchema.find(token)
      if(token){
        console.log(token);
      }

    } 
}
export default new mongoose.model('User',userSchema)

