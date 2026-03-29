const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const resumeRoutes = require('./routes/resume');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/resume', resumeRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'ATS Resume Builder API' });
});

app.listen(PORT, () => {
    console.log(`🚀 ATS Resume Backend running on port ${PORT}`);
});
