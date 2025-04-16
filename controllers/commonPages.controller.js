export const signupPage = async(req,res) => {
    res.render("commonPages/signup")
}

export const otpVarificationPage = async(req,res) => {
    res.render("commonPages/otpVarification")
}

export const createProfilePage = async(req,res) => {
    res.render("commonPages/createProfile")
}

export const loginPage = async(req,res) => {
    res.render("commonPages/login")
}

export const forgotPasswordPage = async(req,res) => {
    res.render("commonPages/forgotPassword")
}