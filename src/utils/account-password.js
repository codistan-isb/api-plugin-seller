"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const two_factor_1 = require("@accounts/two-factor");
const server_1 = require("@accounts/server");
const utils_1 = require("./utils");
const errors_1 = require("./errors");
const validation_1 = require("./utils/validation");
const defaultOptions = {
    // 3 days - 3 * 24 * 60 * 60 * 1000
    verifyEmailTokenExpiration: 259200000,
    // 3 days - 3 * 24 * 60 * 60 * 1000
    passwordResetTokenExpiration: 259200000,
    // 30 days - 30 * 24 * 60 * 60 * 1000
    passwordEnrollTokenExpiration: 2592000000,
    notifyUserAfterPasswordChanged: true,
    returnTokensAfterResetPassword: false,
    invalidateAllSessionsAfterPasswordReset: true,
    invalidateAllSessionsAfterPasswordChanged: false,
    removeAllResetPasswordTokensAfterPasswordChanged: true,
    errors: errors_1.errors,
    sendVerificationEmailAfterSignup: false,
    validateEmail(email) {
        return (0, validation_1.isString)(email) && (0, utils_1.isEmail)(email);
    },
    validatePassword(password) {
        return (0, validation_1.isString)(password) && password !== '';
    },
    validateUsername(username) {
        const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]*$/;
        return (0, validation_1.isString)(username) && usernameRegex.test(username);
    },
    // If user does not provide the validateNewUser function only allow some fields
    validateNewUser(user) {
        const safeUser = { password: user.password };
        if (user.username) {
            safeUser.username = user.username;
        }
        if (user.email) {
            safeUser.email = user.email;
        }
        return safeUser;
    },
    hashPassword: utils_1.bcryptPassword,
    verifyPassword: utils_1.verifyPassword,
};
class AccountsPassword {
    constructor(options = {}) {
        this.serviceName = 'password';
        this.options = { ...defaultOptions, ...options };
        this.twoFactor = new two_factor_1.TwoFactor(options.twoFactor);
    }
    setStore(store) {
        this.db = store;
        this.twoFactor.setStore(store);
    }
    async authenticate(params) {
        const { user, password, code } = params;
        if (!user || !password) {
            throw new server_1.AccountsJsError(this.options.errors.unrecognizedOptionsForLogin, errors_1.AuthenticateErrors.UnrecognizedOptionsForLogin);
        }
        if ((!(0, validation_1.isString)(user) && !(0, validation_1.isObject)(user)) || !(0, validation_1.isString)(password)) {
            throw new server_1.AccountsJsError(this.options.errors.matchFailed, errors_1.AuthenticateErrors.MatchFailed);
        }
        const foundUser = await this.passwordAuthenticator(user, password);
        // If user activated two factor authentication try with the code
        if ((0, two_factor_1.getUserTwoFactorService)(foundUser)) {
            await this.twoFactor.authenticate(foundUser, code);
        }
        return foundUser;
    }
    /**
     * @description Find a user by one of his emails.
     * @param {string} email - User email.
     * @returns {Promise<Object>} - Return a user or null if not found.
     */
    findUserByEmail(email) {
        return this.db.findUserByEmail(email);
    }
    /**
     * @description Find a user by his username.
     * @param {string} username - User username.
     * @returns {Promise<Object>} - Return a user or null if not found.
     */
    findUserByUsername(username) {
        return this.db.findUserByUsername(username);
    }
    /**
     * @description Add an email address for a user.
     * It will trigger the `validateEmail` option and throw if email is invalid.
     * Use this instead of directly updating the database.
     * @param {string} userId - User id.
     * @param {string} newEmail - A new email address for the user.
     * @param {boolean} [verified] - Whether the new email address should be marked as verified.
     * Defaults to false.
     * @returns {Promise<void>} - Return a Promise.
     * @throws {@link AddEmailErrors}
     */
    addEmail(userId, newEmail, verified = false) {
        if (!this.options.validateEmail(newEmail)) {
            throw new server_1.AccountsJsError(this.options.errors.invalidEmail, errors_1.AddEmailErrors.InvalidEmail);
        }
        return this.db.addEmail(userId, newEmail, verified);
    }
    /**
     * @description Remove an email address for a user.
     * Use this instead of directly updating the database.
     * @param {string} userId - User id.
     * @param {string} email - The email address to remove.
     * @returns {Promise<void>} - Return a Promise.
     */
    removeEmail(userId, email) {
        return this.db.removeEmail(userId, email);
    }
    /**
     * @description Marks the user's email address as verified.
     * @param {string} token - The token retrieved from the verification URL.
     * @returns {Promise<void>} - Return a Promise.
     * @throws {@link VerifyEmailErrors}
     */
    async verifyEmail(token) {
        var _a;
        if (!token || !(0, validation_1.isString)(token)) {
            throw new server_1.AccountsJsError(this.options.errors.invalidToken, errors_1.VerifyEmailErrors.InvalidToken);
        }
        const user = await this.db.findUserByEmailVerificationToken(token);
        if (!user) {
            throw new server_1.AccountsJsError(this.options.errors.verifyEmailLinkExpired, errors_1.VerifyEmailErrors.VerifyEmailLinkExpired);
        }
        const verificationTokens = (0, utils_1.getUserVerificationTokens)(user);
        const tokenRecord = verificationTokens.find((t) => t.token === token);
        if (!tokenRecord || this.isTokenExpired(tokenRecord, this.options.verifyEmailTokenExpiration)) {
            throw new server_1.AccountsJsError(this.options.errors.verifyEmailLinkExpired, errors_1.VerifyEmailErrors.VerifyEmailLinkExpired);
        }
        const emailRecord = (_a = user.emails) === null || _a === void 0 ? void 0 : _a.find((e) => e.address === tokenRecord.address);
        if (!emailRecord) {
            throw new server_1.AccountsJsError(this.options.errors.verifyEmailLinkUnknownAddress, errors_1.VerifyEmailErrors.VerifyEmailLinkUnknownAddress);
        }
        await this.db.verifyEmail(user.id, emailRecord.address);
    }
    /**
     * @description Reset the password for a user using a token received in email.
     * It will trigger the `validatePassword` option and throw if password is invalid.
     * @param {string} token - The token retrieved from the reset password URL.
     * @param {string} newPassword - A new password for the user.
     * @returns {Promise<LoginResult | null>} - If `returnTokensAfterResetPassword` option is true return the session tokens and user object, otherwise return null.
     * @throws {@link ResetPasswordErrors}
     */
    async resetPassword(token, newPassword, infos) {
        if (!token || !(0, validation_1.isString)(token)) {
            throw new server_1.AccountsJsError(this.options.errors.invalidToken, errors_1.ResetPasswordErrors.InvalidToken);
        }
        if (!this.options.validatePassword(newPassword)) {
            throw new server_1.AccountsJsError(this.options.errors.invalidNewPassword, errors_1.ResetPasswordErrors.InvalidNewPassword);
        }
        const user = await this.db.findUserByResetPasswordToken(token);
        if (!user) {
            throw new server_1.AccountsJsError(this.options.errors.resetPasswordLinkExpired, errors_1.ResetPasswordErrors.ResetPasswordLinkExpired);
        }
        const resetTokens = (0, utils_1.getUserResetTokens)(user);
        const resetTokenRecord = resetTokens.find((t) => t.token === token);
        if (!resetTokenRecord ||
            this.isTokenExpired(resetTokenRecord, resetTokenRecord.reason === 'enroll'
                ? this.options.passwordEnrollTokenExpiration
                : this.options.passwordResetTokenExpiration)) {
            throw new server_1.AccountsJsError(this.options.errors.resetPasswordLinkExpired, errors_1.ResetPasswordErrors.ResetPasswordLinkExpired);
        }
        const emails = user.emails || [];
        if (!emails.map((email) => email.address).includes(resetTokenRecord.address)) {
            throw new server_1.AccountsJsError(this.options.errors.resetPasswordLinkUnknownAddress, errors_1.ResetPasswordErrors.ResetPasswordLinkUnknownAddress);
        }
        const password = await this.options.hashPassword(newPassword);
        // Change the user password and remove the other reset tokens
        await this.db.setPassword(user.id, password);
        await this.db.removeAllResetPasswordTokens(user.id);
        await this.server.getHooks().emit(server_1.ServerHooks.ResetPasswordSuccess, user);
        // If user clicked on an enrollment link we can verify his email
        if (resetTokenRecord.reason === 'enroll') {
            await this.db.verifyEmail(user.id, resetTokenRecord.address);
        }
        // Changing the password should invalidate existing sessions
        if (this.options.invalidateAllSessionsAfterPasswordReset) {
            await this.db.invalidateAllSessions(user.id);
        }
        if (this.options.notifyUserAfterPasswordChanged) {
            const address = user.emails && user.emails[0].address;
            if (!address) {
                throw new server_1.AccountsJsError(this.options.errors.noEmailSet, errors_1.ResetPasswordErrors.NoEmailSet);
            }
            const passwordChangedMail = this.server.prepareMail(address, '', this.server.sanitizeUser(user), '', this.server.options.emailTemplates.passwordChanged, this.server.options.emailTemplates.from);
            await this.server.options.sendMail(passwordChangedMail);
        }
        if (this.options.returnTokensAfterResetPassword) {
            return this.server.loginWithUser(user, infos);
        }
        return null;
    }
    /**
     * @description Change the password for a user.
     * @param {string} userId - User id.
     * @param {string} newPassword - A new password for the user.
     * @returns {Promise<void>} - Return a Promise.
     */
    async setPassword(userId, newPassword) {
        const password = await this.options.hashPassword(newPassword);
        return this.db.setPassword(userId, password);
    }
    /**
     * @description Change the current user's password.
     * It will trigger the `validatePassword` option and throw if password is invalid.
     * @param {string} userId - User id.
     * @param {string} oldPassword - The user's current password.
     * @param {string} newPassword - A new password for the user.
     * @returns {Promise<void>} - Return a Promise.
     * @throws {@link ChangePasswordErrors}
     */
    async changePassword(userId, oldPassword, newPassword) {
        if (!this.options.validatePassword(newPassword)) {
            throw new server_1.AccountsJsError(this.options.errors.invalidPassword, errors_1.ChangePasswordErrors.InvalidPassword);
        }
        const user = await this.passwordAuthenticator({ id: userId }, oldPassword);
        const password = await this.options.hashPassword(newPassword);
        await this.db.setPassword(userId, password);
        await this.server.getHooks().emit(server_1.ServerHooks.ChangePasswordSuccess, user);
        if (this.options.invalidateAllSessionsAfterPasswordChanged) {
            await this.db.invalidateAllSessions(user.id);
        }
        if (this.options.removeAllResetPasswordTokensAfterPasswordChanged) {
            await this.db.removeAllResetPasswordTokens(user.id);
        }
        if (this.options.notifyUserAfterPasswordChanged) {
            const address = user.emails && user.emails[0].address;
            if (!address) {
                throw new server_1.AccountsJsError(this.options.errors.noEmailSet, errors_1.ChangePasswordErrors.NoEmailSet);
            }
            const passwordChangedMail = this.server.prepareMail(address, '', this.server.sanitizeUser(user), '', this.server.options.emailTemplates.passwordChanged, this.server.options.emailTemplates.from);
            await this.server.options.sendMail(passwordChangedMail);
        }
    }
    /**
     * @description Send an email with a link the user can use verify their email address.
     * @param {string} [address] - Which address of the user's to send the email to.
     * This address must be in the user's emails list.
     * Defaults to the first unverified email in the list.
     * If the address is already verified we do not send any email.
     * @returns {Promise<void>} - Return a Promise.
     * @throws {@link SendVerificationEmailErrors}
     */
    async sendVerificationEmail(address) {
        var _a;
        if (!address || !(0, validation_1.isString)(address)) {
            throw new server_1.AccountsJsError(this.options.errors.invalidEmail, errors_1.SendVerificationEmailErrors.InvalidEmail);
        }
        const user = await this.db.findUserByEmail(address);
        if (!user) {
            throw new server_1.AccountsJsError(this.options.errors.userNotFound, errors_1.SendVerificationEmailErrors.UserNotFound);
        }
        // Do not send an email if the address is already verified
        const emailRecord = (_a = user.emails) === null || _a === void 0 ? void 0 : _a.find((email) => email.address.toLowerCase() === address.toLocaleLowerCase());
        if (!emailRecord || emailRecord.verified) {
            return;
        }
        const token = (0, server_1.generateRandomToken)();
        await this.db.addEmailVerificationToken(user.id, address, token);
        const resetPasswordMail = this.server.prepareMail(address, token, this.server.sanitizeUser(user), 'verify-email', this.server.options.emailTemplates.verifyEmail, this.server.options.emailTemplates.from);
        await this.server.options.sendMail(resetPasswordMail);
    }
    /**
     * @description Send an email with a link the user can use to reset their password.
     * @param {string} [address] - Which address of the user's to send the email to.
     * This address must be in the user's emails list.
     * Defaults to the first email in the list.
     * @returns {Promise<void>} - Return a Promise.
     * @throws {@link SendResetPasswordEmailErrors}
     */
    async sendResetPasswordEmail(address) {
        if (!address || !(0, validation_1.isString)(address)) {
            throw new server_1.AccountsJsError(this.options.errors.invalidEmail, errors_1.SendResetPasswordEmailErrors.InvalidEmail);
        }
        const user = await this.db.findUserByEmail(address);
        if (!user) {
            throw new server_1.AccountsJsError(this.options.errors.userNotFound, errors_1.SendResetPasswordEmailErrors.UserNotFound);
        }
        const token = (0, server_1.generateRandomToken)();
        await this.db.addResetPasswordToken(user.id, address, token, 'reset');
        const resetPasswordMail = this.server.prepareMail(address, token, this.server.sanitizeUser(user), 'reset-password', this.server.options.emailTemplates.resetPassword, this.server.options.emailTemplates.from);
        await this.server.options.sendMail(resetPasswordMail);
    }
    /**
     * @description Send an email with a link the user can use to set their initial password.
     * The user's email will be verified after clicking on the link.
     * @param {string} [address] - Which address of the user's to send the email to.
     * This address must be in the user's emails list.
     * Defaults to the first email in the list.
     * @returns {Promise<void>} - Return a Promise.
     * @throws {@link SendEnrollmentEmailErrors}
     */
    async sendEnrollmentEmail(address) {
        if (!address || !(0, validation_1.isString)(address)) {
            throw new server_1.AccountsJsError(this.options.errors.invalidEmail, errors_1.SendEnrollmentEmailErrors.InvalidEmail);
        }
        const user = await this.db.findUserByEmail(address);
        if (!user) {
            throw new server_1.AccountsJsError(this.options.errors.userNotFound, errors_1.SendEnrollmentEmailErrors.UserNotFound);
        }
        const token = (0, server_1.generateRandomToken)();
        await this.db.addResetPasswordToken(user.id, address, token, 'enroll');
        const enrollmentMail = this.server.prepareMail(address, token, this.server.sanitizeUser(user), 'enroll-account', this.server.options.emailTemplates.enrollAccount, this.server.options.emailTemplates.from);
        await this.server.options.sendMail(enrollmentMail);
    }
    /**
     * @description Create a new user.
     * @param user - The user object.
     * @returns Return the id of user created.
     * @throws {@link CreateUserErrors}
     */
    async createUser(user) {
        if (!user.username && !user.email) {
            throw new server_1.AccountsJsError(this.options.errors.usernameOrEmailRequired, errors_1.CreateUserErrors.UsernameOrEmailRequired);
        }
        if (user.username && !this.options.validateUsername(user.username)) {
            throw new server_1.AccountsJsError(this.options.errors.invalidUsername, errors_1.CreateUserErrors.InvalidUsername);
        }
        if (user.email && !this.options.validateEmail(user.email)) {
            throw new server_1.AccountsJsError(this.options.errors.invalidEmail, errors_1.CreateUserErrors.InvalidEmail);
        }
        if (user.username && (await this.db.findUserByUsername(user.username))) {
            throw new server_1.AccountsJsError(this.options.errors.usernameAlreadyExists, errors_1.CreateUserErrors.UsernameAlreadyExists);
        }
        if (user.email && (await this.db.findUserByEmail(user.email))) {
            throw new server_1.AccountsJsError(this.options.errors.emailAlreadyExists, errors_1.CreateUserErrors.EmailAlreadyExists);
        }
        if (user.password) {
            if (!this.options.validatePassword(user.password)) {
                throw new server_1.AccountsJsError(this.options.errors.invalidPassword, errors_1.CreateUserErrors.InvalidPassword);
            }
            user.password = await this.options.hashPassword(user.password);
        }
        user = await this.options.validateNewUser(user);
        try {
            const userId = await this.db.createUser(user);
            const userRecord = (await this.db.findUserById(userId));
            await this.server.getHooks().emit(server_1.ServerHooks.CreateUserSuccess, userRecord);
            if (this.options.sendVerificationEmailAfterSignup && user.email) {
                await this.sendVerificationEmail(user.email);
            }
            return userId;
        }
        catch (e) {
            await this.server.getHooks().emit(server_1.ServerHooks.CreateUserError, user);
            throw e;
        }
    }
    isTokenExpired(tokenRecord, expiryDate) {
        return Number(tokenRecord.when) + expiryDate < Date.now();
    }
    async passwordAuthenticator(user, password) {
        const { username, email, id } = (0, validation_1.isString)(user)
            ? this.toUsernameAndEmail({ user })
            : this.toUsernameAndEmail({ ...user });
        let foundUser = null;
        if (id) {
            // this._validateLoginWithField('id', user);
            foundUser = await this.db.findUserById(id);
        }
        else if (username) {
            // this._validateLoginWithField('username', user);
            foundUser = await this.db.findUserByUsername(username);
        }
        else if (email) {
            // this._validateLoginWithField('email', user);
            foundUser = await this.db.findUserByEmail(email);
        }
        if (!foundUser) {
            if (this.server.options.ambiguousErrorMessages) {
                throw new server_1.AccountsJsError(this.options.errors.invalidCredentials, errors_1.PasswordAuthenticatorErrors.InvalidCredentials);
            }
            else {
                throw new server_1.AccountsJsError(this.options.errors.userNotFound, errors_1.PasswordAuthenticatorErrors.UserNotFound);
            }
        }
        const hash = await this.db.findPasswordHash(foundUser.id);
        if (!hash) {
            throw new server_1.AccountsJsError(this.options.errors.noPasswordSet, errors_1.PasswordAuthenticatorErrors.NoPasswordSet);
        }
        const isPasswordValid = await this.options.verifyPassword(password, hash);
        if (!isPasswordValid) {
            if (this.server.options.ambiguousErrorMessages) {
                throw new server_1.AccountsJsError(this.options.errors.invalidCredentials, errors_1.PasswordAuthenticatorErrors.InvalidCredentials);
            }
            else {
                throw new server_1.AccountsJsError(this.options.errors.incorrectPassword, errors_1.PasswordAuthenticatorErrors.IncorrectPassword);
            }
        }
        return foundUser;
    }
    /**
     * Given a username, user and/or email figure out the username and/or email.
     *
     * @param user An object containing at least `username`, `user` and/or `email`.
     * @returns An object containing `id`, `username` and `email`.
     */
    toUsernameAndEmail({ user, username, email, id }) {
        if (user && !username && !email) {
            if ((0, utils_1.isEmail)(user)) {
                email = user;
                username = null;
            }
            else {
                username = user;
                email = null;
            }
        }
        return { username, email, id };
    }
}
exports.default = AccountsPassword;
//# sourceMappingURL=accounts-password.js.map/usr/local/src/app/node_modules/@accounts/password/lib #