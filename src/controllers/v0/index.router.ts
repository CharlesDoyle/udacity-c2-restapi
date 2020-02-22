import { Router, Request, Response } from 'express';
import { FeedRouter } from './feed/routes/feed.router';
import { UserRouter } from './users/routes/user.router';

// a Router object is a mini version of an express() object like app, but for fewer endpoints
const router: Router = Router(); // create a blank Router object

// ctrl+click over any filename to open the file (try it for FeedRouter)
router.use('/feed', FeedRouter);  // add routes to router object
router.use('/users', UserRouter);

router.get('/', async (req: Request, res: Response) => {    
    res.send(`V0`);
});

export const IndexRouter: Router = router;