import express from 'express';
import cors from 'cors';
import db from './db/conn.mjs';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import {v2 as cloudinary} from 'cloudinary';
import multer from  'multer';
          
const app = express();
cloudinary.config({ 
  cloud_name: 'dx53dzhsi', 
  api_key: '365261683399358', 
  api_secret: 'svIa002YmKorEASm_i0y2_qufaU' 
});

const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(cors());


app.use(
    session({
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: true,
    })
  );
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  const database = db.collection('users');
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: '210428474446-7sd68r5p5bnvcphf2bt38ai0v8ql1944.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: 'http://localhost:3001/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await database.findOne({ googleId: profile.id });
  
          if (!user) {
            const newUser = {
              name: profile.displayName,
              email: profile.email,
              googleId: profile.id,
              data: [],
              username: '',
              description: '',
            };
            const result = await database.insertOne(newUser);
            if (result.acknowledged) {
              user = newUser;
            }
          }
  
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
  
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(`http://localhost:3000/home/${req.user.googleId}`);
  }
);


app.post('/upload', async (req, res) => {
  try {
    const {constant, url, googleId, time } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required.' });
    }
    const user = await database.findOne({googleId});

    const newData = {
      constant: constant,
      imageurl: url,
      timestamp: time
    };

    const updatedUser = await database.findOneAndUpdate(
      { googleId },
      { $push: { data: newData } },
      { new: true }
    );
    console.log(updatedUser);
    return res.status(201).json({ message: 'Post added successfully', user: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/imageupload', upload.single('image'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);

    res.status(200).json({ message: 'Image uploaded successfully', imageUrl: result.secure_url });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/user/:googleId', async (req, res) => {
  try {
    const { googleId } = req.params;
    const user = await database.findOne({ googleId });

    if (user) {
      res.json(user);
    } else {
      res.status(400).json('user not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json('internal server error');
  }
});

app.get('/endexp', async (req, res) => {
  try {
    const { googleId } = req.query;

    const users = await database.find({ googleId }); 

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const timeArray = users.map(user => user.time);
    const constantArray = users.map(user => user.constant);

    return res.status(200).json({
      time: timeArray,
      constant: constantArray
    });
  } catch (error) {
    console.error('Error', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
