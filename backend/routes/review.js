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
const url = "http://localhost:8080/image";
const defaultImageId = 1;


router.get("/", async (req, res, next) => {
  try {
    const query = "select review.id, done_date, expression, place, review_content, review_photo_id, review_title, full_path from review, upload_file where review.review_photo_id=upload_file.id;"
    const result = await db.query(query);
    const datas = result[0];
    const reviews = await Promise.all(
      datas.map(async (data) => {
        const result = await db.query("select * from todo where reviewId=?;", [data.id]);
        const todo = result[0][0];
        todo.state = parseInt(todo.state.toString("hex"));
        return {
          id: data.id,
          photoId: data.review_photo_id,
          reviewPhoto: data.full_path,
          doneDate: data.done_date,
          reviewTitle: data.review_title,
          reviewContent: data.review_content,
          place: data.place,
          expression: data.expression,
          todo
        }
      })
    );
    res.status(200).json(reviews);
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.post("/new", reviewUpload, async (req, res, next) => {
  try {
    const { title, review, place, doneDate, expression, todoId } = req.body;
    let fileId;
    if (req.files.file) { 
      const fileName = req.files.file[0].filename;
      const filePath = `${url}/${fileName}`;
      const fileQuery = "insert into upload_file(full_path, original_file_name) value(?, ?);";
      const fileResult = await db.query(fileQuery, [filePath, fileName]);
      fileId = fileResult[0].insertId;
    } else { fileId = defaultImageId; }

    const reviewQuery = "insert into review(done_date, expression, place, review_content, review_photo_id, review_title) value(?, ?, ?, ?, ?, ?);";
    const reviewResult = await db.query(reviewQuery, [doneDate, expression, place, review, fileId, title]);
    const reviewId = reviewResult[0].insertId;

    const todoQuery = "update todo set reviewId=? where id=?;";
    await db.query(todoQuery, [reviewId, parseInt(todoId)]);
    
    res.status(200).json({ id: reviewId });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.put("/:id", reviewUpload, async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(id);
    const file = req.files.file;
    const { title, review, place, doneDate, expression, todoId } = req.body;
    const isDeleted = JSON.parse(req.body.isDeleted);

    if ((file != undefined) && isDeleted) {
      // console.log("case 1");
      const result = await db.query("select review_photo_id from review where id=?", [id]);
      const fileId = result[0][0].review_photo_id;
      const fileName = file[0].filename;
      const filePath = `${url}/${fileName}`;
      await db.query("update upload_file set full_path=?, original_file_name=? where id=?;", [filePath, fileName, fileId]);
    }
    else if ((file != undefined) && !isDeleted) {
      // console.log("case 2");
      const fileName = file[0].filename;
      const filePath = `${url}/${fileName}`;
      const result = await db.query("insert into upload_file(full_path, original_file_name) value(?, ?);", [filePath, fileName]);
      const fileId = result[0].insertId;
      await db.query("update review set review_photo_id=? where id=?;", [fileId, id]);
    }
    else if ((file == undefined) && isDeleted) {
      // console.log("case 3");
      const result = await db.query("select review_photo_id from review where id=?", [id]);
      const fileId = result[0][0].review_photo_id;
      await db.query("delete from upload_file where id=?;", [fileId]);
      await db.query("update review set review_photo_id=? where id=?;", [defaultImageId, id]);
    }
    // else if ((file == undefined) && !isDeleted) console.log("case 4");

    const reviewQuery = "update review set done_date=?, expression=?, place=?, review_content=?, review_title=? where id=?;";
    await db.query(reviewQuery, [doneDate, expression, place, review, title, id]);
    res.status(200).json({ id, title });
  } catch(err) {
    console.error(err);
    next(err);
  }
});


module.exports = router;