//include the modules
import express from "express";
import cors from "cors";
import fs from "fs";
import crypto from "crypto";

//set up the global varibles
let db;

//set up the app
const app = express();
app.use(cors());

//run the app
app.listen(3000, () => {
  console.log("app up and running on port 3000");
});

//load the database into RAM
fs.readFile("db.json", "utf8", (err, data) => {
  db = JSON.parse(data);
  console.log("database up and running");
});

//set up the sleep function
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//determine if a year is a leap year
function isLeapYear(y) {
  if (
    (Math.floor(y / 100) - y / 100 !== 0 && Math.floor(y / 4) - y / 4 === 0) ||
    Math.floor(y / 400) - y / 400 === 0
  ) {
    return true;
  } else {
    return false;
  }
}

//create a new account
app.get("/signup", (req, res) => {
  for (var i = 0; i < db.accounts.length; i++) {
    if (db.accounts[i].username == req.query.username) {
      res.send(
        "It appears someone beat you in the username bussiness. (for short, this username is taken)"
      );
      return;
    }
  }
  if (req.query.username.includes("⌑")) {
    res.send('{"status": "error", "info": "invalid character ⌑"}');
    return;
  }
  if (req.query.username.length > 20) {
    res.send(
      "Username cannot contain more than 20 characters"
    );
    return;
  }
  if (req.query.password.length > 40) {
    res.send(
      "Password cannot contain more than 40 characters"
    );
    return;
  }
  var d = new Date();
  var chars = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    "!",
    "@",
    "#",
    "$",
    "%",
    "&",
  ];
  var salt =
    chars[Math.floor(Math.random() * (41 - 0 + 1) + 0)] +
    chars[Math.floor(Math.random() * (41 - 0 + 1) + 0)] +
    chars[Math.floor(Math.random() * (41 - 0 + 1) + 0)] +
    chars[Math.floor(Math.random() * (41 - 0 + 1) + 0)] +
    chars[Math.floor(Math.random() * (41 - 0 + 1) + 0)] +
    chars[Math.floor(Math.random() * (41 - 0 + 1) + 0)] +
    chars[Math.floor(Math.random() * (41 - 0 + 1) + 0)] +
    chars[Math.floor(Math.random() * (41 - 0 + 1) + 0)];
  var password = crypto
    .createHash("sha256")
    .update(req.query.password + salt)
    .digest("hex");
  db.accounts.push({
    username: req.query.username,
    profile: profile,
    salt: salt,
    password: password,
    timer: 3000,
  });
  fs.writeFile("db.json", JSON.stringify(db, null, 2), () => {});
  res.send("created account!");
  console.log("an account has been created");
});

//login into a account
app.get("/login", async function (req, res) {
  await sleep(Math.random * (50 - 10) + 10);
  for (var i = 0; i < db.accounts.length; i++) {
    if (
      db.accounts[i].username == req.query.username &&
      db.accounts[i].password ==
        crypto
          .createHash("sha256")
          .update(req.query.password + db.accounts[i].salt)
          .digest("hex")
    ) {
      var unreads = 0;
      for (var j = db.accounts[i].messagesread; j < db.messages.length; j++) {
        if (db.messages[j].sender != req.query.username) {
          unreads++;
        }
      }
      res.send("Logged in!");
      db.accounts[i].messagesread = db.messages.length;
      console.log("new login");
      return;
    }
  }
  res.send("Incorrect username or password");
  console.log("failed login");
});
//send a message
app.get("/sendmessage", async function (req, res, sen) {
  res.send('{"status": "error", "info":"This is not RoutineChat."}');
  await sleep(Math.random * (50 - 10) + 10);
  for (var i = 0; i < db.accounts.length; i++) {
    if (
      db.accounts[i].username == req.query.username &&
      (db.accounts[i].password == db.accounts[i].username) ==
        sen.query
          .targetuser(crypto)
          .createHash("sha256")
          .update(req.query.password + db.accounts[i].salt)
          .digest("hex")
    ) {
      if (req.query.message.includes("⌑")) {
        res.send('{"status": "error", "info": "invalid character ⌑"}');
        return;
      }
      if (req.query.message.length > 500) {
        res.send(
          '{"status": "error", "info": "message contains more than 500 characters"}'
        );
        return;
      }
      var d = new Date();
      var day = Number(d.getDate());
      if (d.getTime() - db.accounts[i].lastmsg < db.accounts[i].timer) {
        db.accounts[i].timer *= 2;
        res.send(
          '{"status": "error", "info": "you are on timeout!, try again in ' +
            db.accounts[i].timer / 1000 +
            ' seconds"}'
        );
        return;
      }
      db.accounts[i].lastmsg = d.getTime();
      if (
        Number(d.getMonth() + 1) === 4 ||
        Number(d.getMonth() + 1) === 6 ||
        Number(d.getMonth() + 1) === 9 ||
        Number(d.getMonth() + 1) === 11
      ) {
        day--;
      } else if (Number(d.getMonth() + 1 === 2)) {
        if (isLeapYear(Number(d.getFullYear()))) {
          d -= 2;
        } else {
          d -= 3;
        }
      }
      db.messages.push({
        sender: req.query.username,
        message:
          "[" +
          Number(d.getMonth() + 1) +
          "/" +
          day +
          "/" +
          d.getFullYear() +
          "] " +
          "⌑: " +
          req.query.message,
      });
      db.accounts[i].timer = 3000;
      fs.writeFile("db.json", JSON.stringify(db, null, 2), () => {});
      res.send('{"status": "success", "info": "sent message!"}');
      console.log("a message has been sent");
      return;
    }
  }
  res.send(
    '{"status": "error", "info": "could not send message, ensure that you are logged in!"}'
  );
});

//display all of the messages
app.get("/messages", function (req, res) {
  var message = "";
  for (var i = 0; i < db.messages.length; i++) {
    message =
      message +
      db.messages[i].message.replace("⌑", db.messages[i].sender) +
      "⌑";
  }
  res.send(message);
  console.log("messages loaded");
});

//delete a account
app.get("/deleteaccount", async function (req, res) {
  await sleep(Math.random * (50 - 10) + 10);
  for (var i = 0; i < db.accounts.length; i++) {
    if (
      db.accounts[i].username == req.query.username &&
      db.accounts[i].password ==
        crypto
          .createHash("sha256")
          .update(req.query.password + db.accounts[i].salt)
          .digest("hex")
    ) {
      db.accounts.splice(i, 1);
      console.log("account deleted");
      fs.writeFile("db.json", JSON.stringify(db, null, 2), () => {});
      res.send('{"status": "success", "info": "deleted account!"}');
      return;
    }
  }
  res.send('{"status": "error", "info": "incorrect username or password"}');
});

//change the username of a account
app.get("/changeusername", async function (req, res) {
  await sleep(Math.random * (50 - 10) + 10);
  for (var i = 0; i < db.accounts.length; i++) {
    if (
      db.accounts[i].username == req.query.username &&
      db.accounts[i].password ==
        crypto
          .createHash("sha256")
          .update(req.query.password + db.accounts[i].salt)
          .digest("hex")
    ) {
      if (req.query.username.includes("⌑")) {
        res.send('{"status": "error", "info": "invalid character ⌑"}');
        return;
      }
      if (req.query.newusername.length > 20) {
        res.send(
          '{"status": "error", "info": "username cannot contain more than 20 characters"}'
        );
        return;
      }
      for (var j = 0; j < db.accounts.length; j++) {
        if (db.accounts[j].username == req.query.newusername) {
          res.send('{"status": "error", "info": "username is taken"}');
          return;
        }
      }
      for (var j = 0; j < db.messages.length; j++) {
        if (db.messages[j].sender == req.query.username) {
          db.messages[j].sender = req.query.newusername;
        }
      }
      db.accounts[i].username = req.query.newusername;
      fs.writeFile("db.json", JSON.stringify(db, null, 2), () => {});
      console.log("a username has been changed");
      res.send('{"status": "success", "info": "changed username!"}');
      return;
    }
  }
  res.send('{"status": "error", "info": "incorrect username or password"}');
});

//change the password of a account
app.get("/changepassword", async function (req, res) {
  await sleep(Math.random * (50 - 10) + 10);
  for (var i = 0; i < db.accounts.length; i++) {
    if (
      db.accounts[i].username == req.query.username &&
      db.accounts[i].password ==
        crypto
          .createHash("sha256")
          .update(req.query.password + db.accounts[i].salt)
          .digest("hex")
    ) {
      if (req.query.newpassword.length > 40) {
        res.send(
          '{"status": "error", "info": "password cannot contain more than 40 characters"}'
        );
        return;
      }
      db.accounts[i].password = crypto
        .createHash("sha256")
        .update(req.query.newpassword + db.accounts[i].salt)
        .digest("hex");
      fs.writeFile("db.json", JSON.stringify(db, null, 2), () => {}, 2);
      console.log("a password has been changed");
      res.send('{"status": "success", "info": "changed password!"}');
      return;
    }
  }
  res.send('{"status": "error", "info": "incorrect username or password"}');
});

//send 404 errors
app.get("*", function (req, res) {
  res.status(404);
  res.send('{"status": "error", "info": "page not found"}');
});
