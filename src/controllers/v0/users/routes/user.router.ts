import { Router, Request, Response } from 'express';

import { User } from '../models/User';
import { AuthRouter, requireAuth } from './auth.router';

const router: Router = Router();

router.use('/auth', AuthRouter);

// GET {{host}}/api/v0/users/
// get all user emails.  A request must have authorization
// I decided to return only a list of email addresses instead of
// a list of the full User objects, for no great reason.
router.get('/', requireAuth, async (req: Request, res: Response) => {
    const users = await User.findAll();
    var emails:string[] = new Array(users.length) // 
    for (var i=0; i < users.length; i++){
        emails[i] = users[i].dataValues.email
    }
    //users.forEach( (user) => {emails.push(user.dataValues.email)} )
    res.status(200).send(emails);
});

// GET {{host}}/api/v0/users/:email
// get a user object with a certain email address
router.get('/:email', requireAuth, async (req: Request, res: Response) => {
    let { email } = req.params;
    console.log(email);
    const user = await User.findByPk(email);
    res.status(200).send(user);
});

export const UserRouter: Router = router;