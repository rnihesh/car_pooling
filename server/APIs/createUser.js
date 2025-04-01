const User = require("../models/user.model.js");

async function createUser(req, res) {
  const newUser = req.body;
  const userInDb = await User.findOne({ email: newUser.email });
  if (userInDb !== null) {
    res.status(200).send({ message: newUser.firstName, payload: userInDb });
  } else {
    let newUser1 = new User(newUser);
    let newUserDoc = await newUser1.save();
    res
      .status(201)
      .send({ message: newUserDoc.firstName, payload: newUserDoc });
  }
}

module.exports = createUser;
