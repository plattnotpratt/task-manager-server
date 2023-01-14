const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require("joi");
const { valid } = require("joi");
const { response } = require("../app");
const prisma = new PrismaClient();




const validationSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().pattern(new RegExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&-+=()]).{8,20}$/)),
  fname: Joi.string(),
  lname: Joi.string(),
});

function respondError422(res, next) {
  res.status(422);
  const error = new Error('Unable to login.');
  next(error);
}

function createTokenSendResponse(user, res, next) {
  const payload = {
    id: user.id,
    email: user.email,
    fname: user.fname,
    lname: user.lname,
  };

  jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: '1d'
  }, (err, token) => {
    if (err) {
      console.log(err);
      respondError422(res, next);
    } else {
      res.json({
        token
      });
    }
  });
}

router.get('/', (req, res) => {
  res.json({
    "message": "This is the auth section",
  })
});

router.post('/signup', async (req, res, next) => {
  const result = await validationSchema.validateAsync(req.body);
  if(result.error === undefined){
    const user = await prisma.user.findFirst({
      where: { email: req.body.email}
    });
    if(user){

       error = new Error('Email has already been taken.');
      res.status(409);
      next(error);

    }else{
      const hashPass = await bcrypt.hash(req.body.password, parseInt(process.env.PASSWORD_SALT));
      const resultUser = await prisma.user.create({
        data: {
          email: req.body.email,
          password: hashPass,
          fname: req.body.fname,
          lname: req.body.lname,
          boards:{
            create:{
              title:'',
              tasks:{
                create:{
                  title: "",
                },
              },
            },
          }
        }
      })
      console.log(resultUser);
      createTokenSendResponse(resultUser, res, next);
    } 
  }else{
    respondError422(res, next);
  }
});

router.post('/login', async (req, res, next) => {
  const result = await validationSchema.validateAsync(req.body);
  if(result.error === undefined){
    const user = await prisma.user.findFirst({
      where: { email: req.body.email}
    });
    if(user){
      const valid = await bcrypt.compare(req.body.password, user.password);
      if(valid){
        createTokenSendResponse(user, res, next);
      }else{
        respondError422(res, next);
      }
    }else{
      respondError422(res, next);
    } 
  }else{
    respondError422(res, next);
  }
})


module.exports = router;

