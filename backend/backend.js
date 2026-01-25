const express = require('express')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const {v4: uuidv4} = require('uuid')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const path = require('path')
const { string } = require('yargs')
const { type } = require('os')
const app = express()
app.use(express.json())
app.use('/public/', express.static(path.join(__dirname, '../frontend/public')))
app.use(cookieParser())
const cloverConnect = mongoose.createConnection(process.env.CLOVERURI)
const otcSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => uuidv4()
    },
    email: String,
    code: String,
    expires: String
})
const usersSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => uuidv4()
    },
    email: String,
    password: String,
    chatsId: [String],
    CreateAt: String
})
const userChatSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => uuidv4()
    },
    chats: [Object]
})
const otcCollection = cloverConnect.model('one-time-code-signup', otcSchema)
const usersCollection = cloverConnect.model('users-login-info', usersSchema)

const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})



app.get('/', async (req, res) => {
    const token = req.cookies.token
    console.log('ask')
    if(token){
        const payload = await jwt.verify(token, process.env.SECRET)
        if(payload) {
            res.sendFile(path.join(__dirname, '../frontend/loggedHome.html'))
        }else{
            res.sendFile(path.join(__dirname, '../frontend/unloggedHome.html'))
        }
    }else{
        res.sendFile(path.join(__dirname, '../frontend/unloggedHome.html'))
    }
})
app.get('/api/', async (req, res) => {
    const token = req.cookies.token
    if (token) {
        const payload = await jwt.verify(token, process.env.SECRET)
        if (payload) {
            const userInfo = await usersCollection.findById(payload.uid)
            res.json({
                statuz: true,
                username: 'Phantom Dev',
                chats: userInfo.chatsId
            })
        }else{
            res.json({
                statuz: false
            })
        }
    }else{
        res.json({
            statuz: false
        })
    }
})
app.get('/c/:chatId', async (req, res) => {
    const token = req.cookies.token
    const chatId = req.params.chatId
    if(token){
        const payload = await jwt.verify(token, process.env.SECRET)
        if(payload) {
            const userChatCollection = await cloverConnect.model(`${payload.uid}-chats`, userChatSchema)
            const chat = await userChatCollection.findById(chatId)
            if (chat) {
                res.sendFile(path.join(__dirname, '../frontend/loggedHome.html'))
            }else{
                res.redirect('/')
            }
        }else{
            res.redirect('/')
        }
    }else{
        res.redirect('/')
    }
})
app.post('/c/:chatId', async (req, res) => {
    const chatId = req.params.chatId;
    const token = req.cookies.token
    const question = req.body.question
    if (token) {
        const payload = await jwt.verify(token, process.env.SECRET)
        if (payload) {
            const userChats = await cloverConnect.model(`${payload.uid}-chats`, userChatSchema)
            const response = await fetch('http://localhost:8003/c/generate', {
                method: 'Post',
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ question: question, conversation: req.body.conversation})
            })
            const result = await response.json()
            await userChats.findByIdAndUpdate(chatId, { $push: {
                chats: {userQuestion: question, cloverResponse: result.reply}
            }})
            res.json({cloverResponse: result.reply})
        }
    }
})
app.get('/api/c/:chatId', async (req, res) => {
    const token = req.cookies.token
    const chatId = req.params.chatId
    if(token){
        const payload = await jwt.verify(token, process.env.SECRET)
        if (!payload) {
            return res.json({statuz: false})
        }
        const userChatCollection = await cloverConnect.model(`${payload.uid}-chats`, userChatSchema)
        const chat = await userChatCollection.findById(chatId)
        res.json({conversation: chat.chats})
    }
})
app.get('/login', async (req, res) => {
    const token = req.cookies.token
    if(token){
        const payload = await jwt.verify(token, process.env.SECRET)
        if(payload) {
            res.redirect('/')
        }else{
            res.redirect('/')
        }
    }else{
        res.sendFile(path.join(__dirname, '../frontend/auth.html'))
    }
})
app.post('/signup', async (req, res) => {
    const oldtoken = req.cookies.token
    if (oldtoken) {
        res.json({
            message: 'You are already logged in'
        })
        return;
    }
    const {email, password, confirmPassword, code} = req.body
    if(email === '' || email.indexOf('@') < 1 || email.lastIndexOf('.') < email.indexOf('@') ) {
        res.json({
            statuz: false,
            reason: 'email'
        })
        return;
    }
    if (password.length < 8 ) {
        res.json({
            statuz: false,
            reason: 'password'
        })
        return;
    }
    if(password !== confirmPassword) {
        res.json({
            statuz: false,
            reason: 'confirmpassword'
        })
        return;
    }if (code.length < 4 || code.length > 4) {
        res.json({
            statuz: false,
            reason: 'code'      
        })
        return;
    }
    const codecollect = await otcCollection.findOne({email: email})
    const correct = await bcrypt.compare(code, codecollect.code)
    const exists = await usersCollection.findOne({email: email})
    if (exists !== null) {
        res.json({
            statuz: false,
            reason: 'emailExists',
        })
        return;
    }
    if (!correct) {
        res.json({
            statuz: false,
            reason: 'incorrectCode'
        })
        return;
    }
    if (Date.now() < Number(codecollect.expires)) {
        res.json({
            statuz: false,
            reason: 'expiredCode'
        })
        return;
    }
    const hashedpassword = await bcrypt.hash(password, 10)
    const newuser = await usersCollection.create({
        email: email,
        password: hashedpassword,
    });
    const token = await jwt.sign({
        uid: newuser._id,
        email: newuser.email
    }, process.env.SECRET, {expiresIn: '12h'});
    await res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        maxAge: 12 * 1000 * 60 *60
    })
    res.json({
        statuz: true,
        redirect: '/'
    })
})  
app.post('/auth/code', async (req, res) => {
    const email = req.body.email
    const user = await usersCollection.findOne({email: email})
    if (email === '' || email.indexOf('@') < 1 || email.lastIndexOf('.') < email.indexOf('@')) {
        res.json({
            statuz: false,
            reason: email
        })
        return;
    }
    if (user !== null) {
        res.json({
            statuz: false,
            reason: 'emailExists',
        })
        return;
    }
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`
    let mailOptions = {
        from: `"Photon" <no-reply@myapp.com>`,
        to: email,
        subject: 'CLover OTP Verification',
        html: `<b><p style="font-size: 1.5rem; color: #003823;">Hello,</p>
                <p style="font-size: 1.5rem; color: #003823;">The code required to finish the Sign up process is: </p>
                <p style="font-size: 1.5rem; color: #60b411">${otp}</p> 
                <p>This OTP will expire in 5 minutes</b>`
    };
    await transport.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("Error:", err);
        } else {
            console.log("Email sent:", info.response);
        }
    }) 
    const hashedotp = await bcrypt.hash(otp, 10)
    const expires = Date.now() + (5 * 60 * 1000);
    const exists = await otcCollection.findOne({email: email})
    if (exists) {
        const exists = await otcCollection.findOneAndUpdate({email: email}, {code: hashedotp})
    }else{
        await otcCollection.create({email: email, code: hashedotp, expires: expires})
    }
    res.json({
        statuz: true
    })
})
app.get('/signup', async (req, res) => {
    const token = req.cookies.token
    if(token){
        const payload = await jwt.verify(token, process.env.SECRET)
        if(payload) {
            res.redirect('/')
        }else{
            res.redirect('/')
        }
    }else{
        res.sendFile(path.join(__dirname, '../frontend/auth.html'))
    }
})
app.post('/c', async (req, res) => {
    const token = req.cookies.token
    const question = req.body.question
    if (!token) {
        const response = await fetch('http://localhost:8003/c/generate', {
            method: 'Post',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ question: question, conversation: req.body.conversation})
        })
        const result = await response.json()
        res.json({cloverResponse: result.reply})
    }else{
        const payload = await jwt.verify(token, process.env.SECRET)
        if (!payload) {
            return res.json({statuz: false})
        }
        const conversation = []
        const response = await fetch('http://localhost:8003/c/generate', {
            method: 'Post',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ question: question, conversation: conversation})
        })
        const result = await response.json();
        const userChatCollection = await cloverConnect.model(`${payload.uid}-chats`, userChatSchema)
        const chat = await userChatCollection.create({chats: {userQuestion: question, cloverResponse: result.reply}})
        await usersCollection.findByIdAndUpdate(payload.uid, { $push: {chatsId: chat._id} })
        res.json({cloverResponse: result.reply})
    }
})
app.post('/login', async (req, res) => {
    const oldtoken = req.cookies.token
    if (oldtoken) {
        res.json({
            message: 'You are already logged in'
        })
        return;
    }
    const {email, password} = req.body
    const user = await usersCollection.findOne({email: email})
    const correct = await bcrypt.compare(password, user.password)
    if (user !== null && correct) {
        const token = await jwt.sign({
            uid: user._id,
            email: user.email
        }, process.env.SECRET, {expiresIn: '12h'})
        await res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 12 * 1000 * 60 *60
        })
        res.json({
            statuz: true,
            redirect: '/'
        })
    }else{
        if (user === null) {
            res.json({
                statuz: false,
                reason: 'email'
            })
        }else if(!correct) {
            res.json({
                statuz: false,
                reason: 'loggedPassword'
            })
        }
    }
})
async function connect() {
    await cloverConnect;
    app.listen(7020, '0.0.0.0', () => {
        console.log('listening on port 7020')
    })
}
connect()