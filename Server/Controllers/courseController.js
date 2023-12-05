import Courses from '../models/courseModel.js'
import {v2 as cloudinary} from 'cloudinary'
const courses=async  function(req,res,next){
 try {
    const allCourses=await Courses.find({})
    res.status(200).json({
        success:true,
        message:allCourses
    })
 } catch (error) {
    return  res.status(400).json({
        success:true,
        message:"Please try again"
    })
 }
}
const courseDetailById=async function(req,res,next){
   const courseId=req.params;
try {
    const coursDetail=await Courses.findById({courseId})
    res.status(200).json({
        success:true,
        message:coursDetail
    })
} catch (error) {
    return  res.status(400).json({
        success:true,
        message:"Please try again"
    })
}
}
const createCourse=async function (req,res,next){
    const {tittle,description,createBy,thumnail}=req.body;
  
    if(!tittle || !description || !createBy || !req.file){
        return res.status(400).json({
         success:false,
         message:"All Fields are mandatory"
        })
         }   
    const course=await Courses.create({
        tittle,
        description,
        thumnail:{
            public_id:"222224fdgfd1fggf45",
            secure_url:"domeUrlsafe usrdds"
        },
        createBy
    })
   
if(!course){
    return  res.status(400).json({
        success:true,
        message:" We are unable to create course, Please try again"
    })
}
if(req.file){
        try {
            const result=await cloudinary.uploader
            .upload(req.file.path,{
                folder:"courses",
                use_filename:true,
                unique_filename:false,
                overwrite:true,
                width:426,
                height:240
            })
          console.log( "result",result);
            if(result){
              course.thumnail.publice_id=result.public_id;
              course.thumnail.secure_url = result.secure_url;
            //   fs.rm(`uplods/${req.file.filename}`)
            }
           } catch (error) {
            return res.status(400).json({
              success:false,
              message:'Failed to upload img',
              error
            })
           }
        }
          await course.save()    
    res.status(200).json({
        success:true,
        message:'Course created successfully',course
    })
   }
   const updateCourse=async function(req,res,next){
    try {
        console.log(req.body);
        const {id}=req.params;
       const response= await Courses.findByIdAndUpdate(
            id,
            {$set:req.body},
            {runValidators:true}
            )
           res.status(200).json({
            success:true,
            message:'Course update successfully',response
           })
      } catch (error) {
        return res.status(400).json({
            success:false,
            message:' unable to update course, pleasse try again'
          })
      }

   }
   const deletCourse=async function(req,res,next){
    try {
    const {id}=req.params;
    const course=await Courses.findById(id);
    if(!course){
        return res.status(400).json({
          success:false,
          message:'Course do not exist'
        })
    }
         await course.deleteOne()      
         res.status(200).json({
          success:true,
          message:'Course deleted successfully'
         })
    } catch (error) {
      return res.status(400).json({
          success:false,
          message:' unable to delet course, pleasse try again'
        })
    }
   }
   const addLectures=async function(req,res,next){
      const {id}=req.params;   
      const {tittle,description,lecture}=req.body
      try{
       const course=await Courses.findById(id)
       if(!tittle || !description){
        return  res.status(204).json({
            success:false,
            message:"All fields are mandatory"
        })
       }
       if(!course){
        return res.status(204).json({
            success:false,
            message:"Course does not Exist"
        })
       }
       const lectureData={}
      console.log("file",req.file);
      if(req.file){
        const result= await cloudinary.uploader
        .upload(req.file.path,{
                 folder:'colud_img',
                 resource_type:"video",
                 width:426,
                 height:240
                })
                console.log(result);
                if(result){
                 lectureData.public_id=result.public_id;
                 lectureData.secure_url = result.secure_url;
                }
            }
            console.log(lectureData);
             course.lectures.push({
                tittle,
                description,
                lecture:lectureData
             });
              course.lecturesCount=course.lectures.length;
            await course.save()
            res.status(200).json({
                success:true,
                message:"Lecture added successfully",course
             }) 
        }
        catch(error){
        return res.status(400).json({
            success:false,
            message:error.message
        })
        }
   }
   const getLectures=async function(req,res,next){
    const {id}=req.params;
    console.log(id);
    try {
        const courseData=await Courses.findById(id)
        
        if(!courseData){
           res.status(400).json({
            success:false,
            message:"Course does not Exist"
           })
        }
        const lectures=courseData.lectures
        console.log("lectures",lectures);
        res.status(200).json({
            success:true,
            message:"Fetch Lectures data successfull",lectures
        })
    } catch (error) {
        res.status(400).json({
            success:false,
            message:"Failed to fetch lectures",error
           })
    }
   }
export {
    courses,
    courseDetailById,
    createCourse,
    updateCourse,
    deletCourse,
    addLectures,
    getLectures
     } 