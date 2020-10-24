/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
let mongodb = require("mongodb"); 
let mongoose = require("mongoose");

const URI = `mongodb+srv://adi:${process.env.PW}@cluster0.azfi6.mongodb.net/personal_library?retryWrites=true&w=majority`;
2;
mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });

let bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: [String]
});

let Book = mongoose.model("Book", bookSchema);

module.exports = function(app) {
  app
    .route("/api/books")
    .get(function(req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let booksArray = [];

      Book.find({}, (err, findBooks) => {
        if (!err && findBooks) {
          findBooks.forEach(bookFind => {
            let book = JSON.parse(JSON.stringify(bookFind));
            book["commentcount"] = book.comments.length;
            delete book["comments"];
            booksArray.push(book);
          });
          return res.json(booksArray);
        }
      });
    })

    .post(function(req, res) {
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) return res.json("missing title");

      let newBook = new Book({ title, comments: [] });

      newBook.save((err, savedBook) => {
        if (!err && savedBook) res.json(savedBook);
      });
    })

    .delete(function(req, res) {
      //if successful response will be 'complete delete successful'
      Book.remove({}, (err, deletedStatus) => {
        if (!err && deletedStatus) {
          return res.json("complete delete successful");
        }
      });
    });

  app
    .route("/api/books/:id")
    .get(function(req, res) {
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findById(bookid, (err, result) => {
        if (!err && result) {
          return res.json(result);
        } else if (!result) {
          return res.json("no book exists");
        }
      });
    })

    .post(function(req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      Book.findByIdAndUpdate(
        bookid,
        { $push: { comments: comment } },
        { new: true, useFindAndModify: false },
        (err, updatedBook) => {
          if (!err && updatedBook) {
            return res.json(updatedBook);
          } else if (!updatedBook) {
            return res.json("no book exists");
          }
        }
      );
    })

    .delete(function(req, res) {
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      Book.findByIdAndRemove(
        bookid,
        { new: true, useFindAndModify: false },
        (err, deletedBook) => {
          if (!err && deletedBook) {
            return res.json("delete successful");
          } else if (!deletedBook) {
            return res.json("no book exists");
          }
        }
      );
    });
};
