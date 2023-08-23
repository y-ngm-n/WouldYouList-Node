const db = require("../config/database");
const Todo = require("./Todo");


class Review {

  static #field = {
    "id": "id",
    "photoId": "review_photo_id",
    "reviewPhoto": "full_path",
    "doneDate": "done_date",
    "reviewTitle": "review_title",
    "reviewContent": "review_content",
    "expression": "expression",
    "place": "place"
  };
  static #prop = {
    "id": "id",
    "review_photo_id": "photoId",
    "full_path": "reviewPhoto",
    "done_date": "doneDate",
    "review_title": "reviewTitle",
    "review_content": "reviewContent",
    "expression": "expression",
    "place": "place"
  };

  static async selectAll() {
    try {
      const query = "select review.id, done_date, expression, place, review_content, review_photo_id, review_title, full_path from review, upload_file where review.review_photo_id=upload_file.id;"
      const result = await db.query(query);
      const datas = result[0];
      const reviews = await Promise.all(
        datas.map(async (data) => {
          const todos = await Todo.selectByOne("reviewId", data.id);
          const todo = todos[0];
          return {
            [this.#prop.id]: data.id,
            [this.#prop.review_photo_id]: data.review_photo_id,
            [this.#prop.full_path]: data.full_path,
            [this.#prop.done_date]: data.done_date,
            [this.#prop.review_title]: data.review_title,
            [this.#prop.review_content]: data.review_content,
            [this.#prop.place]: data.place,
            [this.#prop.expression]: data.expression,
            todo
          }
        })
      );
      return reviews;
    } catch(err) { return err; }
  }

  static async selectPhotoByOne(prop, value) {
    try {
      const query = `select review_photo_id from review where ${this.#field[prop]}=?;`;
      const result = await db.query(query, [value]);
      const photoId = result[0][0].review_photo_id;
      return photoId;
    } catch(err) { return err; }
  }

}


module.exports = Review;