const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt= require('bcryptjs')
const jwt = require('jsonwebtoken')


mongoose.connect('mongodb://127.0.0.1:27017/EaseYourStudy',{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
const userSchema = new mongoose.Schema(
    {
        name:{
             type: String,
             required:true,
             trim:true
        },
        email:{
            type:String,
            required:true,
            trim:true,
            lowercase:true,
            validate(value){
                if(!validator.isEmail(value)){
                    throw new Error('Invalid Email!!')
                }
            }
        },
        password:{
            type:String,
            required:true,
            
        },
        reviews:[{
            review:{
                type:String
            }
        }],
        tokens: [{
            token:{
                type:String,
                required:true
            }
        }]
    
    }
)

userSchema.methods.generateAuthToken= async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()},'myhppavilion')
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.methods.addReviews = async function(review){
    const user = this
    user.reviews = user.reviews.concat({review})
    await user.save()
    return user.reviews
}

userSchema.statics.findByCredentials = async (email,password)=>{
    try{

        const user = await User.findOne({email})
        
        if(!user){
            throw new Error('Unable to login')
        }
    
        const isMatch = await bcrypt.compare(password,user.password)
    
        if(!isMatch){
            throw new Error('Unable to login')
        }
        return user
    }catch(e){
        return null
    }

    
}

userSchema.pre('save',async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

const User = mongoose.model('User',userSchema)

// const user1 = new User({
//     name:"Ankit Kumar",
//     email:"ak656634@gmail.com",
//     password:"ankit@121212"
// })

// user1.save().then(()=>{
//     console.log(user1)
// }).catch((err)=>{
//     console.log(err)
// })
module.exports = User