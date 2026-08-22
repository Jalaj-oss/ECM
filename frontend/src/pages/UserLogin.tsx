

import{ Link,useNavigate } from "react-router-dom"
import { useState,type SubmitEvent } from "react"
const UserLogin = () => {
     const [email, setEmail]= useState("");
    const [password, setPassword]= useState("");
    const [emailError, setEmailError] = useState("")
const [passwordError, setPasswordError] = useState("")
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const navigate =useNavigate()
    const handleSubmit= async(e : SubmitEvent<HTMLFormElement>)=> {
      e.preventDefault()
      //email validation
 if(!email){
  setEmailError("Email is required");
 } else if(!emailPattern.test(email)){
  setEmailError("Please enter  a valid email");
 }
 else{
  setEmailError("");
 }
 //pass validation
 if(!password){
  setPasswordError("password is required");
 } else if(password.length<6){
  setPasswordError("must be equal or greator than 6 digits");
 }else{
  setPasswordError("");
 }

 if(
  !email ||!password ||!emailPattern.test(email) || password.length <6
 ){
  return
 }
try {
  const response = await fetch(
    "http://localhost:5000/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    alert(data.message);
    return;
  }

  // Ensuring this is a user account
  if (data.user.role !== "user") {
    alert("This account does not have user access");
    return;
  }

  // Save JWT
  localStorage.setItem("token", data.token);

  navigate("/user/dashboard");

} catch (error) {
  console.error("Login error:", error);
  alert("Unable to connect to server");
}
}
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-96 rounded-xl border p-8 shadow">
        <h1 className="text-2xl font-bold text-center">User Login</h1>
        <p className="mt-2 text-center text-gray-600">For User access </p>
        <form onSubmit={handleSubmit}className="mt-6">
            <div>
                <label className="block text-sm font-medium">Email: </label>
                <input type="email"  value={email} onChange={(e)=>{setEmail(e.target.value)
                  setEmailError("")
                }}placeholder="Enter Email" className="mt-2 w-full rounded-lg border p-2"/>
                {emailError && (
                  <p className="mt-1 text-sm text-red-500">{emailError}</p>
                )}
            </div>
            <div className="mt-6">
                <label className="block text-sm font-medium">Password: </label>
                <input type="password" value={password} onChange={(e)=>{setPassword(e.target.value)
                  setPasswordError("")
                }} placeholder="Enter Password" className="mt-2 w-full rounded-lg border p-2" />
                {passwordError && (
                  <p className="mt-1 text-sm text-red-500">{passwordError}</p>
                )}
            </div>
            <button type="submit" className="mt-6 w-full rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600">Login</button>
            <Link  to="/" className="mt-4 inline-block"> click to select account type</Link>
        </form>

      </div>
    </div>
  )
}

export default UserLogin
