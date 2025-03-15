import mongoose from "mongoose";

const FAQSchema = new mongoose.Schema(
    {
        question: { 
            type: String, 
            required: true, 
            trim: true, 
            unique:true,
            index: true //  Index for faster search
        },
        answer: { 
            type: String, 
            required: true, 
            trim: true 
        },
    },
    { timestamps: true } //  Adds `createdAt` & `updatedAt`
);

// Add Index for faster sorting
FAQSchema.index({
    createdAt:-1
})

//  Default Sorting Middleware (Latest FAQs First)
FAQSchema.pre(/^find/, function(next) {
    this.sort({ createdAt: -1 });
    next();
});

//Static Method: Paginated FAQs
FAQSchema.statics.getPaginatedFAQs = async function (page = 1, limit = 10){
    const skip = (page-1)*limit;
    return await this.find().skip(skip).limit(limit).lean();
}

//  Compile & Export Model
const FAQ = mongoose.model("FAQ", FAQSchema);
export default FAQ;
