import React, { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/addUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import { BackgroundColor } from "@cloudinary/url-gen/actions/background/actions/BackgroundColor";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input , setInput] = useState("")
  const { currentUser } = useUserStore();
  const { changeChat, chatId } = useChatStore();

  useEffect(() => {
    if (!currentUser || !currentUser.id) {
      console.warn("Current user is not defined.");
      return;
    }

    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        try {
          const data = res.data();
          if (!data || !data.chats) {
            setChats([]);
            return;
          }

          const items = data.chats;
          const promises = items.map(async (item) => {
            try {
              const userDocRef = doc(db, "users", item.receiverId);
              const userDocSnap = await getDoc(userDocRef);
              const user = userDocSnap.exists() ? userDocSnap.data() : null;
              return { ...item, user };
            } catch (err) {
              console.error("Error fetching user data:", err);
              return { ...item, user: null }; // Retourne l'item même si une erreur se produit
            }
          });

          const chatData = await Promise.all(promises);
          setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        } catch (err) {
          console.error("Error fetching chats:", err);
          setChats([]); // Réinitialiser les chats en cas d'erreur
        }
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]); /// a verifier caaaaaaaaaaaaaa na7i .id

const handleSelect = async(chat) => {
    const userChats = chats.map(item=>{
        const {user , ...rest} = item ;
        return rest ;
    })

    const chatIndex = userChats.findIndex(item=>item.chatId === chat.chatId)
    userChats[chatIndex].isSeen = true ;
    const  userchatsRef = doc(db,"userchats", currentUser.id)
    try{
        await updateDoc(userchatsRef, {
            chats: userChats,
        })
        changeChat(chat.chatId,chat.user)

    }catch(err){
        console.log(err)
    }
    
}

const filteredChats = chats.filter(c=> 
  c.user.username.toLowerCase().includes(input.toLowerCase())
)

  return (
    <div className="chatList">
      {/* Barre de recherche */}
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="Search Icon" />
          <input type="text" placeholder="Search" onChange={(e)=> setInput(e.target.value)} />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt="Toggle Icon"
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {/* Liste des chats */}
      {filteredChats.map((chat) => (
        <div className="item" key={chat.chatId} onClick={()=> handleSelect(chat)}
        style ={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe", 
        }}>
          <img src={chat.user.blocked.includes(currentUser.id) 
          ?  "./avatar.png" 
          : chat.user.avatar || "./avatar.png" } alt="Avatar" />
          <div className="texts">
            <span>{chat.user.blocked.includes(currentUser.id)
            ? "user"
            : chat.user.username}</span>
            <p>{chat.lastMessage || "No messages yet."}</p>
          </div>
        </div>
      ))}
      
      {/* Ajouter un utilisateur */}
      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
