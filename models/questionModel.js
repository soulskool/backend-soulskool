import mongoose from "mongoose";
const {Schema} = mongoose;

const QuestionSchema = new Schema(
    {
        text: { 
            type: String, 
            required: true, 
            trim: true 
        },
        options: [{ 
            type: String, 
            required: true, 
            trim: true 
        }], //  Changed `option` to `options` (Array) // Array for multiple-choice options
        category: { 
            type: String, 
            required: true, 
            trim: true, 
            index: true //  Index for fast queries  //  Optimized for category-based searches
        },
        sequenceNumber: { 
            type: Number, 
            required: true, 
            unique: true, 
            index: true //  Indexed for quick lookups // Indexed for quick retrieval
        },
        responses: { 
            type: Map, 
            of: Number, 
            default: {} 
        } //  Stores user responses efficiently
    },
    { timestamps: true } //  Adds `createdAt` & `updatedAt`
);

// Index for faster lookups
QuestionSchema.index({
    category:1,
    sequenceNumber:1
});
QuestionSchema.index({
    createdAt:-1
});

//middleware: Ensure `sequenceNumber` is unique
QuestionSchema.pre("save",async function (next){
    const existingCount = await  this.constructor.countDocuments({
        sequenceNumber: this.sequenceNumber 
    });
    if(existingCount>0){
        return next(new Error("sequenceNumber must be unique"));
    }
    next();
});

// Static Method: Paginated Questions
QuestionSchema.statics.getPaginatedQuestions = async function (page =1, limit=10){
    const skip = (page -1)*limit;
    return await this.find().sort({
        sequenceNumber:1
    }).skip(skip).limit(limit).lean();
}

//Compile & Export Model
const Questions  =  mongoose.model("Questions", QuestionSchema);
export default Questions;

