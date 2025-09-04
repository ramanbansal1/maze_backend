const express = require('express');
const auth = require('../middleware/auth');
const Score = require('../models/Score');
const User = require('../models/User');

const router = express.Router();

// Submit score
router.post('/submit-score', auth, async (req, res) => {
  try {
    const { score } = req.body;
    
    // Create new score entry
    const newScore = new Score({
      user: req.user._id,
      rollNumber: req.user.rollNumber,
      score: parseInt(score)
    });
    
    await newScore.save();
    
    res.status(201).json({
      message: 'Score submitted successfully',
      score: newScore
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    // Get top scores with user details
    const leaderboard = await Score.aggregate([
      {
        $sort: { score: -1 } // Sort by score descending
      },
      {
        $group: {
          _id: "$user",
          maxScore: { $max: "$score" },
          rollNumber: { $first: "$rollNumber" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: "$userDetails"
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$userDetails.name",
          rollNumber: 1,
          score: "$maxScore"
        }
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: 100 // Limit to top 100 scores
      }
    ]);

    // Add rank to each entry
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));

    res.json(rankedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's highest score
router.get('/my-score', auth, async (req, res) => {
  try {
    const highestScore = await Score.findOne({ user: req.user._id })
      .sort({ score: -1 });
    
    res.json({
      userId: req.user._id,
      name: req.user.name,
      rollNumber: req.user.rollNumber,
      highestScore: highestScore ? highestScore.score : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;