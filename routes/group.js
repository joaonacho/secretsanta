const router = require("express").Router();
const nodemailer = require("nodemailer");
// Require the User model in order to interact with the database
const User = require("../models/User.model");
const Group = require("../models/Group.model");
const Comment = require("../models/Comment.model");

//Cloudinary
const fileUploader = require("../config/cloudinary.config");

const mongoose = require("mongoose");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");
const isGroupAdmin = require("../middleware/isGroupAdmin");

//GET Create group
router.get("/creategroup", (req, res) => {
	res.render("group/creategroup");
});

//POST Create group
router.post("/creategroup", fileUploader.single("groupImg"), (req, res, next) => {
	const { groupName, description, price, existingImage } = req.body;
	let admin = req.session.user._id;
	let users = [req.session.user._id];

	let groupImg;
	if (req.file) {
		groupImg = req.file.path;
	} else {
		groupImg = existingImage;
	}

	Group.findOne({ groupName })
		.then((newGroup) => {
			if (!newGroup) {
				Group.create({
					admin,
					groupName,
					description,
					users,
					price,
					groupImg,
				})
					.then((createdGroup) => {
						return User.findByIdAndUpdate(admin, {
							$push: { groups: createdGroup._id },
						});
					})
					.then((user) => {
						res.redirect(`/user/profile/${admin}`);
					});
			}
		})
		.catch((error) => {
			next(error);
		});
});

//GET View group
router.get("/group/:id", (req, res) => {
	const { id } = req.params;

	Group.findById(id)
		.populate("users")
		.populate("comments")
		.then((group) => {
			const admin = group.admin.toString() === req.session.user._id;
			req.session.groupAdmin = group.admin.toString();

			res.render("group/group", { group, admin });
		});
});

//GET Edit group
router.get("/group/edit/:id", isGroupAdmin, (req, res) => {
	const { id } = req.params;

	Group.findById(id)
		.populate("users")
		.then((group) => {
			res.render("group/editgroup", { group });
		});
});

//POST Edit group
router.post("/edit/:id", fileUploader.single("groupImg"), (req, res, next) => {
	const { id } = req.params;

	const { groupName, description, price, existingImage } = req.body;

	let groupImg;
	if (req.file) {
		groupImg = req.file.path;
	} else {
		groupImg = existingImage;
	}

	Group.findByIdAndUpdate(
		id,
		{
			groupName,
			description,
			price,
			groupImg,
		},
		{ new: true }
	)
		.then(() => {
			res.redirect(`/group/group/${id}`);
		})
		.catch((error) => {
			next(error);
		});
});

//GET add friends
router.get("/add/:groupId", isGroupAdmin, (req, res) => {
	const { groupId } = req.params;

	Group.findById(groupId)
		.populate("users")
		.then((group) => {
			res.render("group/addfriends", { group });
		});
});

//GET user not found
router.get("/user-not-found", (req, res) => {
	res.render("group/user-not-found");
});

//POST add friends
router.post("/add/:groupId", (req, res, next) => {
	const { groupId } = req.params;
	const email = req.body.email;
	let group;

	Group.findById(groupId).then((groupFound) => {
		group = groupFound.users;
	});
	//first try to find the user
	User.findOne({ email })
		.then((userFound) => {
			if (!userFound) {
				console.log("no user found");
			} else if (userFound && group.includes(userFound._id) === true) {
				console.log("user is already in the group");
				return;
			} else if (userFound && group.includes(userFound._id) === false) {
				return User.findOneAndUpdate({ email }, { $push: { groups: groupId } }, { new: true }).then(() => {
					console.log("user updated");
				});
			}
		})
		.finally(() => {
			User.findOne({ email }).then((user) => {
				if (!user) {
					res.redirect(`/group/user-not-found`);
					return;
				} else if (user && group.includes(user._id) === true) {
					res.redirect(`/group/user-not-found`);
					return;
				} else if (group.includes(user.id) === false) {
					return Group.findByIdAndUpdate(groupId, { $push: { users: user.id } }, { new: true }).then(() => {
						res.redirect(`/group/add/${groupId}`);
					});
				}

				// return res.redirect(`/group/add/${groupId}`);
			});
		})
		.catch((error) => {
			next(error);
		});
});

//GET delete group
router.get("/group/delete/:id", isGroupAdmin, (req, res) => {
	const { id } = req.params;

	Group.findById(id).then((groupDelete) => {
		res.render("group/deletegroup", { groupDelete });
	});
});

// POST Delete group
router.post("/group/delete/:id", (req, res, next) => {
	const { id } = req.params;

	Group.findByIdAndDelete(id)
		.then(() => {
			res.redirect(`/user/profile/${req.session.user._id}`);
		})
		.catch((error) => {
			next(error);
		});
});

//Get Shuffle group
router.get("/shuffle/:groupId", isGroupAdmin, (req, res) => {
	const { groupId } = req.params;

	Group.findById(groupId)
		.populate("users")
		.then((groupShuffle) => {
			res.render("group/shufflegroup", { groupShuffle });
		});
});

//POST Shuffle group
router.post("/shuffle/:groupId", (req, res, next) => {
	const { groupId } = req.params;

	Group.findById(groupId)
		.populate("users")
		.then((groupUsers) => {
			const users = groupUsers.users;
			let userId = [];

			users.forEach((user) => {
				return userId.push(user._id);
			});

			//Shuffle the array
			let randomPos;
			let temp;

			for (let i = userId.length - 1; i > 0; i--) {
				randomPos = Math.floor(Math.random() * (i + 1));
				temp = userId[i];
				userId[i] = userId[randomPos];
				userId[randomPos] = temp;
			}

			//Make the pairs
			let idPairs = [];
			for (let i = 0; i < userId.length; i++) {
				if (i === userId.length - 1) {
					idPairs.push(userId[i], userId[0]);
				} else {
					idPairs.push(userId[i], userId[i + 1]);
				}
			}

			return idPairs;
		})
		//Updating group pairs (works)
		.then((idPairs) => {
			Group.findByIdAndUpdate(groupId, { $push: { pairs: idPairs }, shuffled: "" }, { new: true }).then(() => {
				console.log("Shuffle success");
				res.redirect(`/group/group/${groupId}`);
			});
		});
});

//POST send email
router.post("/sendemail/:groupId", (req, res, next) => {
	const { groupId } = req.params;

	Group.findById(groupId)
		.populate("pairs")
		.then((groupPairs) => {
			let pairs = groupPairs.pairs;
			let pairEmails = [];
			let pairUsername = [];

			pairs.forEach((email) => {
				pairEmails.push(email.email);
			});

			pairs.forEach((username) => {
				pairUsername.push(username.username);
			});

			let uniqueEmail = [...new Set([...pairEmails])];
			let usernames = pairUsername.slice(1, pairUsername.length);
			let uniqueUsername = [...new Set([...usernames])];

			const message = `Your webstie`;

			let transporter = nodemailer.createTransport({
				service: "Gmail",
				auth: {
					user: "webstie@andregregorio.pt",
					pass: "Web.Bestie2022",
				},
			});

			uniqueEmail.forEach((email, index) => {
				transporter.sendMail({
					from: '"Webstie" <web.bestie2022@gmail.com>',
					to: email,
					subject: "Find who is your secret friend!",
					text: message,
					html: `
          <h1 style="align-text: center;">Hello from Webstie!</h1>          

          <p style="align-text: center;"><b>${message} is ${uniqueUsername[index]}!</b></p>

          <p>You can check your webstie's interests by clicking in his/her name in the group page.
          `,
				});
			});
		});

	res.redirect(`/group/group/${groupId}`);
});

//POST Comments
router.post("/comment/:groupId", (req, res, next) => {
	const { groupId } = req.params;
	const { content } = req.body;
	let user = req.session.user.username;

	const currentDate = new Date();
	const date = currentDate.toLocaleString();

	Comment.create({ content, user, date }).then((comment) => {
		let newComment = [comment];

		Group.findByIdAndUpdate(groupId, { $push: { comments: newComment } }, { new: true }).then(() => {
			res.redirect(`/group/group/${groupId}`);
		});
	});
});

module.exports = router;
