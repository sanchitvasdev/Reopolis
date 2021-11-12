const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviewController = require('../controllers/reviews');

router.route('/')
    .get(catchAsync(reviewController.showReviews))
    .post(isLoggedIn, validateReview, catchAsync(reviewController.postReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview))

module.exports = router;