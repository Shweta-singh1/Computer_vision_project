const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const RESULTS_FILE = path.join(__dirname, 'study_results.json');

// Initialize results file if it doesn't exist
if (!fs.existsSync(RESULTS_FILE)) {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify([]));
}

app.post('/api/save-results', (req, res) => {
  try {
    const { participantId, sessionId, participantInfo, results, isComplete, completedAt } = req.body;

    // ✅ Validation for required fields
    if (!participantId || !sessionId || !Array.isArray(results)) {
      return res.status(400).json({ success: false, error: 'Missing required fields or invalid results' });
    }

    // Read existing data
    const existingData = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));

    // Add new entry
    existingData.push({
      participantId,
      sessionId,
      participantInfo: participantInfo || {},
      results,
      isComplete: !!isComplete,
      completedAt: completedAt || new Date().toISOString()
    });

    // Save back to file
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(existingData, null, 2));

    console.log(`✅ Results saved for participant: ${participantId}`);
    res.json({ success: true, message: 'Results saved successfully' });
  } catch (error) {
    console.error('Error saving results:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/export-csv', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));

    const headers = [
      'ParticipantID', 'SessionID', 'StimulusID',
      'Object1_ID', 'Object1_Rank',
      'Object2_ID', 'Object2_Rank',
      'Object3_ID', 'Object3_Rank',
      'Object4_ID', 'Object4_Rank',
      'Timestamp', 'TimeSpent_Seconds'
    ];

    const rows = [];
    data.forEach(session => {
      session.results.forEach(result => {
        const row = [
          session.participantId,
          session.sessionId,
          result.stimulusId || ''
        ];

        // ✅ Always 4 objects, fill empty if missing
        for (let i = 0; i < 4; i++) {
          const ranking = (result.rankings && result.rankings[i]) || {};
          row.push(ranking.objectId || '');
          row.push(ranking.rankPosition || '');
        }

        row.push(result.timestamp || '');
        row.push(result.timeSpent || '');

        rows.push(row.join(','));
      });
    });

    const csv = [headers.join(','), ...rows].join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment('study_results.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Results will be saved to: ${RESULTS_FILE}`);
});
