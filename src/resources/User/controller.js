import UserModel from "./model.js";
import DeviceModel from "../Devices/model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const getAllUsers = async (req, res) => {
    try {
        if (!req.isAdmin) {
            return res.status(401).json({message: "Unauthorized"});
        }
        const users = await UserModel.find({});
        console.log("got all users");
        return res.status(200).json(users);
   } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const createUser = async (req, res) => {
    try {
        if (!req.isAdmin) {
            return res.status(401).json({message: "Unauthorized"});
        }
        const {full_name ,email, password, device_name } = req.body;
        const emailexist = await UserModel.findOne({email: email});

        if (emailexist) {
            return res.status(401).json({message: "Email already exists"});
        }
        const salt = 10;
        const hash = await bcrypt.hash(password, salt);
        const device = await DeviceModel.create({name: device_name, feedingCapacity: 12 })

        const user = new UserModel({
            full_name: full_name,
            email: email,
            password: hash,
            device_id: device._id
        });
        await user.save();
        console.log("created user");
        return res.status(201).json({message: "user created successfully"});

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const getUserById = async (req, res) => {
    try {
        const user = await UserModel.findById(req._id);
        console.log("got user by id");
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
        console.log("deleted user");
        return res.status(200).json({message: "user deleted successfully"});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}


const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await UserModel.findOne({email: email});
        if (!user) {
            return res.status(401).json({message: "user not found"});
        }
        const hash = user.password;
        const isMatch = await bcrypt.compare(password, hash);
        if (!isMatch) {
            return res.status(401).json({message: "incorrect Email or Password"});
        }
        const new_user = {
            _id: user._id,
            full_name: user.full_name,
            isAdmin: user.isAdmin,
            device_id: user.device_id,
            email: user.email
        }
        const acesstoken = jwt.sign(new_user, process.env.JWT_SECRET, {expiresIn: "48h"});
        console.log("User logged in");
        return res.status(200).json({message: "Login Sucessful",token: acesstoken});   
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
        console.log("Password changed");
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
        console.log("created admin");
        return res.status(201).json({message: "admin created successfully"});
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
    createAdmin
}