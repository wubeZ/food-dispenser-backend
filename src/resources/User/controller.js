import UserModel from "./model.js";
import DeviceModel from "../Devices/model.js";
import AddressModel from "../Address/model.js";
import OtpUserModel from "../otp-user/model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../../common/logger.js";
import otpGenerator from 'otp-generator'


const getAllUsers = async (req, res) => {
    try {
        if (!req.isAdmin) {
            return res.status(401).json({message: "Unauthorized"});
        }
        const users = await UserModel.find({}).select('-password');
        logger.info("got all users");
        return res.status(200).json(users);
   } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const createUser = async (req, res) => {
    try {
        
        const {full_name ,email, password, device_id, phoneNumber, city, subCity, wordea, houseNo, street  } = req.body;
        
        if (!full_name || !email || !password || !device_id || !phoneNumber || !city || !subCity ) {
            return res.status(401).json({message: "All Required fields are must be filled"});
        }
        
        const emailExists = await UserModel.findOne({email: email});
        const phoneNumberExists = await UserModel.findOne({phoneNumber: phoneNumber});
        const deviceExists = await DeviceModel.findById(device_id);

        if (!deviceExists) {
            return res.status(401).json({message: "Device does not exist"});
        }

        if (deviceExists.status === "online") {
            return res.status(401).json({message: "Device already in use by another user"});
        }
        if (emailExists || phoneNumberExists) {
            return res.status(401).json({message: "Email or Phone Number already exists"});
        }

        const salt = 10;
        const hash = await bcrypt.hash(password, salt);

        const newAddress = await AddressModel.create({
            city: city,
            subCity: subCity,
            wordea: wordea,
            houseNo: houseNo,
            street: street
        });

        const address_id = newAddress._id;

        const user = new UserModel({
            full_name: full_name,
            email: email,
            phoneNumber: phoneNumber,
            password: hash,
            device_id: device_id,
            address: address_id
        });
        
        await user.save();

        const updateDevice = await DeviceModel.findByIdAndUpdate(device_id, {status: "online"});

        logger.info("created user");
        return res.status(201).json({message: "user created successfully"});

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const getUserById = async (req, res) => {
    try {
        const user = await UserModel.findById(req._id).select('-password');
        logger.info("got user by id");
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const getUser = async (req, res) => {
    if (!req.isAdmin) {
        return res.status(401).json({message: "Unauthorized"});
    }
    try {
        const user = await UserModel.findById(req.params._id).select('-password');
        logger.info("got user by id");
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const updateUserById = async (req, res) => {
    try {
        const { full_name } = req.body;
        const user = await UserModel.findById(req._id);
        if (full_name) {
            user.full_name = full_name;
        }
        await user.save();
        return res.status(200).json({message: "user updated successfully"});
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const deleteUserById = async (req, res) => {
    try {
        const deletedUser = await UserModel.findByIdAndDelete(req._id);
        logger.info("deleted user");
        return res.status(200).json({message: "user deleted successfully"});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}


const login = async (req, res) => {
    const {email, password, phoneNumber } = req.body;
    try {
        if (!email && !phoneNumber) {
            return res.status(401).json({message: "Email or Phone Number is required"});
        }
        if (!password) {
            return res.status(401).json({message: "Password is required"});
        }
        var filter = "";
        if (email) {
            filter = {email: email};
        } else {
            filter = {phoneNumber: phoneNumber};
        }
        const user = await UserModel.findOne(filter);
        if (!user) {
            return res.status(401).json({message: "user not found"});
        }
        const hash = user.password;
        const isMatch = await bcrypt.compare(password, hash);
        if (!isMatch) {
            return res.status(401).json({message: "incorrect Email or Phone Number or Password"});
        }
        const new_user = {
            _id: user._id,
            full_name: user.full_name,
            isAdmin: user.isAdmin,
            device_id: user.device_id,
            email: user.email,
            phoneNumber: user.phoneNumber
        }
        
        const sendUser = { ...user }["_doc"];
        delete sendUser.password;
        
        const acesstoken = jwt.sign(new_user, process.env.JWT_SECRET, {expiresIn: "48h"});
        logger.info("User logged in");
        return res.status(200).json({message: "Login Sucessful",token: acesstoken, user: sendUser});   
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}


const changePassword = async (req, res) => {
    const {old_password, new_password} = req.body;
    try {
        const email = req.email;
        const user = await UserModel.findOne({email: email});
        if (!user) {
            return res.status(401).json({message: "user not found"});
        }
        const hash = user.password;
        const isMatch = await bcrypt.compare(old_password, hash);
        if (!isMatch) {
            return res.status(401).json({message: "incorrect Password"});
        }
        const salt = await bcrypt.genSalt(10);
        const new_hash = await bcrypt.hash(new_password, salt);
        user.password = new_hash;
        await user.save();
        logger.info("Password changed");
        return res.status(200).json({message: "Password changed successfully"});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}


const createAdmin = async (req, res) => {
    try {
        if(!req.isAdmin) {
            return res.status(401).json({message: "Not authorized to create admin"});
        }
        const {full_name ,email, password } = req.body;
        const emailexist = await UserModel.findOne({email: email});
        
        if (emailexist) {
            return res.status(401).json({message: "Email already exists"});
        }
        const salt = 10;
        const hash = await bcrypt.hash(password, salt);
        const user = new UserModel({
            full_name: full_name,
            email: email,
            password: hash,
            isAdmin: true
        });
        await user.save();
        logger.info("created admin");
        return res.status(201).json({message: "admin created successfully"});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const generateOTP = (length) => {
        otpGenerator.generate(length, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });
}

const forgetPassword = async (req, res) => {
    try {
        const email = req.body.email;

        const User = await UserModel.findOne({email: email});
        if (!User) {
            return res.status(401).json({message: "User not found"});
        }

          // generate the OTP
            const OTP = generateOTP(6)
            
            const newOTP = {
                user: User._id,
                otp: OTP
            }

            // generate OTP and link it with the user
            const data = await OtpUserModel.create(newOTP);
            if (!data) {
                return res.status(400).json({ message: 'error generating reset link' })
            }

            // send the OTP to the user
            const credentials = {
                link: OTP,
                to: User.email,
                intent: 'Resetting your user password',
                proc: 'Password Reset',
                extra: 'Generated OTP expires within a day'
            }

            const Email = await sendMail(credentials)
            if (!Email) {
                await OtpUserModel.deleteOne('', true, { _id: data._id });
                return res.status(500).json({ message: 'could not send reset link, try later' })
            }
            return res.status(200).json({ message: 'Password reset link sent to the email' })
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { otp, password } = req.body;
        const OTP = await OtpUserModel.findOne({ otp: otp });
        if (!OTP) {
            return res.status(401).json({ message: 'Invalid OTP' })
        }

        const newPassword = await bcrypt.hash(password, 12);

        const repsonse = await UserModel.updateOne({ _id: OTP.user }, { password: newPassword });
        if (!repsonse) {
            return res.status(500).json({ message: 'could not reset password, try later' })
        }
        await OtpUserModel.deleteOne('', true, { _id: OTP._id });
        return res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        next(err);
    }
}

const validiteOTP = async (req, res) => {
    try {
        const {email, otp} = req.body;

        const User = await UserModel.findOne({email: email});
        if (!User) {
            return res.status(401).json({message: "User not found"});
        }
        const Otp = await OtpUserModel.findOne({otp: otp, user: User._id});
        if (!Otp) {
            return res.status(401).json({message: "Invalid OTP"});
        }
        return res.status(200).json({message: "OTP is valid"});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}


export default {
    getAllUsers,
    createUser,
    getUserById,
    updateUserById,
    deleteUserById,
    login,
    changePassword,
    createAdmin,
    getUser,
    forgetPassword,
    resetPassword,
    validiteOTP
}