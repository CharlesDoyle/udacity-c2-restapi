import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';

const router: Router = Router();

// Get a FeedItem object for each FeedItem from api/v0/feed/
// each url will be a signed-url from AWS s3.
// find all items, and order by id descending
router.get('/', async (req: Request, res: Response) => {
    // first get all rows from the db, to trade the url for a signedUrl
    // get an array of 2 items from the db (rowcount, rows)
    // with all rows in FeedItem table, in desc. order of id
    const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});
    // map is a JS array method
    // items is an object with items.rows, items.count
    // items.rows is an array of FeedItem records
    // items.rows.map(item) calls the passed function on each row in rows
    items.rows.map((row) => {
            // if the url of a record exists
            //console.log('row before');
            //console.log(row);
            if(row.url) {
                // row.url is row.dataValues.url
                // (you don't have to specify .dataValues)
                // we are asking AWS for a signedURL so client can 
                // get the image with this url directly from the db
                row.url = AWS.getGetSignedUrl(row.url);
                //console.log('row after');
                //console.log(row);
                //console.log('A signedUrl:');
                //console.log(row.url);
            }
    });
    //console.log('get all records')
    //console.log(items);
    // send the items object back to the client, with url a signedUrl
    res.status(200).send(items); // items[0].dataValues.url is the signedUrl
});

//@TODO  (this works)
//Add an endpoint to GET a specific resource by Primary Key
//GET {{host}}/api/v0/feed/2
router.get('/:id', async (req: Request, res: Response) => {
    let { id } = req.params;  // get the id from the body
    // let id = req.params;
    //console.log(id);
    if (!id){
        return res.status(404).send({ message: "No id"});
    }
    const item = await FeedItem.findByPk(id); // 
    if(!item){
        return res.status(404).send({message: 'FeedItem not found'});
    }
    res.status(200).send(item);
});



// update the record with the id parameter in the endpoint
// The data to update a column is sent in the body of the request
// requireAuth parameter means we are checking for a jwt authorization
// with the middleware function.  
router.patch('/:id', 
    requireAuth, 
    async (req: Request, res: Response) => {
        //@TODO try it yourself
        let {id} = req.params; // get the id from the params
        var cap = req.body.caption;
        var url = req.body.url;
        if (!id){return res.status(400).send({message:"No id"});}
        // if both cap and url are absent, no patch data was sent
        if (!cap && !url){
            const s = "No caption or url string in body";
            return res.status(200).send({message: s});
        }
        // get the old record with this id
        const record = await FeedItem.findByPk(id); // 
        // if item is blank, no record with this id exists
        if (!record){
            return res.status(404).send({message: 'FeedItem not found'});
        }
        // if caption wasn't sent but url was, set cap to original caption
        if (!cap) {cap = record.caption}
        // if url wasn't sent and caption was, use the original url
        else if (!url) {url = record.url}
        // update the row that has the id in the endpoint
        // The returned array is a promise; 
        // obj is a list with a large object in it
        // obj[0].dataValues is the object representing the updated table
        const [numRows, obj] = await FeedItem.update(
            {caption: cap,
            url: url},
            // update the FeedItem record that has this id
            { where: {id:id}, returning: true}); 
        // next delete the old record and post a new one.
        //const saved_item = await item_patch.save(); // save the item to the db
        //return res.status(200).send(item_patch);
        //console.log(numRows); // numRows that were updated
        //console.log(obj[0].dataValues);
        res.status(200).send(obj[0].dataValues); // return the updated obj
        // dataValues will have {caption, url, createdAt, updatedAt}
    }
);


// the endpoint to request a putSignedURL, used to put a file in S3 bucket
// Choose a filename that will be used to store an image in s3
// {{host}}/api/v0/feed/signed-url/my-image.jpg
// This endpoint requires authorization as a jwt in headers.authorization
// The only ways this request can fail is with bad authorization or if
// the AWS configurations are wrong.
// If you request a signedUrl from AWS with something wrong in your config
// settings on config.ts, the returned url will be https://s3.amazonaws.com
// instead of the actual url of my s3 bucket.
router.get('/signed-url/:fileName', 
    requireAuth, 
    async (req: Request, res: Response) => {
    let { fileName } = req.params;
    // AWS.getPutSignedUrl is defined on aws.ts
    const url = AWS.getPutSignedUrl(fileName); 
    res.status(201).send({url: url}); // return the signedUrl
});

// {{host}}/api/v0/feed/
// requireAuth is a middleware function; it runs before the async
// callback function that we define with req and res., and when 
// requireAuth calls next(), the flow returns here to call async (req, res)
// Post a FeedItem object to the DB by sending an object with 2 fields
// url and caption.
// Return a signedURL so the user can upload an image file directly to s3.
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/', 
    requireAuth, 
    async (req: Request, res: Response) => {
    const caption = req.body.caption; // pull the caption data from the body
    const fileName = req.body.url;
    console.log('Checking if caption and filename are good');
    // check Caption is valid
    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    // check Filename is valid
    if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
    }
    // instantiate the new FeedItem obj. 
    const item = await new FeedItem({
            caption: caption,
            url: fileName
    });

    const saved_item = await item.save(); // save the item to the db

    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
});

// export FeedRouter to the app
export const FeedRouter: Router = router;