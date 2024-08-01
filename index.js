import express from "express"
import bodyParser from "body-parser"
import ejs from "ejs"
import {fileURLToPath} from "url"
import {dirname} from "path"
import fs from "fs"
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
//To-do:
//-Create array that contains new posts
//-Create post method that appends a new file name to the posts array
//-Create an assigning function that assigns a randomly generated unique code to each post so that it can be retrieved.
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
const postsDirectory = __dirname + "/posts/"

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(retrievePosts);

//retrieves post data from [postsDirectory] and returns it to res.posts to be used in app.method responses
function retrievePosts(req, res, next){
    fs.readdir(postsDirectory, "utf8", async function usePosts(err, files){
        if (err) throw err;
        res.posts = [];
        res.postsToRender = files.length;
        res.postNames = files;
        for (let file of files){
            let data = await new Promise((resolve, reject)=>{
                fs.readFile(postsDirectory + file, "utf-8", function displayPosts(err, data){
                    if (err){
                        reject(err);
                        console.log("File " + file + " failed to load.");
                    }else{
                    resolve(data);
                    }
                })});
                res.posts.push(data);
            }
        next();
    });
}
//renders the home page with post data
app.get("/", (req, res) =>{
    if (res.postsToRender){
     res.render("index.ejs",{
            postContent: res.posts,
            numOfPostsToRender: res.postsToRender
     });
    }else{res.render("index.ejs")}
});

//Creates new post and saves content of textarea from esj file to a text file in [postDirectory]
function createPost(req, fileName){
     //temporary Post name retrieval variable
     const PostName = postsDirectory + fileName + ".txt";
        fs.writeFile(PostName, req, "utf8", function logSuccessToConsole () {
         console.log(`Post ${fileName} edited/created.`)
     });
}
app.get("/edit-post",(req,res)=>{
    console.log("Request to edit post: " + req.query.postName + " received.");
    let requestedPost = res.posts[parseInt(req.query.postName)];
    console.log(requestedPost);
   res.render("edit-post.ejs",{
        existingPost: requestedPost,
        postTitle: req.query.postName,
   });
});
app.delete("/", (req, res) =>{
    console.log("Delete Request received");
    const postToDelete = res.postNames[parseInt(req.body["postNumber"])];
    fs.rm(postsDirectory + postToDelete,()=>{
        console.log("File " + postToDelete + " deleted successfully.");
        res.sendStatus(200);
    });
});
//handles edit-post requests
app.post("/edit-post", (req, res)=>{
    const fileNumber = req.body["postFileName"];
    const postNameToEdit = postsDirectory + res.postNames[fileNumber];
    const newData = req.body["newData"];
    fs.writeFile(postNameToEdit, newData, "utf-8", ()=>{
       console.log("File " + postNameToEdit + " has successfully been edited.");
    });
    res.redirect("/")
});
//handles new posts and redirects back to homepage after submission
app.post("/new-post",(req, res)=>{
    const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });
    createPost(req.body["bPost"], randomName);//imported unique name generator from npm, hopefuly this solves the issue
    res.redirect("/");
});
app.get("/new-post", (req,res) =>{
    res.render("submit_post.ejs");
});
app.listen(port, ()=>{
    console.log(`Server is running on port: ${port}`)
});