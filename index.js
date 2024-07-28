require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns')
const urlParser = require('url');
const { error } = require('console');
const { url } = require('inspector');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }));

//connect ke mongodb
mongoose.connect(process.env.URI)
.then(()=>{
  console.log("connected mongoDB")
})
.catch(()=>{
  console.log('error :',error)
})

//buat schema dan model untuk url
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: String,
  short_url:Number
})
const Url = mongoose.model('Url',urlSchema);


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl',async (req,res)=>{
  const isi = req.body.url;
  //parsing isi untuk ambil hostname
  const parsedUrl = urlParser.parse(isi);
  const hostname = parsedUrl.hostname;

  if(!hostname){
    res.json({error:'invalid url'})
  }
  
  dns.lookup(hostname,(err,address,family)=>{
    if(err){
      res.json({invalid:err})
    }
    console.log('Alamat IP:', address);
    console.log('Tipe alamat IP (IPv4/IPv6):', family);
  })
  
  try {
    let foundUrl = await Url.findOne({original_url:isi})
    if(foundUrl){
      res.json({
        original_url:foundUrl.original_url,
        short_url:foundUrl.short_url
      })
    }else{
      const newShort = (await Url.countDocuments()) + 1;
      const newData = new Url({original_url:isi, short_url:newShort});

      await newData.save();

      let foundNew = await Url.findOne({short_url:newShort})
      res.json({
        original_url:foundNew.original_url,
        short_url:foundNew.short_url  
      })
    }
  } catch (error) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred' });
  }
}
)

app.get('/api/shorturl/:short_url',async (req,res)=>{
  const params_short = req.params.short_url;
 
  try {
    const findData = await Url.findOne({short_url:params_short})
   
    if(findData){
      console.log(findData)
      res.redirect(findData.original_url)
    }else{
      res.json({error:'data nout found'}) 
    }
    
  } catch (error) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred' })
  }

})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
