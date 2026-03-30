const Groq = require('groq-sdk');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Groq Cloud AI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── AI ANALYSIS: ATS SCORE & SUGGESTIONS ───
router.post('/analyze', async (req, res) => {
    try {
        const { resumeData, jobRole = "Software Engineer" } = req.body;
        
        const prompt = `
            You are an expert ATS (Applicant Tracking System) and Career Coach. 
            Analyze the following resume data for the role of "${jobRole}":
            
            Resume Data: ${JSON.stringify(resumeData)}
            
            Return a JSON object with:
            1. atsScore (0-100)
            2. strengths (list of 3-4 points)
            3. weaknesses (list of 3-4 points)
            4. suggestions (list of 5 action-oriented improvements)
            5. missingKeywords (list of technical keywords that should be added)
            6. formattingIssues (any specific suggestions for layout)
            
            Strictly return ONLY the JSON object. No conversational text.
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const responseText = completion.choices[0].message.content;
        res.json(JSON.parse(responseText));
    } catch (error) {
        console.error("Groq AI Analysis Error:", error);
        res.status(500).json({ error: "Failed to analyze resume via Groq" });
    }
});

// ─── AI IMPROVE: PROJECT DESCRIPTION ───
router.post('/improve-description', async (req, res) => {
    try {
        const { description } = req.body;
        const prompt = `
            Rewrite the following project description to be highly professional, result-oriented, and ATS-friendly using strong action verbs. Use 2-3 concise bullet points.
            Original: ${description}
        `;
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: "llama-3.3-70b-versatile",
        });
        res.json({ improved: completion.choices[0].message.content.trim() });
    } catch (error) {
        console.error("Groq Improve Error:", error);
        res.status(500).json({ error: "Failed to improve description via Groq" });
    }
});

// ─── AI GENERATE: PROFESSIONAL SUMMARY ───
router.post('/generate-summary', async (req, res) => {
    try {
        const { skills, education, projects } = req.body;
        const prompt = `
            Generate a 3-sentence professional summary for a student with the following details:
            Education: ${JSON.stringify(education)}
            Skills: ${JSON.stringify(skills)}
            Projects: ${JSON.stringify(projects)}
            Focus on career potential and technical expertise.
        `;
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: "llama-3.3-70b-versatile",
        });
        res.json({ summary: completion.choices[0].message.content.trim() });
    } catch (error) {
        console.error("Groq Summary Error:", error);
        res.status(500).json({ error: "Failed to generate summary via Groq" });
    }
});

// ─── PDF GENERATION: ATS-FRIENDLY PDF ───
router.post('/generate-pdf', async (req, res) => {
    try {
        const { data } = req.body;
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        let page = pdfDoc.addPage([595.28, 841.89]); // A4
        const { width, height } = page.getSize();
        let y = height - 50;

        // Header
        page.drawText(data.personalInfo.fullName.toUpperCase(), { x: 50, y, size: 20, font: boldFont, color: rgb(0, 0, 0) });
        y -= 25;
        const contactInfo = `${data.personalInfo.email} | ${data.personalInfo.phoneNumber} | ${data.personalInfo.location}`;
        page.drawText(contactInfo, { x: 50, y, size: 10, font });
        y -= 15;
        const links = `${data.personalInfo.linkedin} | ${data.personalInfo.github}`;
        page.drawText(links, { x: 50, y, size: 10, font, color: rgb(0, 0, 0.8) });
        y -= 30;

        // Sections helper
        const drawSection = (title, items) => {
            if (y < 100) { page = pdfDoc.addPage([595.28, 841.89]); y = height - 50; }
            page.drawText(title.toUpperCase(), { x: 50, y, size: 12, font: boldFont });
            y -= 5;
            page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
            y -= 20;

            items.forEach(item => {
                if (y < 50) { page = pdfDoc.addPage([595.28, 841.89]); y = height - 50; }
                page.drawText(item.heading, { x: 50, y, size: 10, font: boldFont });
                page.drawText(item.subHeading || "", { x: width - 200, y, size: 9, font });
                y -= 15;
                if (item.desc) {
                    const lines = item.desc.split('\n');
                    lines.forEach(line => {
                        page.drawText(`• ${line.trim()}`, { x: 60, y, size: 9, font });
                        y -= 12;
                    });
                }
                y -= 5;
            });
            y -= 10;
        };

        // Education
        drawSection("Education", data.education.map(e => ({
            heading: `${e.degree} - ${e.branch}`,
            subHeading: `${e.startYear} - ${e.endYear}`,
            desc: `${e.collegeName}, ${e.university} | CGPA: ${e.cgpa}`
        })));

        // Experience
        if (data.experience?.length) {
            drawSection("Experience", data.experience.map(ex => ({
                heading: `${ex.role} at ${ex.companyName}`,
                subHeading: ex.duration,
                desc: ex.responsibilities
            })));
        }

        // Projects
        drawSection("Projects", data.projects.map(p => ({
            heading: p.title,
            subHeading: p.duration,
            desc: `${p.description}\nTech: ${p.technologiesUsed}`
        })));

        // Skills
        drawSection("Skills", [{
            heading: "Technical & Soft Skills",
            desc: `${data.skills.technical}\nLanguages: ${data.skills.languages}\nTools: ${data.skills.tools}`
        }]);

        const pdfBytes = await pdfDoc.save();
        res.contentType("application/pdf");
        res.send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error("PDF Gen Error:", error);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
});

module.exports = router;
