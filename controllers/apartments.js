const { cloudinary } = require('../cloudinary');
const Apartment = require('../models/apartment');

module.exports.showApartments = async (req, res) => {
    const apartments = await Apartment.find({});
    res.render('apartments/index', { apartments });
}

module.exports.createApartment = async (req, res, next) => {
    const apart = new Apartment(req.body.apartment);
    apart.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    apart.author = req.user._id
    await apart.save();
    req.flash('success', 'Apartment was added successfully!');
    res.redirect(`apartments/${apart._id}`);
}

module.exports.renderNewForm = (req, res) => {
    res.render('apartments/new');
}

module.exports.showApartment = async (req, res) => {
    const apartment = await Apartment.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!apartment) {
        req.flash('error', 'Could not find the apartment!');
        return res.redirect('/apartments');
    }
    res.render('apartments/show', { apartment });
}

module.exports.updateApartment = async (req, res) => {
    const { id } = req.params;
    const apartment = await Apartment.findByIdAndUpdate(id, { ...req.body.apartment });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    apartment.images.push(...imgs);
    await apartment.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await apartment.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Apartment details updated successfully!');
    res.redirect(`/apartments/${apartment._id}`);
}

module.exports.deleteApartment = async (req, res) => {
    const { id } = req.params;
    await Apartment.findByIdAndDelete(id);
    console.log('Successfully deleted an apartment');
    req.flash('success', 'Apartment deleted successfully!');
    res.redirect('/apartments');
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const apartment = await Apartment.findById(id);
    if (!apartment) {
        req.flash('error', 'Could not find the apartment!');
        return res.redirect('/apartments');
    }
    res.render('apartments/edit', { apartment });
}

module.exports.searchApartment = async (req, res) => {
    const text = req.body.searchInput.toUpperCase().trim();
    const matchingApartments = [];
    let apartments = await Apartment.find({});
    for (let apartment of apartments) {
        const a = apartment.title.toUpperCase().trim();
        const end = Math.min(a.length, text.length);
        let flag = false;
        for (let i = 0; i < end; i++) {
            if (a[i] != text[i]) {
                flag = true;
                break;
            }
        }
        if (flag || text.length === 0)
            continue;
        matchingApartments.push(apartment);
    }
    apartments = matchingApartments;
    res.render('apartments/index', { apartments });
}