import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";



const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: ""
  });
  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setAvatar({
        file,
        url: URL.createObjectURL(file)
      });
    } else {
      toast.error("Please upload a valid image.");
    }
  };

  const handleLogin = async(e) => {
    e.preventDefault();
    setLoading(true)
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try{
        await signInWithEmailAndPassword(auth, email , password)
        toast.success("welcome homie! miss u");
    }catch(err){
        console.log(err)
        toast.error(err.message)
    }finally{
        setLoading(false)
    }

  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true)
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    try {
      // Création de l'utilisateur avec Firebase Auth
      const res = await createUserWithEmailAndPassword(auth, email, password);
      
      // Si un avatar a été sélectionné, l'envoyer à Cloudinary
      let imgUrl = "";
      if (avatar.file) {
        imgUrl = await upload(avatar.file);
      }

      // Enregistrement des données utilisateur dans Firestore
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,  // L'URL de l'image Cloudinary ou vide
        id: res.user.uid,
        blocked: [],
      });
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("Account created! You can login now");
    } catch (err) {
      console.log(err);
      toast.error(err.message || "An error occurred while registering.");
    }finally{
        setLoading(false)
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome back</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          <div className="upload-section">
            <img src={avatar.url || "./avatar.png"} alt="Avatar" className="avatar-preview" />
            <label htmlFor="file" className="upload-label">Upload an image</label>
            <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
          </div>
          <input type="text" placeholder="Username" name="username" />
          <input type="email" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={loading}>{loading ? "Loading" : "Sign up"}</button>
        </form>
      </div>
    </div>
  );
};

export default Login;    