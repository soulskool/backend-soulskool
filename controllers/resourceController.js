// import Resource from "../models/resourceModel.js";
// import multer from "multer";
// import fs from "fs/promises";
// import path from "path";
// import dotenv from "dotenv";

// dotenv.config();

// // 🔹 Allowed File Types (Security Measure)
// const allowedMimeTypes = {
//     "application/pdf": "pdf",
//     "video/mp4": "mp4",
//     "video/mpeg": "mpeg"
// };

// // 🔹 Configure Multer (Memory Storage for Faster Processing)
// const storage = multer.memoryStorage();

// const upload = multer({
//     storage,
//     limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
//     fileFilter: (req, file, cb) => {
//         if (!allowedMimeTypes[file.mimetype]) {
//             return cb(new Error("Invalid file type. Only PDFs & Videos allowed."));
//         }
//         cb(null, true);
//     }
// });

// // 🔹 Upload a Resource (Admin Only)
// export const uploadResource = async (req, res) => {
//     try {
//         if (!req.user?.isAdmin) {
//             return res.status(403).json({ success: false, message: "⛔ Forbidden: Admin access required" });
//         }

//         const { title, description, category, isLocked, requiredReferrals } = req.body;

//         if (!req.file) {
//             return res.status(400).json({ success: false, message: "❌ File upload is required" });
//         }

//         // 🔹 Save File to Disk
//         const uploadPath = "uploads/";
//         await fs.mkdir(uploadPath, { recursive: true }); // Create directory if not exists

//         const fileExt = allowedMimeTypes[req.file.mimetype];
//         const fileName = `${Date.now()}-${req.file.originalname}`;
//         const filePath = path.join(uploadPath, fileName);
//         await fs.writeFile(filePath, req.file.buffer);

//         // 🔹 Save Resource to DB
//         const newResource = await Resource.create({
//             title,
//             description,
//             category,
//             url: `/uploads/${fileName}`,
//             isLocked,
//             requiredReferrals
//         });

//         res.status(201).json({ success: true, message: "✅ Resource uploaded successfully", newResource });

//     } catch (error) {
//         console.error("❌ Upload Error:", error.message);
//         res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// };

// // 🔹 Get All Resources
// export const getResources = async (req, res) => {
//     try {
//         const resources = await Resource.find().lean(); // Optimized query
//         res.status(200).json({ success: true, resources });
//     } catch (error) {
//         console.error("❌ Fetch Error:", error.message);
//         res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// };

// // 🔹 Get Resources by Category
// export const getResourcesByCategory = async (req, res) => {
//     try {
//         const { category } = req.params;
//         const resources = await Resource.find({ category }).lean();

//         if (!resources.length) {
//             return res.status(404).json({ success: false, message: "⚠️ No resources found in this category" });
//         }

//         res.status(200).json({ success: true, resources });
//     } catch (error) {
//         console.error("❌ Category Fetch Error:", error.message);
//         res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// };

// // 🔹 Unlock Resource via Referrals
// export const unlockResource = async (req, res) => {
//     try {
//         const { resourceId } = req.params;
//         const user = req.user;

//         if (!user) {
//             return res.status(403).json({ success: false, message: "⛔ Unauthorized: Login required" });
//         }

//         const resource = await Resource.findById(resourceId).lean();
//         if (!resource) {
//             return res.status(404).json({ success: false, message: "⚠️ Resource not found" });
//         }

//         if (!resource.isLocked || user.referrals >= resource.requiredReferrals) {
//             return res.status(200).json({ success: true, message: "✅ Resource unlocked", url: resource.url });
//         }

//         return res.status(403).json({
//             success: false,
//             message: `📢 Refer ${resource.requiredReferrals - user.referrals} more friends to unlock`
//         });
//     } catch (error) {
//         console.error("❌ Unlock Error:", error.message);
//         res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// };

// // 🔹 Delete Resource (Admin Only)
// export const deleteResource = async (req, res) => {
//     try {
//         if (!req.user?.isAdmin) {
//             return res.status(403).json({ success: false, message: "⛔ Forbidden: Admin access required" });
//         }

//         const { id } = req.params;

//         const deletedResource = await Resource.findByIdAndDelete(id);
//         if (!deletedResource) {
//             return res.status(404).json({ success: false, message: "⚠️ Resource not found" });
//         }

//         // 🔹 Delete File from Server
//         const filePath = path.join("uploads", deletedResource.url.split("/uploads/")[1]);
//         try {
//             await fs.unlink(filePath);
//         } catch (err) {
//             if (err.code !== "ENOENT") {
//                 console.error("❌ File Deletion Error:", err.message);
//             }
//         }

//         res.status(200).json({ success: true, message: "✅ Resource deleted successfully" });

//     } catch (error) {
//         console.error("❌ Delete Error:", error.message);
//         res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// };

// // 🔹 Export Multer Upload Middleware
// export { upload };


import Resource from "../models/resourceModel.js";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// 🔹 Allowed File Types (Security Measure)
const allowedMimeTypes = {
    "application/pdf": "pdf",
    "video/mp4": "mp4",
    "video/mpeg": "mpeg"
};

// 🔹 Configure Multer (Memory Storage for Faster Processing)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes[file.mimetype]) {
            return cb(new Error("Invalid file type. Only PDFs & Videos allowed."));
        }
        cb(null, true);
    }
});

// 🔹 Upload a Resource (Admin Only)
export const uploadResource = async (req, res) => {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ success: false, message: "⛔ Forbidden: Admin access required" });
        }

        const { title, description, category, isLocked, requiredReferrals } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "❌ File upload is required" });
        }

        // 🔹 Save File to Disk
        const uploadPath = path.join(process.env.UPLOADS_DIR || "uploads");
        await fs.mkdir(uploadPath, { recursive: true });

        const fileExt = allowedMimeTypes[req.file.mimetype];
        const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, "-")}`;
        const filePath = path.join(uploadPath, fileName);
        await fs.writeFile(filePath, req.file.buffer);

        // 🔹 Save Resource to DB
        const newResource = await Resource.create({
            title,
            description,
            category,
            url: `/uploads/${fileName}`,
            isLocked: isLocked === "true", // Convert string to boolean
            requiredReferrals: parseInt(requiredReferrals, 10) || 0
        });

        res.status(201).json({ success: true, message: "✅ Resource uploaded successfully", newResource });

    } catch (error) {
        console.error("❌ Upload Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// 🔹 Get All Resources
export const getResources = async (req, res) => {
    try {
        const resources = await Resource.find().lean();
        res.status(200).json({ success: true, resources });
    } catch (error) {
        console.error("❌ Fetch Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// 🔹 Get Resources by Category
export const getResourcesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const resources = await Resource.find({ category }).lean();

        if (!resources.length) {
            return res.status(404).json({ success: false, message: "⚠️ No resources found in this category" });
        }

        res.status(200).json({ success: true, resources });
    } catch (error) {
        console.error("❌ Category Fetch Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// 🔹 Unlock Resource via Referrals
export const unlockResource = async (req, res) => {
    try {
        const { resourceId } = req.params;
        const user = req.user;

        if (!user) {
            return res.status(403).json({ success: false, message: "⛔ Unauthorized: Login required" });
        }

        const resource = await Resource.findById(resourceId).lean();
        if (!resource) {
            return res.status(404).json({ success: false, message: "⚠️ Resource not found" });
        }

        if (!resource.isLocked || user.referrals >= resource.requiredReferrals) {
            return res.status(200).json({ success: true, message: "✅ Resource unlocked", url: resource.url });
        }

        return res.status(403).json({
            success: false,
            message: `📢 Refer ${resource.requiredReferrals - user.referrals} more friends to unlock`
        });
    } catch (error) {
        console.error("❌ Unlock Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// 🔹 Delete Resource (Admin Only)
export const deleteResource = async (req, res) => {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ success: false, message: "⛔ Forbidden: Admin access required" });
        }

        const { id } = req.params;

        const deletedResource = await Resource.findByIdAndDelete(id);
        if (!deletedResource) {
            return res.status(404).json({ success: false, message: "⚠️ Resource not found" });
        }

        // 🔹 Delete File from Server
        const filePath = path.join(process.env.UPLOADS_DIR || "uploads", deletedResource.url.split("/uploads/")[1]);
        try {
            await fs.unlink(filePath);
        } catch (err) {
            if (err.code !== "ENOENT") {
                console.error("❌ File Deletion Error:", err.message);
            }
        }

        res.status(200).json({ success: true, message: "✅ Resource deleted successfully" });

    } catch (error) {
        console.error("❌ Delete Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// 🔹 Export Multer Upload Middleware
export { upload };
