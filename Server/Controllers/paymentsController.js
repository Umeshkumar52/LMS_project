import Razorpay from "razorpay"
import Users from '../models/userSchema.js'
import payment from "../models/paymentModel.js"
import {razorpayInstance} from '../app/user.js'
import crypto from 'crypto';
import { error, log } from "console";
const allPayments=async function(req,res,next){
   try {
    const option={
        from:'2023-11-01',
        to:'2023-11-08'
}
    const allPayouts=await razorpayInstance.payments.all(option)
    return res.status(200).json({
         success:true,
         message:"Fetch all payments successfully",allPayouts

     })
   } catch (error) {
    return res.status(400).json({
        success:true,
        message:" failed to Fetch payments",
    })
   }
}
const getrazorPayKey=async function(req,res,next){
     res.status(200).json({
        success:true,
        message:process.env.RAZORPAY_KEY_ID,
        key:process.env.RAZORPAY_KEY_ID
     })
}
// const createPlans=async function(req,res,next){
//     console.log(req.body);
//     const option={
//         "period":"monthly",
//         "interval":req.body.interval,
//         "item":{
//             "name":"test plane for montly plane",
//         },
//         amount:req.body.amount*100,
//        currency:"INR",
//        description:"it is valid for 6 month"
//     }
//     try {
//         const plan=await razorpayInstance.plans.create(option)
//         if(!plan){
//           return res.status(400).json({
//             success:false,
//             message:'Unable to create plane'
//           })
//         }
//         return res.status(200).json({
//             success:true,
//             message:"plane created successfully",plan
//         })
//     } catch (error) {
//         return res.status(400).json({
//             success:false,
//             message:'Unable to create plane...',error
//           })
//     }
    
// }
const Buysubscription=async function(req,res,next){
    try {
        console.log("req",req.user);
        const {id}=req.params;
        console.log("Id",id);
        const user=await Users.findById(id)
        console.log("user",user._id);
        if(!user){
           return res.status(403).json({
               success:false,
               message:"Not authorised please try again"
           })
        }
      const subscription=await razorpayInstance.subscriptions.create({
       plan_id:process.env.COURSE_PLANE_ID,
       total_count:5,
       quantity:2
      })
      const subscriptionId=subscription.id
      console.log("subscription",subscription.id);
      if(!subscription){
        return res.status(400).json({
            success:false,
            message:"! OPPS, Unable to create subscription"
        })
      }      
      user.subscription.id=subscription.id;
      // user.subscription.status=subscription.status;
      await user.save();
      res.status(200).json({
       success:true,
       message:"Subscription Successfully",
      subscription_id:subscriptionId
      })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"! OPPS, Unable to create subscription...",error
        })
    }}
const verifySubscription=async function(req,res,next){
  console.log("user",req.user,req.body);
  const {_id}=req.user
  const {razorpay_payment_id,razorpay_subscription_id,razorpay_signature}=req.body;
  const paymentDetail={
    "razorpay_payment_id":razorpay_payment_id,
    "razorpay_subscription_id":razorpay_subscription_id,
    "razorpay_signature":razorpay_signature
  }
  const user=await Users.findById(_id)
  if(!user){
    return res.status(400).json({
        success:false,
        message:"Please, login again"
    })
  }
  console.log("u-ser",user);
    const subscriptionId=user.subscription.id;
    const getSignature=crypto
    .createHmac('sha256',process.env.RAZORPAY_SECRET_ID)
    .update(`${razorpay_payment_id} | ${subscriptionId}`)
    .digest('hex')
    console.log(getSignature,razorpay_signature);
    if(getSignature ==razorpay_signature){

        return res.status(500).json({
            success:false,
            message:"Payment not verify kindly try again",
           
        })
    }
  
      user.subscription.status="Active"
      user.save()
      console.log("status",user.subscription.status);
     return res.status(200).json({
        success:true,
        message:"Payment successfull",
        paymentDetail
    })
}
const createOrder=async function(req,res,next){
    const {amount}=req.body
    console.log(req.body);
  try {
    const options={
        amount:amount*100,
        currency:"INR",
        payment_capture:1,
        notes:{
            key1:"value3",
            key2:"value2"
        }
       }
       const response=await razorpayInstance.orders.create(options)
       console.log(response);
       if(!response){
        return res.status(400).json({
            success:false,
            message:"payment failed"
        })
       }
       return res.status(200).json({
        success:true,
        message:"payment successfully",response
    })
  } catch (error) {
    return res.status(400).json({
        success:false,
        message:"Not able to create order to payments",error
    })
  }
}

export {
    getrazorPayKey,
    Buysubscription,
    verifySubscription,
    createOrder,
    allPayments,
    // createPlans,
     }