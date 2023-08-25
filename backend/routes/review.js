// imports
const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../config/database");

const Todo = require("../models/Todo");
const Review = require("../models/Review");
const Image = require("../models/Image");

// vars
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


// routers
router.get("/", async (req, res, next) => {
  try {
    const reviews = await Review.selectAll();
    res.status(200).json(reviews);
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.post("/new", reviewUpload, async (req, res, next) => {
  try {
    const review = req.body;

    let fileId;
    if (req.files.file) {
      const fileName = req.files.file[0].filename;
      const filePath = `${url}/${fileName}`;
      fileId = await Image.insert({ fileName, filePath});
    } else { fileId = defaultImageId; }
    review.fileId = fileId;

    const reviewId = await Review.insert(review);

    await Todo.updateReviewByOne("id", parseInt(review.todoId), reviewId);

    res.status(200).json({ id: reviewId });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.put("/:id", reviewUpload, async (req, res, next) => {
  try {
    const id = req.params.id;
    const file = req.files.file;
    const review = req.body;
    const isDeleted = JSON.parse(req.body.isDeleted);

    // case 1: 기존 사진 교체
    if ((file != undefined) && isDeleted) {
      const fileId = await Review.selectPhotoByOne("id", id);
      const fileName = file[0].filename;
      const filePath = `${url}/${fileName}`;
      await Image.updateByOne("id", fileId, { fileName, filePath});
    }
    // case 2: 기본이미지에서 사진 추가
    else if ((file != undefined) && !isDeleted) {
      const fileName = file[0].filename;
      const filePath = `${url}/${fileName}`;
      const fileId = await Image.insert({ fileName, filePath });
      await Review.updatePhotoByOne("id", id, fileId);
    }
    // case 3: 기존 사진 삭제, 기본이미지로 변경
    else if ((file == undefined) && isDeleted) {
      const fileId = await Review.selectPhotoByOne("id", id);
      await Image.deleteByOne("id", fileId);
      await Review.updatePhotoByOne("id", id, defaultImageId);
    }
    // case 4: 기존 사진 유지 OR 기본이미지 유지
    // -> 아무 처리 없음

    await Review.updateContentByOne("id", id, review);
    res.status(200).json({ id, title: review.title });
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await Todo.updateReviewByOne("reviewId", id, null);
    await Review.deleteByOne("id", id);
    res.status(200).json({ id });
  } catch(err) {
    console.error(err);
    next(err);
  }
});


// exports
module.exports = router;