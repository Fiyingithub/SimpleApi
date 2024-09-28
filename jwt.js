import jwt from 'jsonwebtoken';
import express from 'express';

const app = express()

const user = {
    id: 1,
    name: "Gbenga",
    age: 20,
    email: "adegbenga@gmail.com"
}

app.get('/check', (req,res)=>{
    const token = jwt.sign()
})