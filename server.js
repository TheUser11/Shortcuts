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
