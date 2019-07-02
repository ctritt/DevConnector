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

    res.status(201).json({ msg: `Post ${req.params.id} removed` });

  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

// @route   PUT api/posts/like/:id
// @desc    Like a post by ID
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ msg: 'Post not found'});

    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({ msg: 'Post has already been liked by user' });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
})

// @route   PUT api/posts/unlike/:id
// @desc    Unlike a post by ID
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ msg: 'Post not found'});

    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json({ msg: 'Post has not been liked by user' });
    }

    // Get remove index
    const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
})

// @route   POST api/posts/comment/:id
// @desc    Add a comment to a post
// @access  Private
router.post(
  '/comment/:id',
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
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json({ comments: post.comments });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
)

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete comment
// @access  Private

router.delete('/:id/comment/:comment_id', auth, async (req, res) => {
  try {
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found'});
    }

    // const commentIndex = post.comments.map(item => item.id.toString()).indexOf(req.params.comment_id);
    // console.log(commentIndex);

    // if (commentIndex === -1){
    //   return res.status(404).json({ msg: 'Comment not found'});
    // }
    
    // const comment = post.comments[commentIndex];
    
    // console.log(req.user.id);
    // console.log(comment.user);

    const comment = post.comments.find(item => item.id === req.params.comment_id);

    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found'});
    }

    // if (req.user.id !== post.user || req.user.id !== comment.user) {
    //   return res.status(401).json({ msg: 'User is not authorized to delete this comment' });
    // }

    if (post.user.toString() !== req.user.id && comment.user.toString() !== req.user.id){
      return res.status(401).json({ msg: 'User is not authorized to delete this comment' });
    }

    const removeIndex = post.comments.map(item => item.id).indexOf(req.params.comment_id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Invalid Post or Comment ID' });
    }
    res.status(500).send('Server Error');
  }
})

module.exports = router;
