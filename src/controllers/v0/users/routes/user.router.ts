import { Router, Request, Response } from 'express';

import { User } from '../models/User';
import { AuthRouter, requireAuth } from './auth.router';

const router: Router = Router();

router.use('/auth', AuthRouter);

// GET {{host}}/api/v0/users/
// get all users.  A request must have authorization
router.get('/', requireAuth, async (req: Request, res: Response) => {
    const users = await User.findAll();
    res.status(200).send(users);
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