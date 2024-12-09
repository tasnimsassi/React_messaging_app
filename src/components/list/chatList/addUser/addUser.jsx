import { arrayUnion, collection, getDocs, query, serverTimestamp, setDoc, updateDoc, where, doc, addDoc } from "firebase/firestore";
import "./addUser.css";
import { db } from "../../../../lib/firebase";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUser({
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data(),
        });
      } else {
        setUser(null);
        alert("User not found!");
      }
    } catch (err) {
      console.error("Error searching user:", err);
      alert("An error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!currentUser || !currentUser.id) {
      console.error("Current user is not defined");
      return;
    }
    if (!user || !user.id) {
      console.error("Selected user is not valid");
      alert("Please search for a valid user before adding.");
      return;
    }

    setLoading(true);
    try {
      const newChatRef = await addDoc(collection(db, "chats"), {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const chatData = {
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: user.id,
        updatedAt: Date.now(),
      };

      await updateDoc(doc(db, "userchats", user.id), {
        chats: arrayUnion({ ...chatData, receiverId: currentUser.id }),
      });

      await updateDoc(doc(db, "userchats", currentUser.id), {
        chats: arrayUnion(chatData),
      });

      console.log("User successfully added to chats!");
      alert("User successfully added to chats!");

      // Cacher la barre de recherche après l'ajout
      setUser(null);  // Réinitialiser l'état user pour cacher la barre de recherche
      setLoading(false);  // Réinitialiser l'état de chargement
    } catch (err) {
      console.error("Error adding user to chats:", err);
      alert("Unable to add user to chats. Please try again later.");
      setLoading(false); // S'assurer que le bouton de recherche ne reste pas bloqué
    }
  };

  return (
    <div className="addUser">
      {/* Si un utilisateur n'est pas sélectionné, afficher la barre de recherche */}
      {!user && (
        <form onSubmit={handleSearch}>
          <input type="text" placeholder="Username" name="username" disabled={loading} />
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      )}

      {/* Si un utilisateur est trouvé, afficher ses détails */}
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="User Avatar" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd} disabled={loading}>
            {loading ? "Adding..." : "Add User"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser; 