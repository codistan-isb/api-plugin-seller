// import crypto from "crypto";

// export default (password) => crypto.createHash("sha256").update(password).digest("hex");


import bcrypt from "bcrypt";

const hashPassword = async (password) => {
    const saltRounds = 10;  // This is the cost factor
    return await bcrypt.hash(password, saltRounds);
};

export default hashPassword;