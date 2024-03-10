import express from "express";
import cors from "cors";
import { logRequest } from "./logging.js";
import { getAllBlogs, createBlog, deleteBlog, updateBlog, getBlogById} from "./db.js";

const app = express();
const port = 3000;
// This line is necessary to parse the request body
app.use(express.json());

app.use(logRequest);

console.log("enable Cors");
app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Server listening at http://127.0.0.1:${port}`);
});

function validateBlogData(req, res, next) {
    const { title, content, banner } = req.body;
    if (!title || !content || (banner && banner.length > 1048576)) { // Asume un límite de 1MB para la imagen en base64
        return res.status(400).json({ error: "Missing or invalid title, content, or banner. Banner size must be under 1MB." });
    }
    next();
}
app.post("/blogs", validateBlogData, async (req, res) => {
    try {
        const blogs = await createBlog(req.body.title, req.body.content, req.body.banner);
        res.json(blogs);
    } catch (e) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/blogs", async (req, res) => {
    const blogs = await getAllBlogs();
    res.json(blogs);
});

app.get("/blogs/:id", async (req, res) => {
    const id = req.params.id;
    const blog = await getBlogById(id);
    if (blog) {
        res.json(blog);
    } else {
        res.status(404).json({ error: "Post not found" });
    }
});

// app.post('/start', async (req, res) => {
//   const messages = await createDatabase()
//   res.json(messages)
// })

app.put("/blogs/:id", validateBlogData, async (req, res) => {
    try {
        const result = await updateBlog(req.params.id, req.body.title, req.body.content, req.body.banner);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.delete("/blogs/:id", async (request, response) => {
    const id = request.params.id;
    console.log(id);
    await deleteBlog(id); 
    response.status(204).end(); 
});


app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
});
app.use((req, res, next) => {
    if (!["GET", "POST", "PUT", "DELETE"].includes(req.method)) {
        return res.status(501).json({ error: "Method not implemented" });
    }
    next();
});
