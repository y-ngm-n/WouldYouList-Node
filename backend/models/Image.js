const db = require("../config/database");


class Image {

  // object -> database
  static #field = {
    "id": "id",
    "imagePath": "full_path",
    "imageName": "original_file_name"
  }
  // database -> object
  static #prop = {
    "id": "id",
    "full_path": "imagePath",
    "original_file_name": "imageName"
  }

  static async insert(image) {
    try {
      const query = "insert into upload_file(full_path, original_file_name) value(?, ?);";
      const result = await db.query(query, [image.filePath, image.fileName]);
      const imageId = result[0].insertId;
      return imageId;
    } catch(err) { return err; }
  }

  static async updateByOne(prop, value, image) {
    try {
      const query = `update upload_file set full_path=?, original_file_name=? where ${this.#field[prop]}=?;`;
      await db.query(query, [image.filePath, image.fileName, value]);
    } catch(err) { return err; }
  }

  static async deleteByOne(prop, value) {
    try {
      const query = `delete from upload_file where ${this.#field[prop]}=?;`;
      await db.query(query, [value]);
    } catch(err) { return err; }
  }

}


module.exports = Image;