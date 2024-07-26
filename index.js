require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns')
const urlParser = require('url');
const { error } = require('console');

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

app.post('/api/shorturl',(req,res)=>{
  const isi = req.body.url;
  //parsing isi untuk ambil hostname
  const parsedUrl = urlParser.parse(isi);
  const hostname = parsedUrl.hostname;

  if(!hostname){
    res.json({error:'invalid url'})
  }
  
  dns.lookup(hostname,(err,addres,family)=>{
    if(err){
      res.json({invalid:err})
    }
  })
}
)

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
