const Token = require('../models/Token');

/**
 * Generates a sequential token number per office per day.
 * Format: A001, A002, A003, ...
 * Resets daily.
 */
const generateTokenNumber = async (officeId) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Count existing tokens for this office today
  const count = await Token.countDocuments({
    office: officeId,
    date: today
  });

  const nextNumber = count + 1;
  const tokenNumber = `A${String(nextNumber).padStart(3, '0')}`;

  return tokenNumber;
};

/**
 * Gets the current queue position for a waiting token.
 * Position = number of 'waiting' tokens in the same office+service
 * that arrived before this token.
 */
const getQueuePosition = async (tokenId) => {
  const token = await Token.findById(tokenId);
  if (!token || token.status !== 'waiting') return 0;

  const position = await Token.countDocuments({
    office: token.office,
    service: token.service,
    date: token.date,
    status: 'waiting',
    arrivalTime: { $lte: token.arrivalTime },
    _id: { $ne: token._id }
  });

  return position + 1; // 1-based position
};

module.exports = { generateTokenNumber, getQueuePosition };
