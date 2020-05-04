const Photo = require('../models/Photo.model');
const Voter = require('../models/Voter.model');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    if(title && author && email && file) { // if fields are not empty...

      //const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0];
      if (ext === 'png' || ext === 'jpg' || ext === 'gif' ){
        const newPhoto = new Photo({ title, author, email, src: fileExt, votes: 0 });
        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);
      } else {
        throw new Error('Wrong file format!');
      }

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      const vote = await Voter.findOne({user: req.clientIp});
      if(!vote) {
        const newVoter = new Voter({user: req.clientIp});
        newVoter.votes.push(photoToUpdate._id);
        await newVoter.save();
        res.json({ message: 'IP added with photo'});
      }
      else {
        const votedPhotos = await Voter.findOne({user: req.clientIp, votes: req.params.id});
        if(votedPhotos) res.status(500).json(err);
        else {
          await Voter.updateOne({user: req.clientIp}, {$push: {votes: req.params.id}});
          res.json({ message: 'Photo added to IP address'});
        }
      }
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch(err) {
    res.status(500).json(err);
  }

};
