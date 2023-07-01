/* eslint-disable no-unused-vars */
const { request, response } = require("express");
const express = require('express');
const app = express();
const { Course, Moddule, SubModule, User, UserCourse } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const flash = require("connect-flash");
const localStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const saltRounds = 10;

app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(flash());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser("sshh! some secret string"));
// app.use(csrf({ cookie: true }));
// app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

app.use(
    session({
        secret: "my-super-secret-key-21728172615261562",
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(function (request, response, next) {
    response.locals.messages = request.flash();
    next();
});

passport.use(
    new localStrategy(
        {
            usernameField: "email",
            passwordField: "password",
        },
        (username, password, done) => {
            User.findOne({ where: { email: username } })
                .then(async (user) => {
                    const result = await bcrypt.compare(password, user.password);
                    if (result) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: "Invalid password" });
                    }
                })
                .catch((error) => {
                    return done(null, false, { message: "Invalid Email or password" });
                });
        }
    )
);

passport.serializeUser((user, done) => {
    console.log("Serializing user in session : ", user.id);
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    console.log("deserializing user from session: ", id);
    User.findByPk(id)
        .then((users) => {
            done(null, users);
        })
        .catch((error) => {
            done(error, null);
        });
});

function requireTeacher(req, res, next) {
    if (req.user && req.user.role === "teacher") {
        return next();
    } else {
        res.status(401).json({ message: "Unauthorized user" });
    }
}

app.get("/login", (request, response) => {
    response.render("login", { title: "Login" });
});


app.get("/", (request, response) => {
    response.render("index", { title: "Login" });
});

app.get("/signup", (request, response) => {
    response.render("signup", { title: "Login" });
});

app.post("/users", async (request, response) => {
    if (
        request.body.firstName.length != 0 &&
        request.body.email.length != 0 &&
        request.body.password.length == 0
    ) {
        request.flash("error", "Password can not be Empty");
        return response.redirect("/signup");
    }
    const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
    try {
        const user = await User.create({
            firstName: request.body.firstName,
            lastName: request.body.lastName,
            email: request.body.email,
            password: hashedPwd,
            // password: request.body.password,
            dateOfBirth: request.body.dateOfBirth,
            standard: request.body.standard,
            role: request.body.role,
            isAdmin: false,
        });
        request.login(user, (err) => {
            if (err) {
                console.log(err);
            }
            response.redirect("/home");
        });
    } catch (error) {
        console.log(error);
        // return response.status(422).json(error);
        if (error.name == "SequelizeValidationError") {
            const errMsg = error.errors.map((error) => error.message);
            console.log("flash errors", errMsg);
            errMsg.forEach((message) => {
                if (message == "Validation notEmpty on firstName failed") {
                    request.flash("error", "First Name cannot be empty");
                }
                if (message == "Validation notEmpty on email failed") {
                    request.flash("error", "Email cannot be empty");
                }
            });
            response.redirect("/signup");
        } else if (error.name == "SequelizeUniqueConstraintError") {
            const errMsg = error.errors.map((error) => error.message);
            console.log(errMsg);
            errMsg.forEach((message) => {
                if (message == "email must be unique") {
                    request.flash("error", "Email already used");
                }
            });
            response.redirect("/signup");
        } else {
            console.log(error);
            return response.status(422).json(error);
        }
    }
});

app.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    async (request, response) => {
        console.log(request.user);
        response.redirect("/home");
    }
);

app.get("/signout", (request, response, next) => {
    request.logout((err) => {
        if (err) {
            return next(err);
        }
        response.redirect("/");
    });
});


app.get(
    "/home", connectEnsureLogin.ensureLoggedIn(),
    async (request, response, next) => {
        try {
            const user = request.user;
            const userName = user.firstName + " " + user.lastName;
            const upcomingCourses = await Course.getAllUpcomingCourses();
            let isInstructor = false;
            if (user.role === "teacher") {
                isInstructor = true;
            }


            if (request.accepts("html")) {
                response.render("home", {
                    upcomingCourses,
                    isInstructor,

                });
            } else {
                response.json({
                    upcomingCourses,
                    isInstructor,

                });
            }
        } catch (error) {
            console.log(error);
            return response.status(422).json(error);
        }

    }
);



app.get(
    "/createCourse", requireTeacher, connectEnsureLogin.ensureLoggedIn(),
    async (request, response, next) => {
        response.render("createCourse");
    }
);
app.get(
    "/about",
    async (request, response, next) => {
        response.render("about");
    }
);
app.get(
    "/myCourses", connectEnsureLogin.ensureLoggedIn(),
    async (request, response, next) => {
        const user = request.user;
        const userName = user.firstName + " " + user.lastName;
        const userCourseIds = await UserCourse.getAllUpcomingUserCourses(user.id);
        let myCoursesList = [];
        for (let i = 0; i < userCourseIds.length; i++) {
            myCoursesList.push(await Course.getCourse(userCourseIds[i].courseId))
        }
        console.log("..........", myCoursesList)
        if (request.accepts("html")) {
            response.render("myCourses", {
                myCoursesList,
                // isInstructor,

            });
        } else {
            response.json({
                myCoursesList,
                // isInstructor,

            });
        }
    }
);

app.get(
    "/changePassword",
    connectEnsureLogin.ensureLoggedIn(),
    async (request, response) => {
        response.render("changePassword", {
            userName: request.user.firstName + " " + request.user.lastName,
            title: "Change Password",
        });
    }
);

app.post(
    "/changePassword",
    connectEnsureLogin.ensureLoggedIn(),
    async (request, response) => {
        const oldPassword = request.body.oldPassword;
        const newPassword = request.body.newPassword;
        try {
            const user = request.user;
            const oldHashedPassword = user.password;
            const isPasswordMatch = await bcrypt.compare(
                oldPassword,
                oldHashedPassword
            );
            if (!isPasswordMatch) {
                request.flash("error", "Invalid old password");
                return response.redirect("/changePassword");
            }
            const saltRounds = 10;
            const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
            user.password = newHashedPassword;
            await User.update(
                { password: user.password },
                { where: { id: user.id } }
            );
            request.flash("success", "Password changed successfully");
            response.redirect("/changePassword");
        } catch (error) {
            console.log(error);
            request.flash("error", "An error occurred while changing the password");
            response.redirect("/changePassword");
        }
    }
);



app.post("/createCourse", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    try {
        console.log("title....", request.body.title)
        const user = request.user;
        const userName = request.user.firstName + " " + request.user.lastName;
        const course = await Course.create({
            title: request.body.title,
            startDate: request.body.startDate,
            endDate: request.body.endDate,
            level: request.body.level,
            category: request.body.category,
            syllabus: request.body.syllabus.split(","),
            prerequisites: request.body.prerequisites,
            image: request.body.imageUrl,
            // price: request.body.price,
            description: request.body.description,
            instructorId: user.id,
            instructor: userName,
            enrolledStudents: null,
            rating: null,
            resources: null,
            duration: null,
        });

        const courseId = course.id;
        await UserCourse.addUser(user.id, courseId);
        await Course.updateStudents(
            course.enrolledStudents + 1,
            courseId
        );
        await course.save();

        return response.redirect("/home");

    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

app.get(
    "/course/:id", connectEnsureLogin.ensureLoggedIn(),
    async (request, response, next) => {
        try {
            const user = request.user;
            // const userName = user.firstName + " " + user.lastName;
            const courseId = request.params.id;
            const courseDetails = await Course.getCourse(courseId);
            const isJoined = await UserCourse.isUserJoined(user.id, courseId);
            let isInstructor = false;
            if (user.id === courseDetails.instructorId) {
                isInstructor = true;
            }

            if (request.accepts("html")) {
                response.render("courseDetails", {
                    courseDetails,
                    courseId,
                    isJoined,
                    isInstructor,

                });
            } else {
                response.json({
                    courseDetails,
                    courseId,
                    isJoined

                });
            }
        } catch (error) {
            console.log(error);
            return response.status(422).json(error);
        }
    }
);

app.post(
    "/course/:id/enroll",
    connectEnsureLogin.ensureLoggedIn(),
    async (request, response) => {
        try {
            const courseId = request.params.id;
            const course = await Course.getCourse(courseId);
            const user = request.user;
            await UserCourse.addUser(user.id, courseId);
            await Course.updateStudents(
                course.enrolledStudents + 1,
                courseId
            );
            await course.save();
            // response.redirect(`/sessions/${sessionId}`);
            return response.json({ success: true });
        } catch (error) {
            console.log(error);
            return response.status(422).json(error);
        }
    }
);

app.get(
    "/course/:id/moduleList", connectEnsureLogin.ensureLoggedIn(),
    async (request, response, next) => {
        try {
            // const user = request.user;
            // const userName = user.firstName + " " + user.lastName;
            const courseId = request.params.id;
            const courseDetails = await Course.getCourse(courseId);
            const moduleDetails = await Moddule.getCourseModules(courseId);
            // const subModuleDetails = await Moddule.getCourseSubModules(courseId);
            let isInstructor = false;
            if (request.user.id === courseDetails.instructorId) {
                isInstructor = true;
            }

            if (request.accepts("html")) {
                response.render("moduleList", {
                    courseDetails,
                    courseId,
                    moduleDetails,
                    isInstructor

                });
            } else {
                response.json({
                    courseDetails,
                    courseId,
                    moduleDetails,
                    isInstructor

                });
            }
        } catch (error) {
            console.log(error);
            return response.status(422).json(error);
        }
    }
);

app.get(
    "/course/:id/createModule", requireTeacher, connectEnsureLogin.ensureLoggedIn(),
    async (request, response, next) => {
        try {
            // const user = request.user;
            // const userName = user.firstName + " " + user.lastName;
            const courseId = request.params.id;
            const courseDetails = await Course.getCourse(courseId);

            if (request.accepts("html")) {
                response.render("createModule", {
                    courseDetails,
                    courseId
                });
            } else {
                response.json({
                    courseDetails,
                    courseId

                });
            }
        } catch (error) {
            console.log(error);
            return response.status(422).json(error);
        }
    }
);

app.post("/createModule/:id", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    try {
        console.log("title....", request.body.title)
        const courseId = request.params.id;

        const course = await Moddule.create({
            title: request.body.title,
            order: request.body.order,
            description: request.body.description,
            imageLink: request.body.imageLink,
            videoLink: request.body.videoLink,
            courseId: courseId
        });

        return response.redirect(`/course/${courseId}/moduleList`);

    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

app.get(
    "/course/:courseId/module/:moduleId/moduleDetails", connectEnsureLogin.ensureLoggedIn(),
    async (request, response, next) => {
        try {
            // const user = request.user;
            // const userName = user.firstName + " " + user.lastName;
            const courseId = request.params.courseId;
            const moduleId = request.params.moduleId;
            const courseDetails = await Course.getCourse(courseId);
            const moduleDetails = await Moddule.getModule(moduleId);
            const subModuleDetails = await SubModule.getCourseSubModules(moduleId);
            let isInstructor = false;
            if (request.user.id === courseDetails.instructorId) {
                isInstructor = true;
            }

            if (request.accepts("html")) {
                response.render("moduleDetails", {
                    courseDetails,
                    moduleDetails,
                    courseId,
                    moduleId,
                    subModuleDetails,
                    isInstructor
                });
            } else {
                response.json({
                    courseDetails,
                    moduleDetails,
                    courseId,
                    moduleId,
                    subModuleDetails,
                    isInstructor
                });
            }
        } catch (error) {
            console.log(error);
            return response.status(422).json(error);
        }
    }
);

app.get(
    "/module/:id/createSubModule", requireTeacher, connectEnsureLogin.ensureLoggedIn(),
    async (request, response, next) => {
        try {
            // const user = request.user;
            // const userName = user.firstName + " " + user.lastName;
            const moduleId = request.params.id;
            const moduleDetails = await Moddule.getModule(moduleId);

            if (request.accepts("html")) {
                response.render("createSubModule", {
                    moduleDetails,
                    moduleId
                });
            } else {
                response.json({
                    moduleDetails,
                    moduleId

                });
            }
        } catch (error) {
            console.log(error);
            return response.status(422).json(error);
        }
    }
);

app.post("/createSubModule/:id", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    try {
        console.log("title....", request.body.title)
        const moduleId = request.params.id;

        const course = await SubModule.create({
            title: request.body.title,
            order: request.body.order,
            description: request.body.description,
            imageLink: request.body.imageLink,
            videoLink: request.body.videoLink,
            moduleId: moduleId
        });

        return response.redirect(`/course/${moduleId}/moduleList`);

    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

app.get(
    "/module/sub/:subModuleId/subModuleDetails", connectEnsureLogin.ensureLoggedIn(),
    async (request, response, next) => {
        try {
            // const user = request.user;
            // const userName = user.firstName + " " + user.lastName;
            // const courseId = request.params.courseId;
            const moduleId = request.params.subModuleId;
            // const courseDetails = await Course.getCourse(courseId);
            // const moduleDetails = await Moddule.getModule(moduleId);
            const subModuleDetails = await SubModule.getSubModule(moduleId);

            if (request.accepts("html")) {
                response.render("subModuleDetails", {
                    // courseDetails,
                    // moduleDetails,
                    // courseId,
                    moduleId,
                    subModuleDetails
                });
            } else {
                response.json({
                    // courseDetails,
                    // moduleDetails,
                    // courseId,
                    moduleId,
                    subModuleDetails
                });
            }
        } catch (error) {
            console.log(error);
            return response.status(422).json(error);
        }
    }
);


module.exports = app;