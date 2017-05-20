module.exports = (req, res, next) => {
  if (req.user) {
    console.log('user logged in');
    next();
  } else {
    res
    .status(401)
    .json({
      error: 'unauthorized'
    });
  }
};
