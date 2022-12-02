import express from "express";
import {login,register,checkEmail,checkUsername,updateAvatar,deleteUser} from "../controllers/auth.js"

export const router=express.Router();

router.route('/login').post(login);
router.route('/register').post(register);
router.route('/checkEmail').post(checkEmail);
router.route('/checkUsername').post(checkUsername);
router.route('/updateAvatar').put(updateAvatar);
router.route('/deleteUser').post(deleteUser);