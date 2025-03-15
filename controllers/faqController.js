// import FAQ from "../models/faqModel.js";

// /**
//  * @desc Create a new FAQ (Admin Only)
//  * @route POST /api/faqs
//  * @access Admin
//  */
// export const createFAQ = async (req, res) => {
//     try {
//         const { question, answer } = req.body;

//         // Validate input
//         if (!question?.trim() || !answer?.trim()) {
//             return res.status(400).json({ message: "Question and Answer are required." });
//         }

//         const newFAQ = await FAQ.create({ question, answer });

//         res.status(201).json({ message: "FAQ created successfully", faq: newFAQ });
//     } catch (error) {
//         console.error("Error creating FAQ:", error);
//         res.status(500).json({ message: "Server Error", error: error.message });
//     }
// };

// /**
//  * @desc Get all FAQs
//  * @route GET /api/faqs
//  * @access Public
//  */
// export const getFAQs = async (req, res) => {
//     try {
//         const faqs = await FAQ.find().sort({ createdAt: -1 }); // Sort by latest
//         res.status(200).json(faqs);
//     } catch (error) {
//         console.error("Error fetching FAQs:", error);
//         res.status(500).json({ message: "Server Error", error: error.message });
//     }
// };

// /**
//  * @desc Update an FAQ (Admin Only)
//  * @route PUT /api/faqs/:id
//  * @access Admin
//  */
// export const updateFAQ = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { question, answer } = req.body;

//         // Validate ObjectId
//         if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//             return res.status(400).json({ message: "Invalid FAQ ID format." });
//         }

//         const updatedFAQ = await FAQ.findByIdAndUpdate(
//             id,
//             { question, answer },
//             { new: true, runValidators: true }
//         );

//         if (!updatedFAQ) {
//             return res.status(404).json({ message: "FAQ not found." });
//         }

//         res.status(200).json({ message: "FAQ updated successfully", faq: updatedFAQ });
//     } catch (error) {
//         console.error("Error updating FAQ:", error);
//         res.status(500).json({ message: "Server Error", error: error.message });
//     }
// };

// /**
//  * @desc Delete an FAQ (Admin Only)
//  * @route DELETE /api/faqs/:id
//  * @access Admin
//  */
// export const deleteFAQ = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Validate ObjectId
//         if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//             return res.status(400).json({ message: "Invalid FAQ ID format." });
//         }

//         const deletedFAQ = await FAQ.findByIdAndDelete(id);
//         if (!deletedFAQ) {
//             return res.status(404).json({ message: "FAQ not found." });
//         }

//         res.status(200).json({ message: "FAQ deleted successfully." });
//     } catch (error) {
//         console.error("Error deleting FAQ:", error);
//         res.status(500).json({ message: "Server Error", error: error.message });
//     }
// };





import FAQ from "../models/faqModels.js";

/**
 * @desc Create a new FAQ (Admin Only)
 * @route POST /api/faqs
 * @access Admin
 */
export const createFAQ = async (req, res) => {
    try {
        const { question, answer } = req.body;

        // Validate input
        if (!question?.trim() || !answer?.trim()) {
            return res.status(400).json({ message: "Question and Answer are required." });
        }

        const newFAQ = await FAQ.create({ question, answer });

        res.status(201).json({
            success: true,
            message: "FAQ created successfully",
            faq: newFAQ,
        });
    } catch (error) {
        console.error("❌ Error creating FAQ:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

/**
 * @desc Get all FAQs
 * @route GET /api/faqs
 * @access Public
 */
export const getFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find({}, "question answer createdAt").sort({ createdAt: -1 }).lean(); // Projection for better performance

        res.status(200).json({ success: true, faqs });
    } catch (error) {
        console.error("❌ Error fetching FAQs:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

/**
 * @desc Update an FAQ (Admin Only)
 * @route PUT /api/faqs/:id
 * @access Admin
 */
export const updateFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer } = req.body;

        // Validate MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid FAQ ID format." });
        }

        const updatedFAQ = await FAQ.findByIdAndUpdate(
            id,
            { question, answer },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedFAQ) {
            return res.status(404).json({ success: false, message: "FAQ not found." });
        }

        res.status(200).json({
            success: true,
            message: "FAQ updated successfully",
            faq: updatedFAQ,
        });
    } catch (error) {
        console.error("❌ Error updating FAQ:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

/**
 * @desc Delete an FAQ (Admin Only)
 * @route DELETE /api/faqs/:id
 * @access Admin
 */
export const deleteFAQ = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid FAQ ID format." });
        }

        const deletedFAQ = await FAQ.findByIdAndDelete(id).lean();
        if (!deletedFAQ) {
            return res.status(404).json({ success: false, message: "FAQ not found." });
        }

        res.status(200).json({ success: true, message: "FAQ deleted successfully." });
    } catch (error) {
        console.error("❌ Error deleting FAQ:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
