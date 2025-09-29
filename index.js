const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(cors({
    origin: "https://hostt-62z9.onrender.com", // 👈 your Render frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://expreesentryvisa_db_user:T5EtfzXH8wCctMkW@cluster0.2shnnrh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Define schema
const vevoSchema = new mongoose.Schema({
    documentType: { type: String, required: true },
    referenceType: { type: String },
    referenceValue: { type: String },
    familyName: String,
    documentNumber: String,
    countryOfPassport: String,
    visaClassSubclass: String,
    visaDescription: String,
    visaStream: String,
    visaApplicant: String,
    visaGrantDate: String,
    visaExpiryDate: String,
    location: String,
    visaStatus: String,
    visaGrantNumber: String,
    entriesAllowed: String,
    mustNotArriveAfter: String,
    periodOfStay: String,
    workEntitlements: String,
    studyEntitlements: String,
    visaConditions: String,
    timestamp: String
});

// Index for fast searching
vevoSchema.index({ documentType: 1, referenceType: 1, referenceValue: 1 });
vevoSchema.index({ documentNumber: 1, dateOfBirth: 1 });

const VevoRecord = mongoose.model("VevoRecord", vevoSchema);

// POST: Add record
app.post("/vevo-records", async (req, res) => {
    try {
        const record = new VevoRecord(req.body);
        await record.save();
        res.status(201).json({ message: "Record saved successfully", record });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Search for records
app.post("/vevo-records/search", async (req, res) => {
    try {
        const { documentType, referenceType, referenceValue, dateOfBirth, documentNumber } = req.body;
        
        // Build search query
        let searchQuery = { documentType };
        
        // Add reference search criteria
        if (referenceType && referenceValue) {
            searchQuery.referenceType = referenceType;
            searchQuery.referenceValue = referenceValue;
        }
        
        // Add date of birth if provided (this would typically be stored as a date field)
        // For now, we'll search by the other criteria
        
        // Search for the record
        const record = await VevoRecord.findOne(searchQuery);
        
        if (record) {
            res.json({ 
                success: true, 
                message: "Record found", 
                data: record 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: "No record found matching the search criteria" 
            });
        }
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            error: err.message 
        });
    }
});

// GET: Get all records (for admin purposes)
app.get("/vevo-records", async (req, res) => {
    try {
        const records = await VevoRecord.find({});
        res.json({ success: true, data: records });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
