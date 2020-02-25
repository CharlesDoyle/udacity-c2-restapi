import { Router, Request, Response } from 'express';

import { User } from '../models/User';

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { NextFunction } from 'connect';

import * as EmailValidator from 'email-validator';
import { config } from '../../../../config/config';
import { runInNewContext } from 'vm';

const router: Router = Router();

// a helper function for registering a new user.  We hash a plain password
// with salt, so it can be sent to the DB for storage. 
async function generatePassword(plainTextPassword: string): Promise<string> {
    //@TODO Use Bcrypt to Generated Salted Hashed Passwords
 
    // a saltround is how many times the salt is randomly jumbled.
    const saltRounds = 10; // 2^10 or 1024 times to jumble the salt
    // create and jumble the salt
    let salt = await bcrypt.genSalt(saltRounds); // need await bc async func
    //
    // return await bcrypt.hash(plainTextPassword, salt);
    // the hash is salt+password.  We will store hash as one thing.
    // bcrypt knows which part is hashed salt and which the hashed password
    const hash = await bcrypt.hash(plainTextPassword, salt);
    return hash;
}
// a helper function for login of a returning user
async function comparePasswords(plainTextPassword: string, hash: string): Promise<boolean> {
    //@TODO Use Bcrypt to Compare your password to your Salted Hashed Password
    // use this compare line to prove the hash and hashed password same
    return await bcrypt.compare(plainTextPassword, hash); // true
    
}
// a helper function for POST of a new user or login of user 
// both of those endpoints generate and return a jwt
function generateJWT(user: User): string {
    //@TODO Use jwt to create a new JWT Payload
    // return a signed jwt based on the user and secret string.
    // jwt.sign(User_obj, secret)  This serializes the user with secret.mess
    // jwt.sign(user, config.jwt.secret) threw an error that 
    // the payload (first arg) needs to be a plain object.
    // user is not a plain JSON object, but user.dataValues is
    return jwt.sign(user.dataValues, config.jwt.secret);
}

// a middleware func to validate that the JWT is in the 
// request authorization header.
// Each endpoint that we protect with authorization will add this
// middleware function to the arg list before the callback async funcion.
// This way, this middleware authorization func is called before the 
// async callback with req, res.  
// Check if the authorization header exists and is a valid JWT
// 
// If yes, the endpoint can be processed. If no, the request ends
// with the appropriate status code.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    //return next(); // continue to the next middleware
    // req.headers is a Nodejs feature.  class http.IncomingMessage.headers 
    //console.log('in requireAuth');
    if (!req.headers || !req.headers.authorization){
        // 401 unauthorized. No call to next(); end the request cycle
        return res.status(401).send({ message: 'No authorization headers.' });
    }
    
    // headers.authorization is 2 pcs: 'Bearer  kdosfkpdI;djghepk;dogpkr'
    const token_bearer = req.headers.authorization.split(' ');
    if(token_bearer.length != 2){
      return res.status(401).send({ message: 'Malformed token.' });
    }
    //console.log(token_bearer);
    const token = token_bearer[1]; // the second string is the token
    // use the secret to determine if the token if valid
    return jwt.verify(token, config.jwt.secret, (err, decoded) => {
        
        if (err) {
            //console.log('verify failed');
            // 500 Internal Server Error
            return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
        }
    
    //console.log(decoded); // see the decoded token
    // go to the next middleware, which is back to the function that called
    // this middleware function.
    return next();
     });
}

// a protected endpoint because requireAuth middleware func is a parameter
router.get('/verification', 
    requireAuth, 
    async (req: Request, res: Response) => {
        return res.status(200).send({ auth: true, message: 'Authenticated.' });
});

// a user login to {{host}}/api/v0/users/auth/login
// A user sends email and password to login and get a JWT.
// If username and password are valid, generate a JWT and return it
// to the user so they can then request something that requires a jwt.  
router.post('/login', async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    // check email is valid
    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ auth: false, message: 'Email is required or malformed' });
    }

    // check email password valid
    if (!password) {
        return res.status(400).send({ auth: false, message: 'Password is required' });
    }

    const user = await User.findByPk(email);
    // check that user exists in db; if not, then 404 'not found'
    if(!user) {
        return res.status(404).send({ auth: false, message: 'User not found' });
    }

    // compare submitted password to one stored in DB
    const authValid = await comparePasswords(password, user.password_hash)
    // if the passwords don't match, status 401 Unauthorized
    if(!authValid) {
        return res.status(401).send({ auth: false, message: 'Unauthorized' });
    }

    // Generate JWT for the validated user
    const jwt = generateJWT(user);
    // send the jwt back in an object.  user: email_address
    // user.short() is a little function on the User model that returns
    // only the email address; a shortened user info object.
    res.status(200).send({ auth: true, token: jwt, user: user.short()});
});

//register a new user
// POST {{host}}/api/v0/users/auth/  (with a body payload of data)
// user sends a payload object of user data in body, a User obj. is 
// created if the data is good, and a jwt token
// is returned so the user can have a session with permission to post
// images and do other things that require validation.
router.post('/', async (req: Request, res: Response) => {
    const email = req.body.email;
    const plainTextPassword = req.body.password;
    // check email is valid
    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ auth: false, message: 'Email is required or malformed' });
    }

    // check email password valid
    if (!plainTextPassword) {
        return res.status(400).send({ auth: false, message: 'Password is required' });
    }

    // find the user
    const user = await User.findByPk(email);
    // if user already exists, we can't post a new one, so 422
    if(user) {
        // 422 means we recognize the text and any syntax is good, but 
        // the semantics are bad; the user string is recognizable but 
        // is a user who already has an account, so don't create a new user
        return res.status(422).send({ auth: false, message: 'User may already exist' });
    }
    // hashed with salt
    const password_hash = await generatePassword(plainTextPassword);
    // add the new user
    const newUser = await new User({
        email: email,
        password_hash: password_hash
    });
    let savedUser; // create a new variable outside the block
    try {
        savedUser = await newUser.save(); // send to the DB
        //console.log(savedUser);
        const jwt = generateJWT(savedUser); // savedUser should be plain object
        res.status(201).send({token: jwt, user: email});
    } catch (e) {
        //throw e;
        console.log(e);
        //res.status(500).send("catch block");
    }
    // Generate JWT for the newly validated user.
    //const jwt = generateJWT(savedUser);
    //res.status(201).send({token: jwt, user: email});
    //res.status(201).send({token: jwt, user: savedUser.short()});
});

// GET all users
// GET {{host}}/api/v0/users/auth/ 
router.get('/', async (req: Request, res: Response) => {
    res.send('auth')
});

export const AuthRouter: Router = router;