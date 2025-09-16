const express = require('express');
const { 
  getAllBookings, 
  getBookingById, 
  createBooking, 
  updateBooking, 
  cancelBooking 
} = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All booking routes require authentication
router.use(authMiddleware);

router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;