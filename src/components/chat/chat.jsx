import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { arrayUnion } from "firebase/firestore";
import upload from "../../lib/upload";

const Chat = () => { 
    const [chat, setChat] = useState();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const { chatId , user ,isCurrentUserBlocked , isReceiverBlocked  } = useChatStore();
    const endRef = useRef(null);
    const { currentUser } = useUserStore();
    const [img, setImg] = useState({
        file:null,
        url:"",

    });

    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
        setOpen(false);
    };

    const handleImg = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
          setImg({
            file,
            url: URL.createObjectURL(file)
          });
        } else {
          toast.error("Please upload a valid image.");
        }
      };





    const handleSend = async () => {
        if (text === "") return;
        let imgUrl = null
        try {

            if(img.file){
                imgUrl = await upload(img.file)
            }
            // Ajouter le message au chat
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    ...(imgUrl && {img: imgUrl}),
                }),
            });
    
            const userIDs = [currentUser.id, user.id];
            userIDs.forEach(async (id) => {
                const userchatsRef = doc(db, "userchats", id);
                const userChatsSnapshot = await getDoc(userchatsRef);
    
                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();
                    const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);
    
                    if (chatIndex !== -1) {
                        userChatsData.chats[chatIndex].lastMessage = text;
                        userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
                        userChatsData.chats[chatIndex].updatedAt = Date.now();
                        console.log("lastMessage updated:", userChatsData.chats[chatIndex].lastMessage);
                        // Mettre à jour le chat dans userchats
                        await updateDoc(userchatsRef, {
                            chats: userChatsData.chats,
                        });
                    }
                }
            });
        } catch (err) {
            console.log(err);
        }
        setImg({
            file:null,
            url:""
        })
        setText("");
    };
    

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data());
        });
        return () => {
            unSub();
        };
    }, [chatId]);

    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./avatar.png" }alt="" />
                    <div className="texts">
                        <span>{user?.username}</span>
                        <p>hello from here</p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="" />
                    <img src="./video.png" alt="" />
                    <img src="./info.png" alt="" />
                </div>
            </div>
            <div className="center">
            {chat?.messages?.map((message) => (
        <div className={`message ${message.senderId === currentUser.id ? "own" : ""}`} key={message?.createdAt}>
            <div className="texts">
                {message.img && <img src={message.img} alt="" />}
                <p>{message.text}</p>
            </div>
        </div>
    ))}

    {/* Affichage de la prévisualisation de l'image avant l'envoi */}
    {img.url && (
        <div className={currentUser.id === currentUser?.id ? "message own" : "message"} key={"image-preview"}>
            <div className="texts">
                <img src={img.url} alt="Image preview" />
            </div>
        </div>
    )}
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                    <img src="./camera.png" alt="" />
                    </label>
                    <input type="file" id="file" style={{display:"none"}} onChange={handleImg}/>
                    <img src="./phone.png" alt="" />
                    <img src="./mic.png" alt="" />
                </div>
                <input
                    type="text"
                    placeholder={(isCurrentUserBlocked || isReceiverBlocked) 
                    ? "you can not send a message ... "
                    :"type a message .."}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}
                />
                <div className="emoji">
                    <img
                        src="./emoji.png"
                        alt=""
                        onClick={() => setOpen((prev) => !prev)}
                    />
                    <div className="picker">
                        <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                    </div>
                </div>
                <button className="sendButton" onClick={handleSend}disabled={isCurrentUserBlocked || isReceiverBlocked}>send</button>
            </div>
        </div>
    );
};

export default Chat;
