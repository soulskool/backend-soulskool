// import express from 'express'
// import {
//     uploadResource,
//     getResources,
//     getResourcesByCategory,
//     unlockResource,
//     deletedResource,
//     upload
// } from '../controllers/resourceController.js';

// import {
//     authenticate,
//     authorize
// } from '../middleware/auth.js';

// const router = express.Router();

// //Upload a Resources (Admin Only)
// router.post("/",authenticate,authorize([["admin"]]),
//                 upload.single("file"),
//             uploadResource
// );

// // Get all Resource 
// router.get("/resource",getResources);

// // Get Resource by Category (PDF or Videos)
// router.get("/:category",getResourcesByCategory);

// // Unlock Resources by via referrals 
// router.get("/unlock/:resourceId",authenticate,unlockResource);

// //Delete a Resource (Admin Only)
// router.delete("/:id",authenticate,authorize(["admin"]),deletedResource)

// export default router;



import express from "express";
import {
    uploadResource,
    getResources,
    getResourcesByCategory,
    unlockResource,
    deleteResource, //  Fixed function name from 'deletedResource' to 'deleteResource'
    upload
} from "../controllers/resourceController.js";

import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

//  Upload a Resource (Admin Only)
router.post(
    "/",
    authenticate,
    authorize(["admin"]), //  Fixed nested array issue
    upload.single("file"),
    uploadResource
);

//  Get All Resources
router.get("/", getResources);

//  Get Resources by Category (PDFs or Videos)
router.get("/category/:category", getResourcesByCategory);

//  Unlock Resource via Referrals (Authenticated Users Only)
router.get("/unlock/:resourceId", authenticate, unlockResource);

//  Delete a Resource (Admin Only)
router.delete("/:id", authenticate, authorize(["admin"]), deleteResource); // ✅ Fixed function name

export default router;
