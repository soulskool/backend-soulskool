import mongoose from "mongoose";

const  {Schema} = mongoose;

const ResourceSchema = new Schema({
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        required: true, 
        trim: true 
    },
    url: { 
        type: String, 
        required: true, 
        trim: true, 
        validate:{
            validator:function(v){
                return /^(https?:\/\/)[\w.-]+(?:\.[\w\.-]+)+(?:\/[\w\.-]*)*\/?$/.test(v);
            },
             message: "Invalid URL format"
        },// Validates as a Proper URL
    category: { 
        type: String, 
        enum: ["pdf", "video"], 
        required: true, 
        index: true //  Indexed for better search
        },
    isLocked: { 
        type: Boolean, 
        default: false, 
        index: true //  Indexing for quick filtering
        },
    requiredReferrals: { 
        type: Number, 
        default: 0, 
        min: 0 //  Ensures no negative values
        }
    },
},{timestamps:true} // Auto-generates `createdAt` & `updatedAt`
);

//Indexed For Optimized Queries
ResourceSchema.index({
    category:1,isLocked:1
});
ResourceSchema.index({
    createdAt:-1
});

//MiddleWare:Default Sorting Middleware (Newest Resources First)
ResourceSchema.pre(/^find/,function(next){
    this.sort({
        createdAt :-1
    });
    next();
});

//Static Method:Paginated Resources
ResourceSchema.statics.getPaginatedResources = async function (page = 1, limit = 10){
    const skip = (page - 1)*limit;
    return await this.find().sort({
        createdAt:-1
    }).skip(skip).limit(limit).lean();
};

//Compile & Export Model
const Resource = mongoose.model("Resource", ResourceSchema);
export default Resource;