const express = require("express");
const router = express.Router();
const fs = require("fs");
const ObjectID = require("mongodb").ObjectID;
const Post = require("../database/models/post");

// GET ALL
router.get("/", async (req, res) => {
  const posts = await Post.find({});
  console.log(posts);
  res.render("pages/home", { posts: posts });
});

router.get("/about", (req, res) => {
  res.render("pages/about");
});

router.get("/post/:id", async (req, res) => {
  let postId = req.params.id;
  const post = await Post.findById(postId);
  res.render("pages/post", { post: post });
});

router.get("/edit/:id", async (req, res) => {
  let postId = req.params.id;
  const post = await Post.findById(postId);
  res.render("pages/edit", { post: post });
});

// UPDATE
router.post("/edit/:id", (req, res) => {
  let postId = req.params.id;

  let query = { _id: ObjectID(postId) };

  Post.updateOne(query, req.body, { upsert: true }, (err, post) => {
    if (err) {
      return res.status(500).send(err);
    }
    console.log("Mis à jour avec succés");
    res.redirect("/");
  });
});

// DELETE
router.get("/delete/:id", (req, res) => {
  let postId = req.params.id;

  let query = { _id: ObjectID(postId) };

  Post.find(query, (err, post) => {
    if (err) {
      return res.status(500).send(err);
    }
    let image = post[0].image;
    console.log(image);
    fs.unlink(`${image}`, (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      Post.deleteOne(query, (err, result) => {
        if (err) {
          return res.status(500).send(err);
        }
        console.log("Supprimé avec succès");
        res.redirect("/");
      });
    });
  });
});

router.get("/contact", (req, res) => {
  res.render("pages/contact");
});

router.get("/posts/new", (req, res) => {
  res.render("pages/create");
});

// ADD
router.post("/posts/store", (req, res) => {
  if (!req.files) {
    return res.status(400).send("Aucun fichier n'a été téléchargé.");
  }
  let image = req.files.image;

  image.mv(`public/posts/${image.name}`, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    Post.create(
      {
        ...req.body,
        image: `public/posts/${image.name}`,
      },
      (error, post) => {
        console.log("Ajouter avec succès");
        res.redirect("/");
      }
    );
  });
});

module.exports = router;
