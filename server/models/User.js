const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/*
  User model — defines what a user document looks like in MongoDB.

  Think of a Mongoose model as TWO things in one:
    1. A blueprint (schema) describing each user's fields and rules.
    2. A toolbox (model) for database operations: User.findOne(), User.create()...
*/

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true, // Remove accidental leading/trailing spaces.
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // MongoDB rejects a second account with the same email.
      lowercase: true, // "Sajal@Mail.com" and "sajal@mail.com" become one account.
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // NEVER include the password in query results by default.
      // Login explicitly opts back in with .select("+password") when it
      // needs to compare hashes — everywhere else it stays hidden.
    },
  },
  {
    // Automatically manage createdAt and updatedAt for every user.
    timestamps: true,
  }
);

/*
  Hash the password automatically BEFORE saving.
  Why a pre-save hook? So controllers can just do User.create({..., password})
  and never have to remember to hash — forgetting would store plain-text passwords.
*/
userSchema.pre("save", async function () {
  // Only re-hash when the password itself changed (e.g. skip when updating the name).
  if (!this.isModified("password")) return;

  // 10 salt rounds: the standard balance of security vs. speed for logins.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/*
  Helper to compare a login attempt with the stored hash.
  bcrypt.compare handles the salt internally — we just get true/false,
  which keeps the auth controller short and readable.
*/
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
