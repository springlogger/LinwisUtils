import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  
    const isUserAuthorized = ref(false);

    async function fetch(email: string, password: string) {

        console.log(email, password)
        // windowAPI.sendUserData({email, password});
        
        // windowAPI.fetchUserFromWindow((_, response) => {
        //     console.log(JSON.parse(response));
        // })
    }

    return {
        isUserAuthorized,
        fetch
    };
});

// if (import.meta.hot) {
//   import.meta.hot.accept(acceptHMRUpdate(useChatStore, import.meta.hot));
// }
