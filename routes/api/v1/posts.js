const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../../../middleware/auth');
const router = express.Router();

const User = require('../../../models/User');
const Profile = require('../../../models/Profile');
const Post = require('../../../models/Post');

// @route   POST api/posts
// @desc    Create a new post
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      await newPost.save((err, post) => {
        if (err) throw err;
        res.json(post);
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
)

// @route   GET api/posts
// @desc    Get All Posts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json({ posts });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

// @route   GET api/posts/:id
// @desc    Get Post by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    res.json(post);
  } catch (err) {
    console.error(err.message);

    if(err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.status(500).send('Server Error');
  }
})

// @route   DELETE api/posts/:post_id
// @desc    Delete a post by ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {

    var post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ msg: 'Post not found'});

    // Check if the user deleting the post is the owner of the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to delete this post' });
    }

    await post.remove();

    res.status(201).json({ msg: `Post ${req.params.id} deleted` });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

module.exports = router;
