const Review = require('../models/review');
const Apartment = require('../models/apartment');

module.exports.showReviews = async (req, res) => {
    const apartment = await Apartment.findById(req.params.id);
    const reviews = await Review.find({ _id: { $in: apartment.reviews } }).populate('author');
    res.render('reviews/show', { reviews, apartment });
}

module.exports.postReview = async (req, res) => {
    const apart = await Apartment.findById(req.params.id);
    const review = await new Review(req.body.review);
    review.author = req.user._id;
    apart.reviews.push(review);
    await review.save();
    await apart.save();
    req.flash('success', 'Review added successfully');
    res.redirect(`/apartments/${apart._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const apart = await Apartment.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Deleted review successfully');
    res.redirect(`/apartments/${apart._id}`);
}