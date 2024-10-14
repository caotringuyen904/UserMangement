import React, { useState } from "react"
import { signup } from "./apiService";

const Signup = ({ isOpenForm, closeForm, onUserAdded }) => {
    const [formData, SetFormData] = useState({
        email: "", firstname: "", lastname: "", password: "", retypepassword: ""
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        SetFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.retypepassword) {
            alert("Password do not match")
            return
        }


        const { retypepassword, ...dataToSubmit } = formData

        try {
            const result = await signup(dataToSubmit)
            console.log("1343434344")


            alert("User signed up to successfully")

            onUserAdded()

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            {isOpenForm && (
                <div className="form-popup">
                    <h1>SIGN UP FORM</h1>
                    <p>Fill in the form below to sign up a new user.</p>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <input placeholder="Email" type="text" id="email" name="email" required onChange={handleInputChange} value={formData.email} />
                        </div>

                        <div>
                            <input placeholder="firstname" type="text" id="firstname" name="firstname" required onChange={handleInputChange} value={formData.fristname} />
                        </div>

                        <div>
                            <input placeholder="lastname" type="text" id="lastname" name="lastname" required onChange={handleInputChange} value={formData.lastname} />
                        </div>

                        <div>
                            <input placeholder="password" type="password" id="password" name="password" required onChange={handleInputChange} value={formData.password} />
                        </div>

                        <div>
                            <input placeholder="retypepassword" type="password" id="retypepassword" name="retypepassword" required onChange={handleInputChange} value={formData.retypepassword} />
                        </div>
                        <button type="submit" className="btn">SIGN UP</button>
                        <button type="button" className="btn cancel" onClick={closeForm}>
                            CANCEL</button>
                    </form>
                </div>
            )}
        </>
    );
};

export default Signup;
