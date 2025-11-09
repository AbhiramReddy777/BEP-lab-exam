// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (if any)
app.use(express.static('public'));

// Path to feedback file
const feedbackFile = path.join(__dirname, 'feedback.json');

// ✅ Ensure feedback.json exists
if (!fs.existsSync(feedbackFile)) {
  fs.writeFileSync(feedbackFile, '[]');
}

// Route to handle feedback submission
app.post('/submit', (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Create new feedback entry
  const feedback = {
    name,
    email,
    message,
    time: new Date().toISOString(),
  };

  // Read existing feedbacks
  fs.readFile(feedbackFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading feedback file:', err);
      return res.status(500).json({ error: 'Server error while reading data' });
    }

    let feedbacks = [];
    try {
      feedbacks = JSON.parse(data || '[]');
    } catch (parseErr) {
      console.error('Error parsing feedback file:', parseErr);
    }

    // Add new feedback
    feedbacks.push(feedback);

    // Save updated feedback list
    fs.writeFile(feedbackFile, JSON.stringify(feedbacks, null, 2), err => {
      if (err) {
        console.error('Error saving feedback:', err);
        return res.status(500).json({ error: 'Error saving feedback' });
      }
      res.json({ success: true, message: 'Feedback saved successfully!' });
    });
  });
});

// ✅ Optional: route to view all feedback
app.get('/feedbacks', (req, res) => {
  fs.readFile(feedbackFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Unable to read feedback data' });
    res.json(JSON.parse(data || '[]'));
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
