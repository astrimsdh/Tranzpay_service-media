var express = require('express');
var router = express.Router();
const isBase64 = require('is-base64');
const base64Img = require('base64-img');
const fs = require('fs');



const {Media} = require('../models');

/* GET users listing. */
router.get('/', async(req, res) => {
  const media = await Media.findAll({
    attributes: ['id', 'media']
  });

  const mappedMedia = media.map((m) => {
    m.media = `${req.get('host')}/${m.media}`;
    return m;
  });

  return res.json({
    status: 'success',
    data: mappedMedia
  });
});
router.post('/', (req, res) => {
  const image = req.body.image;

  if(!isBase64(image, {mimeRequired: true})){
    return res.status(400).json({status:'error', message: 'invalid base64'});
  }

  base64Img.img(image, './public/images', Date.now(), async (err, filepath) => {
    if(err){
      return res.status(400).json({status: 'error', message: err.message});
    }

    const filename = filepath.split("\\").pop().split("/").pop();

    const media = await Media.create({media: `images/${filename}`});
    return res.json({
      status: 'success', 
      data: {
        id: media.id,
        media: `${req.get('host')}/images/${filename}`
      }
    });
  });
});
router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  const media = await Media.findByPk(id);

  if(!media){
    return res.status(404).json({status: 'error', message: 'Data media tidak ditemukkan'});
  }

  fs.unlink(`./public/${media.media}`, async (err) => {
    if(err) {
      return res.status(400).json({status: 'error', message: err.message});
    }

    await media.destroy();

    return res.json({
      status: 'success',
      message: 'Data media berhasil dihapus'
    });
  });
});

module.exports = router;
