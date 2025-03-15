// import twilio from '../config/twilio';
// import dotenv from "dotenv";
// import Question from "../models/questionModel"

// dotenv.config();

// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// //Add Quiz Question (Admin Only)
// export const sendQuizQuestion = async(req,res)=>{
    
//     try {
       
//         const {text,
//             options,
//             category,
//             sequenceNumber
//         } = req.body;

//         //Ensure there is a option
//         if (!options) {
//             return res.status(400).json({
//                 message:"Please Provide the options"
//             });
//         };

//         const newQuestions = new Questions({
//             text,
//             options,
//             category,
//             sequenceNumber,
//         });
//         await newQuestions.save();

//         res.status(201).json({
//             message:"Questions added successfully",
//             question:newQuestions,
//         });
        
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({
//             message:"Something went Wrong",error
//         });
//     }
// }


// // GET all Questions(Admin)
// export const getAllQuestions = async (req,res)=>{
//     try {
//         const questions = await Question.find().sort("sequenceNumber");
//         res.status(200).json(questions);                       
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({
//             message:"Something went Wrong",error
//         });
//     }
// }

// //Send Next Questions via Whatsapp(In sequences)
// export const sendNextQuestion = async (req,res)=>{
//        try {
//         const {phone,currentSequence} = req.body;

//         //Get the next questions in sequences
//         const nextQuestion = await Question.findOne({
//             sequenceNumber: currentSequence+1 
//         });
        
//         if(!nextQuestion){
//             return res.status(404).json({
//                 message:"No more questions available"
//             });
//         }
        
//         const messageBody = `*Next Questions!*\n\n* ${nextQuestion.text}*\n\n` +
//         ` ${nextQuestion.options[0]}\n` +
//         ` ${nextQuestion.options[1]}\n` +
//         ` ${nextQuestion.options[2]}\n` +
//         ` ${nextQuestion.options[3]}\n\n` +
//         ` Reply with the option number (1, 2, 3, or 4).`;


//          // Send WhatsApp message
//         await client.messages.create({
//             from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
//             to: `whatsapp:${phone}`,
//             body: messageBody
//         });

//         res.status(200).json({ message: "Next question sent successfully!" });

//        } catch (error) {
        
//        }
// }




import twilio from '../config/twilio.js';
import dotenv from "dotenv";
import Question from "../models/questionModel.js";
import User from "../models/userModel.js"; // Assuming user data for referrals

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

//  Add Quiz Question (Admin Only)
export const sendQuizQuestion = async (req, res) => {
    try {
        const { text, options, category, sequenceNumber, imageUrl } = req.body;

        if (!text || !options || options.length < 2) {
            return res.status(400).json({ message: "Please provide a valid question and at least two options." });
        }

        const newQuestion = new Question({
            text,
            options,
            category,
            sequenceNumber,
            imageUrl, // Admin sets an image for the question
        });

        await newQuestion.save();

        res.status(201).json({ message: "Question added successfully", question: newQuestion });
    } catch (error) {
        console.error("Error adding question:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

//  Get All Questions (Admin)
export const getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find().sort("sequenceNumber");
        res.status(200).json(questions);
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

//  Send Next Question via WhatsApp (Sequential)
export const sendNextQuestion = async (req, res) => {
    try {
        const { phone, currentSequence, userId } = req.body;

        const nextQuestion = await Question.findOne({ sequenceNumber: currentSequence + 1 });

        if (!nextQuestion) {
            // No more questions → Send referral link at the end
            const user = await User.findById(userId);
            const referralLink = user ? `https://AnyCanDance.com/free-trial/y/${user.name.replace(/\s/g, "").toLowerCase()}_${user.referralCode}` : "https://AnyCanDance.com/free-trial";

            await client.messages.create({
                from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
                to: `whatsapp:${phone}`,
                body: ` Congratulations! You've completed the quiz.\n\nInvite friends and get rewards: ${referralLink}`
            });

            return res.status(200).json({ message: "Quiz completed, referral link sent!" });
        }

        //  Message with Image & Buttons
        const messageBody = `*Next Question!*\n\n*${nextQuestion.text}*`;
        const buttons = nextQuestion.options.map((option, index) => ({
            type: "reply",
            reply: { id: `${index + 1}`, title: option }
        }));

        // Send WhatsApp interactive message
        await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${phone}`,
            body: messageBody,
            mediaUrl: nextQuestion.imageUrl ? [nextQuestion.imageUrl] : [],
            interactive: {
                type: "button",
                body: { text: messageBody },
                action: { buttons }
            }
        });

        res.status(200).json({ message: "Next question sent successfully!" });

    } catch (error) {
        console.error("Error sending next question:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
