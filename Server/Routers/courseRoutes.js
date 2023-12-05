import Router from "express";
import upload from "../midilewars/multerMiddilerware.js";
import authorisedRole from "../midilewars/authorisedRoles.js";
import isLogined from "../midilewars/isLogined.js";
import { getLectures } from "../Controllers/courseController.js";
import { courses, courseDetailById,createCourse,updateCourse,deletCourse,addLectures} from "../Controllers/courseController.js";
const router=Router()
router.route('/')
.get(courses)
.post(isLogined,authorisedRole,upload.single('thumnail'),createCourse)
router.route('/:id')
.get(courseDetailById)
.put(isLogined,authorisedRole,updateCourse)
.delete(isLogined,authorisedRole,deletCourse)
.post(isLogined,authorisedRole,upload.single('lecture'),addLectures)
 router.route('/lectures/:id')
 .get(getLectures)
export default router;
