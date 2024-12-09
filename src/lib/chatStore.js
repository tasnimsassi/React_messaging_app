import { cat } from '@cloudinary/url-gen/qualifiers/focusOn'
import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand'
import { db } from './firebase';
import { useUserStore } from './userStore';

export const useChatStore = create((set) => ({
  chatId: null,
  user:null,
  isCurrentUserBlocked:false,
  isRecienverBlocked:false,
  changeChat:(chatId,user) =>{
    const currentUser = useUserStore.getState().currentUser

    //si current user blocked
    if(user.blocked.includes(currentUser.id)){
        return set({
            chatId,
            user:null,
            isCurrentUserBlocked:true,
            isRecienverBlocked:false,
        })
    }

    else if(currentUser.blocked.includes(user.id)){
        return set({
            chatId,
            user:null,
            isCurrentUserBlocked:false,
            isRecienverBlocked:true,
        })
    } else{
        return set({
            chatId,
            user,
            isCurrentUserBlocked:false,
            isRecienverBlocked:false,
        })
    }
 },
  
  changeBlock: ()=>{
    set((state)  => ({...state, isRecienverBlocked: !state.isRecienverBlocked}))
},

}))
