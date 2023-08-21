const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../config/database");


const router = express.Router();
const upload = multer({
  storage: multer.diskStorage({
      destination(req, file, cb) { cb(null, "uploads/"); },
      filename(req, file, cb) {
        const ext = path.extname(file.originalname);
        const newFileName = path.basename(file.originalname, ext) + Date.now() + ext;
        cb(null, newFileName);
      }
    }),
  limits: { fileSize: 5 * 1024 * 1024 }
});
const reviewUpload = upload.fields([
  { name: "title" },
  { name: "review" },
  { name: "place" },
  { name: "doneDate" },
  { name: "expression" },
  { name: "todoId" },
  { name: "file" }
]);

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("select * from review, upload_file where review.review_photo_id=upload_file.id;");
    const datas = result[0];
    const reviews = datas.map((data) => {
      return {
        id: data.id,
        photoId: data.review_photo_id,
        reviewPhoto: data.full_path,
        doneDate: data.done_date,
        title: data.review_title,
        review: data.review_content,
        place: data.place,
        expression: data.expression,
        todoId: data.todoId
      }
    });
    res.status(200).json(reviews);
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.post("/new", reviewUpload, async (req, res, next) => {
  try {
    console.log(req.body);
    console.log(req.body.file);
    // const { title, review, place, doneDate, expression, todoId, file } = req.body;
    // const fileQuery = "insert into upload_file(full_path, original_file_name) value(?, ?);";
    // const filePath = 
    // const fileResult = await db.query(fileQuery, []);
    // const reviewQuery = "insert into review(done_date, expression, place, review_content, review_photo_id, ) value();"
  } catch (err) {
    console.log("asdf");
    console.error(err);
    next(err);
  }
});


module.exports = router;