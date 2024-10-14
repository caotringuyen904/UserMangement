const router = require('express').Router()
const { ObjectId } = require('mongoose').Types;

const Joi = require('joi')

const User = require('./userModel')


router.post('/signup', async (req, res) => {
    // Validate input data

    const userSchema = Joi.object({
        firstname: Joi.string().min(5).max(15).required().messages({
            "string.base": "firstname must be string",
            "string.empty": "firstname must not empty",
            "string.min": "firstname must be at least 6 characters long",
            "string.max": "firstname must be less than or equal to 12 characters long",
            "any.required": "firstname is required"
        }),
        lastname: Joi.string().min(5).max(15).required().messages({
            "string.base": "lastname must be string",
            "string.empty": "lastname must not empty",
            "string.min": "lastname must be at least 5 characters long",
            "string.max": "lastname must be less than or equal to 16 characters long",
            "any.required": "lastname is required"  
        }),
        password: Joi.string().min(8).max(30)
            .pattern(new RegExp('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
            .messages({
                "string.base": "Password must be a string",
                "string.empty": "Password must not be empty",
                "string.min": "Password must be at least 8 characters long",
                "string.max": "Password must be less than or equal to 30 characters long",
                "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                "any.required": "Password is required"
            }),
        email: Joi.string().email({ tlds: { allow: ['com'] } }).pattern(/@gmail\.com$/).required().messages({
            "string.email": "Email must be a valid email address",
            "string.pattern.base": "Email must be a Gmail address (@gmail.com)",
            "any.required": "Email is required"
        })
    })

    const { firstname, lastname, email, password } = req.body

    try {
        const validate = userSchema.validate(req.body)

        if (validate.error) {
            return res.status(400).json({ message: validate.error.message })
        }

        // check user exist in database
        const checkExistUser = await User.findOne({
            firstname: firstname,
            lastname: lastname,
            email: email,
        })

        if (checkExistUser) {
            return res.status(400).json({ message: "User is exist in database" })
        }

        // create new user

        const newUser = new User({
            firstname,
            lastname,
            email,
            password
        })

        await newUser.save()

        return res.status(200).json({
            message: `create an user with ${email} successfully`,
            user: newUser
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "500 server error" })
    }


})

router.delete("/user/:id", async (req, res) => {
    try {
        const userId = req.params.id

        console.log(userId)

        const user = await User.findByIdAndDelete(userId)

        if (!user) {
            return res.status(404).json({ message: "Not found user" })
        }

        return res.status(200).json({
            message: `${user.email} was deleted successfully`
        })


    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "500 error server" })
    }
})


router.get("/userlist", async (req, res) => {
    try {
        const users = await User.find()

        if (users.length === 0) {
            return res.status(404).json({ message: "Not found users in database" })
        }

        return res.status(200).json({
            message: "get user info successfully",
            users: users
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "500 error server" })
    }

})

router.get('/users', async (req, res) => {
    try {
        const userIds = req.query.ids;
        if (!userIds) {
            return res.status(400).json({ message: 'No user IDs provided' });
        }

        // Split query parameter into an array
        const idsArray = userIds.split(',').map(id => id.trim());
        console.log(idsArray);

        // Validate and convert to ObjectId
        const validIds = idsArray.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
        console.log(validIds);

        if (validIds.length === 0) {
            return res.status(400).json({ message: 'No valid user IDs provided' });
        }

        // Fetch users based on valid IDs
        const filteredUsers = await User.find({
            _id: { $in: validIds }
        });

        // Prepare CSV content
        const csvHeader = 'id,email,first_name,last_name\n'; // Define the headers
        const csvRows = filteredUsers.map(user => {
            // Format each row with a comma followed by a space for clarity
            return `${user._id}, ${user.email}, ${user.firstname}, ${user.lastname}`;
        }).join('\n'); // Join rows with a newline

        const csvData = csvHeader + csvRows; // Combine header and rows

        // Set headers for the response
        res.header('Content-Type', 'text/csv');
        res.attachment('selected_users.txt'); // Set the attachment filename
        res.send(csvData); // Send the CSV data as a response
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/users-pagination', async (req,res)=>{
    try {
        const pageSize = req.query.pageSize || 5
        const pageIndex= req.query.pageIndex || 1

        const users = await User.find().skip(pageSize*pageIndex-pageSize).limit(pageSize)
        const count = await User.countDocuments()

        const totalPage = Math.ceil(count/pageSize)
        
        return res.status(200).json({
            users,
            count,
            pageSize,
            pageIndex,
            totalPage
        })

        
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "500 error server" })    }
})

module.exports = router




