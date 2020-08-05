if( process.env.NODE_ENV !== 'production' ){
    require('dotenv').config()
}

const express = require('express')
const app= express()
const bcrypt= require('bcrypt')
const flash = require('express-flash')

const session = require('express-session')

const pasport = require('passport')

const initializePassport = require('./passport-config')
const methodOverride = require('method-override')

app.use(methodOverride('_method'))


initializePassport(
    pasport,
    email =>  users.find(user => user.email ===email),
    id => users.find(user => user.id ===id)

    )

const users=[]



app.delete('/logout', (req, res) => {
    console.log('clicked')
    // console.log(users)
    req.logOut()
    res.redirect('/login')
  })

app.set('view-engine','ejs')
app.use(express.urlencoded({ extended:false}))

app.use(flash())


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))

app.use(pasport.initialize())
app.use(pasport.session())


app.get('/',checkAuthentication, (req,res) =>{
    res.render('index.ejs',{ name : 'lol' })
    console.log(users)
    
})

app.get('/login',checkNotAuthenticated,(req,res) =>{
    res.render('login.ejs')
})


app.post('/login',checkNotAuthenticated, pasport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:true

}))

app.get('/register',checkNotAuthenticated,(req,res) =>{
    res.render('register.ejs')
})

app.post('/register',async (req,res) =>{
    try{
        const hashedPassword=await bcrypt.hash(req.body.password,10)
        users.push(
            {
                id:(Math.random()),
                date:Date.now.toString(),
                name:req.body.name,
                email:req.body.email,
                password:hashedPassword
            }
        )
        res.redirect('/login')
    }catch{
        res.redirect('/register')
    }
    console.log(users)
})

function checkAuthentication(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
    
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

app.listen(3000)