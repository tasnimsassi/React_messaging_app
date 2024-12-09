import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";

import "./detail.css"
const Detail =()  => {
    const {chatId , user , isCurrentUserBlocked , isRecienverBlocked , changeBlock} = useChatStore();
    const {currentUser } = useUserStore(); 
    const handleBlock = async () => {
        if (!user) return;
        
    
        const userDocRef = doc(db, "users", currentUser.id);
    
        try {
            console.log("Current user blocked:", isRecienverBlocked);
            await updateDoc(userDocRef, {
                blocked: isRecienverBlocked
                    ? arrayRemove(user.id) // Si l'utilisateur est déjà bloqué, on le débloque
                    : arrayUnion(user.id),  // Sinon, on le bloque
            });
            changeBlock();
    
        } catch (err) {
            console.log("Error during block operation:", err);
        }
    };
    
    
    
    return (
        <div className ='detail'>
            <div className="user">
                <img src={user?.avatar || "./avatar.png"} alt=""/>
                <h2>{user?.username}</h2>
                <p>chat details</p>
            </div>
            <div className="info">
                <div className="option">
                    <div className="title">
                        <span>chat settings</span>
                        <img src="./arrowUp.png" alt=""/>
                    </div>
                </div>

                <div className="option">
                    <div className="title">
                        <span>Privacy & help </span>
                        <img src="./arrowUp.png" alt=""/>
                    </div>
                </div>

                <div className="option">
                    <div className="title">
                        <span>shared photos</span>
                        <img src="./arrowDown.png" alt=""/>
                    </div>
                    <div className="photos">
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://img.freepik.com/photos-gratuite/cascade-bateau-propre-chine-naturel-rural_1417-1356.jpg?t=st=1733518770~exp=1733522370~hmac=a689381b13c78c9c30ce87b6b3bf02165e3f1dc0171d57109977b8775d14e314&w=740" alt=""/> 
                                <span>photo_2024_2.png</span>   
                            </div>  
                            <img src="./download.png" alt=""className="icon"/>
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://img.freepik.com/photos-gratuite/belle-vue-vieille-ville_1417-1599.jpg?t=st=1733518828~exp=1733522428~hmac=cad7707021c94fbb82be3f4f1a0e1027d7c846e03b411b916c81a5c843cc35d0&w=740" alt=""/> 
                                <span>photo_2024_2.png</span>   
                            </div>  
                            <img src="./download.png" alt="" className="icon"/>
                        </div>
                    </div>
                </div>  
                <button onClick={handleBlock}>{
                    
                isCurrentUserBlocked 
                 ? "you are blocked"    
                 : isRecienverBlocked 
                 ? "user blocked " 
                 : "block User" 
                    }</button> 
                <button className="logout" onClick={()=>auth.signOut()}>logout</button>           
            </div>
        </div>
    );
  };
  
  export default Detail