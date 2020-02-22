// My practice script

var lst = [2,3]
console.log(lst[0])

// a function definition
const getName = () => { return 'Jim';};

// formatting a string
var name = 'Joe';
console.log(`my name is ${name}`); // use backticks

// module refers to this file
// see the large module object, an object that every js file has
console.log(module); // module.exports will be {}
module.exports.foo = 'foo'; // add a key:value pair to module.exports
console.log(module.exports);  // now the module.exports is {foo:'foo'}
exports.bar = 'bar';
console.log(module.exports);  // {foo:'foo', bar:'bar'}

// array.map(func)
// calls the function on each element
var arr = ['fuck', 'you'];
arr.map((element) => {
    console.log(`${element} you`);
});

// let declares a block-scope variable
{
    var y = 3;
    let x = 2; // x is in-scope only inside the block
} 
// console.log(x);  // x is not defined here
console.log(y);  // y is in-scope

let {z} = 11;
console.log(z); // undefined
let {a} = {b:'fuck'};
console.log(a);

// use let in a forloop
for (let i=0; i<5; i++){console.log(i)} // i is not available here

// Some code to demonstrat the JS AWS SDK for working with S3 buckets
// We want to obtain a signedURL for the client to download and upload
// a large file directly to our filestore in an S3 bucket.
// This code will go onto 
// We will use Postman to use the signedURL and get our resource.
// sign in
/*
var credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
AWS.config.credentials;

// instantiate a new S3 object with info on your bucket
// use S3 api version 4
export const s3 = new AWS.S3({
    signatureVersion: 'v4',
    region: 'us-east-2',
    params: {Bucket: 'my-bucket-name'}
});

// the params needed to get a signedURL
var params = {
    Bucket: 'my-bucket-name',
    Key: 'photo.jpg',
    Expires: (60*5)
};

// Request a signedUrl to download a resource from the bucket
const url = s3.getSignedUrl('getObject', params);

// Request a signedUrl to upload a resource to the bucket
const url = s3.getSignedUrl('putObject', params);
*/

