import mysql from "mysql";
import bcrypt from "bcryptjs";
import { configDB } from "../configDB.js";
import { upload,removeFromCloud } from "../cloudinary.js";
import fs from 'fs'
import path from "path";

const db=mysql.createConnection(configDB)
//ideiglenes login:

/*export const login=(request,response)=>{
    console.log(request.body)
    const {username,password} = request.body
    db.query('SELECT count(*) nr FROM `users` where username=? and password=?',[username,password],(err,result)=>{
        if(err)
            console.log('HIBA!',err)
        else
            response.send({rowCount:result[0].nr,username:username})
    })
}*/

export const login=(request,response)=>{
    console.log(request.body)
    const {username,password} = request.body
    db.query('SELECT id,password,email,avatar,avatar_id FROM `users` where username=?',[username],(err,result)=>{
        if(err)
            console.log('HIBA!',err)
        else{
            bcrypt.compare(password, result[0].password,(err,resultCompare)=>{
                if(err)
                    response.send({error:"ServerERROR!",err})
                if(resultCompare){
                    response.send({username:username,id:result[0].id,email:result[0].email,avatar:result[0].avatar,avatar_id:result[0].avatar_id})
                }
                else{
                    response.send({error:"Wrong password username pair!"})
                }
            })
        }
    })
}

export const checkEmail=(request,response)=>{
    console.log(request.body)
    const {email} = request.body
    db.query('SELECT count(*) nr FROM `users` where email=?',[email],(err,result)=>{
        if(err)
            console.log('HIBA!',err)
        else
        response.send({rowCount:result[0].nr,email:email})
    })
}


export const checkUsername=(request,response)=>{
    console.log(request.body)
    const {username} = request.body
    db.query('SELECT count(*) nr FROM `users` where username=?',[username],(err,result)=>{
        if(err)
            console.log('HIBA!',err)
        else
            response.send({rowCount:result[0].nr,username:username})
    })
}

const saltRound=10
export const register=(request,response)=>{
    const {username,email,password} = request.body
    bcrypt.hash(password,saltRound,(err,hashedPassword)=>{
        if(err){
            console.log('BCRYPT HIBA!',err)
        }
        else{
            db.query('INSERT INTO users (username,email,password) values (?,?,?)',[username,email,hashedPassword],(err,result)=>{
                if(err){
                    console.log('HIBA AZ INSERT-NÉL!',err)
                    response.send({msg:'Registration failed!',id:result.insertId})
                }
                else
                    response.send({msg:'Successful registration!',id:result.insertId})
            })
        }
    })
}

export const updateAvatar=async (request,response)=>{
    const {username,avatar_id}=request.body
    if(request.files){
        const {selFile} = request.files
        console.log("Selected: ",selFile)
        const cloudFile = await upload(selFile.tempFilePath)
        db.query('update users set avatar=?,avatar_id=? where username=?',[cloudFile.url,cloudFile.public_id,username],(err,result)=>{
            if(err){
                console.log('HIBA!',err)
                response.send({msg:"Hiba: ",err})
            }
            else{
                removeFromCloud(avatar_id)
                removeTMPfiles(selFile.tempFilePath)
                response.send({msg:"Sikeres módosítás",avatar:cloudFile.url,avatar_id:cloudFile.public_id})
            }
        })
    }
}

const removeTMPfiles = path =>{
    console.log("A törlendő temp file útvonala: ",path)
    fs.unlink(path, err =>{
        if(err) throw err
    })
}

export const deleteUser=(request,response)=>{
    console.log(request.body)
    const {username,avatar_id} = request.body
    db.query('DELETE FROM `users` where username=?',[username],(err,result)=>{
        if(err)
            console.log('HIBA!',err)
        else{
            console.log("Törlés eredménye: ",result)
            avatar_id && removeFromCloud(avatar_id)
            response.send({msg:"Sikeresen törölte a felhasználóját!",username:username})
        }
            
    })
}

export const changePassword=(request,response)=>{
    const {password,username} = request.body
    bcrypt.hash(password,saltRound,(err,hashedPassword)=>{
        if(err){
            console.log('BCRYPT HIBA!',err)
        }
        else{
            db.query('update users SET password=? where username=?;',[hashedPassword,username],(err,result)=>{
                if(err){
                    response.send({msg:'Password not changed!'})
                }
                else
                    response.send({msg:'Successful changed password!'})
            })
        }
    })
}