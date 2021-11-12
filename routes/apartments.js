const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { validateApartment, isLoggedIn, isAuthor } = require('../middleware');
const apartmentController = require('../controllers/apartments');
const multer = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(apartmentController.showApartments))
    .post(isLoggedIn, upload.array('image'), validateApartment, catchAsync(apartmentController.createApartment))

router.get('/new', isLoggedIn, apartmentController.renderNewForm)

router.post('/search', apartmentController.searchApartment)

router.route('/:id')
    .get(catchAsync(apartmentController.showApartment))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateApartment, catchAsync(apartmentController.updateApartment))
    .delete(isLoggedIn, isAuthor, catchAsync(apartmentController.deleteApartment))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(apartmentController.renderEditForm))

module.exports = router;